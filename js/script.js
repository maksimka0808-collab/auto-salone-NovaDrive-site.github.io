/* ===========================
   script.js — NovaDrive
   Полностью рабочий скрипт с поясняющими комментариями.
   Сохраните как: script.js
   Подключение: <script src="script.js"></script>
   =========================== */

/* ===========================
   Конфигурация / ключи localStorage
   =========================== */
const LS_USERS = 'nd_users_v1';
const LS_SESSION = 'nd_session_v1';

/* ===========================
   Утилиты
   =========================== */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from((ctx || document).querySelectorAll(s));
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

/* ===========================
   Демонстрационный бэкенд (localStorage)
   Методы: register, login, logout, currentUser
   =========================== */
const BackMock = {
  _getUsers() {
    try { return JSON.parse(localStorage.getItem(LS_USERS) || '[]'); }
    catch { return []; }
  },
  _setUsers(arr) { localStorage.setItem(LS_USERS, JSON.stringify(arr)); },

  register({name, email, pass}) {
    const users = this._getUsers();
    if (users.find(u => u.email === email)) throw new Error('Email уже зарегистрирован');
    const user = {id: Date.now(), name, email, pass};
    users.push(user); this._setUsers(users);
    localStorage.setItem(LS_SESSION, JSON.stringify({userId: user.id}));
    return user;
  },

  login({email, pass}) {
    const users = this._getUsers();
    const user = users.find(u => u.email === email && u.pass === pass);
    if (!user) throw new Error('Неверный email или пароль (демо)');
    localStorage.setItem(LS_SESSION, JSON.stringify({userId: user.id}));
    return user;
  },

  logout() { localStorage.removeItem(LS_SESSION); },

  currentUser() {
    try {
      const s = JSON.parse(localStorage.getItem(LS_SESSION) || 'null');
      if (!s) return null;
      const users = this._getUsers();
      return users.find(u => u.id === s.userId) || null;
    } catch { return null; }
  }
};

/* ===========================
   Настройка DOM-элементов (ссылки из HTML)
   =========================== */
const btnOpenLogin = $('#open-login');
const modalLogin = $('#login-modal');
const btnCloseLogin = $('#close-login');
const formLogin = $('#login-form');
const registerLink = $('#register-link');
const navLinks = $$('.nav-links a');
const heroTitle = $('.hero-text h1') || $('#home h1');
const hero = $('#home');
const contactForm = $('#contact-form');

/* ===========================
   1) PARTICLES — canvas background
   (анимация 1)
   =========================== */
(function particles() {
  // создаём canvas поверх hero (если есть)
  if (!hero) return;
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.zIndex = '0';
  canvas.style.pointerEvents = 'none';
  hero.style.position = 'relative';
  hero.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let W = canvas.width = hero.clientWidth;
  let H = canvas.height = hero.clientHeight;
  let particles = [];

  function resize() {
    W = canvas.width = hero.clientWidth;
    H = canvas.height = hero.clientHeight;
    // пересоздать частицы в новой области
    particles = Array.from({length: Math.max(12, Math.floor(W * H / 90000))}).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: 0.7 + Math.random() * 1.8
    }));
  }
  resize();
  window.addEventListener('resize', resize);

  function step() {
    ctx.clearRect(0, 0, W, H);
    for (let p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
      g.addColorStop(0, 'rgba(108,99,255,0.18)');
      g.addColorStop(1, 'rgba(108,99,255,0.0)');
      ctx.fillStyle = g;
      ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(step);
  }
  step();
})();

/* ===========================
   2) TYPING EFFECT — эффект печати в заголовке
   (анимация 2)
   =========================== */
(function typing() {
  if (!heroTitle) return;
  const phrases = [
    'Будущее начинается с NovaDrive',
    'Электромобили премиум-класса',
    'Технологии. Дизайн. Комфорт.'
  ];
  let pIndex = 0, chIndex = 0, forward = true;

  function tick() {
    const txt = phrases[pIndex];
    if (forward) {
      chIndex++;
      if (chIndex > txt.length) {
        forward = false;
        setTimeout(tick, 1100);
        return;
      }
    } else {
      chIndex--;
      if (chIndex === 0) {
        forward = true;
        pIndex = (pIndex + 1) % phrases.length;
      }
    }
    heroTitle.textContent = txt.slice(0, chIndex);
    setTimeout(tick, forward ? 55 : 25);
  }
  // старт чуть позже для плавного входа
  setTimeout(tick, 700);
})();

/* ===========================
   3) SMOOTH SCROLL & ACTIVE NAV HIGHLIGHT
   (анимация 3)
   =========================== */
(function navSmooth() {
  // плавный скролл
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      const target = (href === '#' || !href) ? document.body : document.querySelector(href);
      if (!target) return;
      target.scrollIntoView({behavior: 'smooth', block: 'start'});
      // мобильная логика: закрыть раскрытое меню, если есть (добавим класс)
      document.body.classList.remove('nav-open');
    });
  });

  // подсветка активного пункта при скролле
  const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  function onScroll() {
    const y = window.scrollY + window.innerHeight / 3;
    let activeIndex = 0;
    sections.forEach((sec, i) => {
      if (sec.offsetTop <= y) activeIndex = i;
    });
    navLinks.forEach((a, i) => a.classList.toggle('active', i === activeIndex));
  }
  window.addEventListener('scroll', onScroll);
  onScroll();
})();

/* ===========================
   4) SCROLL REVEAL (появление элементов при прокрутке)
   (анимация 4)
   =========================== */
(function revealOnScroll() {
  const items = $$('h2, .car-card, .about-text, .hero-text, .footer form');
  const obs = new IntersectionObserver((entries) => {
    for (let e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('visible'); // CSS-шаблон ожидает .visible
        obs.unobserve(e.target);
      }
    }
  }, { threshold: 0.15 });
  items.forEach(el => { el.classList.add('pre-reveal'); obs.observe(el); });
})();

/* ===========================
   5) LAZY LOAD IMAGES
   (анимация 5 — подгрузка по мере появления)
   =========================== */
(function lazyLoad() {
  const imgs = $$('img');
  const obs = new IntersectionObserver((entries) => {
    for (let e of entries) {
      if (e.isIntersecting) {
        const img = e.target;
        const src = img.getAttribute('data-src') || img.src;
        if (img.getAttribute('data-src')) img.src = src;
        img.classList.add('loaded');
        obs.unobserve(img);
      }
    }
  }, { rootMargin: '80px' });
  imgs.forEach(i => obs.observe(i));
})();

/* ===========================
   6) CARD TILT / PARALLAX (наведение на карточки авто)
   (анимация 6)
   =========================== */
(function cardTilt() {
  const cards = $$('.car-card');
  // для каждого элемента навесим mousemove и mouseleave
  cards.forEach(card => {
    const rect = () => card.getBoundingClientRect();

    function onMove(e) {
      const r = rect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / (r.width / 2);
      const dy = (e.clientY - cy) / (r.height / 2);
      const tiltX = dy * -6; // угол наклона по X
      const tiltY = dx * 10; // угол наклона по Y
      card.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
      // лёгкий параллакс изображения внутри
      const img = card.querySelector('img');
      if (img) img.style.transform = `translate(${dx * 6}px, ${dy * 6}px) scale(1.02)`;
    }

    function onLeave() {
      card.style.transform = '';
      const img = card.querySelector('img');
      if (img) img.style.transform = '';
      // вернуть плавно
      card.style.transition = 'transform 400ms cubic-bezier(.2,.9,.2,1)';
      setTimeout(() => card.style.transition = '', 420);
    }

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
  });
})();

/* ===========================
   7) MOBILE CAROUSEL (для маленьких экранов)
   swipe + кнопки
   (анимация 7)
   =========================== */
(function mobileCarousel() {
  const grid = $('.car-grid');
  if (!grid) return;
  let isTouch = false;
  // отображаем стрелки только на мобильных
  function setup() {
    if (window.innerWidth <= 760 && !document.querySelector('.carousel-controls')) {
      grid.style.display = 'flex';
      grid.style.overflowX = 'auto';
      grid.style.scrollSnapType = 'x mandatory';
      grid.querySelectorAll('.car-card').forEach(c => c.style.scrollSnapAlign = 'center');

      // Добавим подсказку управления (необязательно)
      const controls = document.createElement('div');
      controls.className = 'carousel-controls';
      controls.innerHTML = `<button class="prev small btn ghost">‹</button><button class="next small btn ghost">›</button>`;
      grid.parentNode.insertBefore(controls, grid.nextSibling);

      const prev = controls.querySelector('.prev');
      const next = controls.querySelector('.next');

      prev.addEventListener('click', () => grid.scrollBy({left: -grid.clientWidth * 0.8, behavior: 'smooth'}));
      next.addEventListener('click', () => grid.scrollBy({left: grid.clientWidth * 0.8, behavior: 'smooth'}));
    } else {
      // вернуть грид как был
      grid.style.display = '';
      grid.style.overflowX = '';
      grid.style.scrollSnapType = '';
      $$('.carousel-controls').forEach(n => n.remove());
      $$('.car-card').forEach(c => c.style.scrollSnapAlign = '');
    }
  }
  setup();
  window.addEventListener('resize', setup);
})();

/* ===========================
   8) BUTTON RIPPLE — эффект рипла при клике
   (анимация 8)
   =========================== */
(function buttonRipple() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.btn');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height) * 1.8;
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    target.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
  // CSS for .ripple is expected in stylesheet (simple circle, fade)
})();

/* ===========================
   9) LOGIN / REGISTER MODAL
   Модал открывает форму входа; регистрация в той же форме (toggle)
   + анимация тряски при ошибке
   (анимация 9)
   =========================== */
(function authModal() {
  if (!btnOpenLogin || !modalLogin) return;
  // helper: show / hide
  function showModal() { modalLogin.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
  function hideModal() { modalLogin.classList.add('hidden'); document.body.style.overflow = ''; }

  on(btnOpenLogin, 'click', (e) => { e.preventDefault(); showModal(); });
  on(btnCloseLogin, 'click', hideModal);

  // Переключение регистрации (в нашем HTML у нас только вход — сделаем client-side переключение)
  on(registerLink, 'click', (e) => {
    e.preventDefault();
    const form = formLogin;
    // если у нас есть скрытый блок регистрации — можно переключать; сделаем простую промпт-подмену
    const name = prompt('Регистрация (демо).\nВведите имя для аккаунта:');
    if (!name) return;
    const email = prompt('Введите email (демо):');
    if (!email) return;
    const pass = prompt('Введите пароль (мин 4 символа):');
    if (!pass || pass.length < 4) { alert('Пароль слишком короткий (демо)'); return; }
    try {
      const user = BackMock.register({name, email, pass});
      alert('Зарегистрирован: ' + user.name + '\n(демо-сессия сохранена в localStorage)');
      hideModal();
      updateAuthUI();
    } catch (err) {
      shakeModal(); alert(err.message);
    }
  });

  // submit login
  on(formLogin, 'submit', (e) => {
    e.preventDefault();
    const em = (formLogin.querySelector('#username').value || '').trim();
    const pw = (formLogin.querySelector('#password').value || '').trim();
    try {
      const user = BackMock.login({email: em, pass: pw});
      alert('Привет, ' + user.name + ' (демо-вход)');
      hideModal();
      updateAuthUI();
    } catch (err) {
      shakeModal();
      alert(err.message);
    }
  });

  // визуальная тряска модалки
  function shakeModal() {
    const box = modalLogin.querySelector('.modal-content');
    if (!box) return;
    box.animate([
      { transform: 'translateX(-8px)' },
      { transform: 'translateX(8px)' },
      { transform: 'translateX(0)' }
    ], { duration: 320, easing: 'cubic-bezier(.2,.9,.2,1)' });
  }

  // при загрузке — обновим UI (если уже вошли)
  function updateAuthUI() {
    const user = BackMock.currentUser();
    if (user) {
      // заменим кнопку входа на приветствие
      btnOpenLogin.textContent = `Привет, ${user.name}`;
      btnOpenLogin.classList.add('logged');
      // добавим кнопку выйти
      if (!$('#logout-btn')) {
        const out = document.createElement('button');
        out.id = 'logout-btn';
        out.className = 'btn small ghost';
        out.textContent = 'Выйти';
        btnOpenLogin.after(out);
        out.addEventListener('click', () => {
          BackMock.logout();
          location.reload();
        });
      }
    }
  }
  updateAuthUI();
})();

/* ===========================
   10) CONTACT FORM — валидация и красивая отправка
   (анимация 10)
   =========================== */
(function contactFormHandler() {
  if (!contactForm) return;
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (contactForm.querySelector('input[type=text]') || {}).value || '';
    const email = (contactForm.querySelector('input[type=email]') || {}).value || '';
    const msg = (contactForm.querySelector('textarea') || {}).value || '';
    if (name.trim().length < 2) { animateFieldError(contactForm.querySelector('input[type=text]')); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { animateFieldError(contactForm.querySelector('input[type=email]')); return; }
    if (msg.trim().length < 6) { animateFieldError(contactForm.querySelector('textarea')); return; }

    // имитация отправки — показываем маленькую анимацию успеха
    const submitBtn = contactForm.querySelector('button');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';
    submitBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.96)' }, { transform: 'scale(1)' }], { duration: 600 });
    setTimeout(() => {
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить';
      // легкая подсказка об успехе
      alert('Сообщение отправлено (демо). Спасибо!');
    }, 900);
  });

  function animateFieldError(field) {
    if (!field) return;
    field.animate([
      { transform: 'translateX(-6px)' },
      { transform: 'translateX(6px)' },
      { transform: 'translateX(0)' }
    ], { duration: 320 });
    field.focus();
  }
})();

/* ===========================
   11) DYNAMIC KPI COUNTERS — создаём и анимируем числа
   (анимация 11)
   =========================== */
(function kpiCounters() {
  // добавим небольшой блок KPI в hero (если есть)
  if (!hero) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'kpi-wrapper';
  wrapper.innerHTML = `
    <div class="kpi-item"><div class="kpi-value" data-target="1248">0</div><div class="kpi-label">Продано</div></div>
    <div class="kpi-item"><div class="kpi-value" data-target="842">0</div><div class="kpi-label">Клиенты</div></div>
    <div class="kpi-item"><div class="kpi-value" data-target="98">0</div><div class="kpi-label">Рейтинг</div></div>
  `;
  // поместим в hero-text
  const text = $('.hero-text') || hero.querySelector('.hero-text');
  if (text) text.appendChild(wrapper);

  // анимация count-up при попадании в зону
  const values = $$('.kpi-value', wrapper);
  const obs = new IntersectionObserver((entries) => {
    for (let e of entries) {
      if (e.isIntersecting) {
        const el = e.target;
        const target = +el.dataset.target;
        let cur = 0;
        const step = Math.max(1, Math.floor(target / 80));
        function tick() {
          cur += step;
          if (cur >= target) {
            el.textContent = target;
            return;
          }
          el.textContent = cur;
          requestAnimationFrame(tick);
        }
        tick();
        obs.unobserve(el);
      }
    }
  }, { threshold: 0.5 });

  values.forEach(v => obs.observe(v));
})();

/* ===========================
   12) POLISH: add small CSS tweaks by JS (in case user didn't include)
   - добавим стили для ripple & reveal если их нет
   =========================== */
(function ensureStyles() {
  const id = 'nd-dynamic-styles';
  if ($('#' + id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    .pre-reveal { opacity: 0; transform: translateY(18px); transition: all 700ms cubic-bezier(.2,.9,.2,1); }
    .pre-reveal.visible { opacity: 1; transform: translateY(0); }
    .kpi-wrapper { display:flex; gap:18px; margin-top:18px; align-items:center; flex-wrap:wrap; }
    .kpi-item { background: rgba(255,255,255,0.03); padding:8px 12px; border-radius:12px; min-width:90px; text-align:center; }
    .kpi-value { font-weight:700; font-size:1.1rem; color: #fff; }
    .kpi-label { font-size:0.85rem; color: rgba(255,255,255,0.6); }
    .ripple { position:absolute; pointer-events:none; border-radius:50%; transform:scale(0); opacity:0.75; background: rgba(255,255,255,0.18); animation: ripple-ani 560ms ease-out; }
    @keyframes ripple-ani { to { transform:scale(1); opacity: 0; } }
    .btn { position: relative; overflow: hidden; } /* чтобы рипл не выходил */
    .car-grid { gap: 26px; }
    .hero { min-height: 64vh; }
    .nav-links a.active { color: var(--accent2); text-decoration: underline; text-underline-offset: 6px; }
  `;
  document.head.appendChild(style);
})();

// ============================
// Анимации при загрузке страницы
// ============================
document.addEventListener("DOMContentLoaded", () => {
    const fadeElements = document.querySelectorAll(".fade-in");
    fadeElements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add("visible");
        }, index * 300);
    });
});

// ============================
// Меню адаптивное (бургер)
// ============================
        document.querySelector('.burger').addEventListener('click', function() {
            this.classList.toggle('active');
            document.querySelector('.nav-links').classList.toggle('open');
        })

// ============================
// Анимация при скролле
// ============================
window.addEventListener("scroll", () => {
    const elements = document.querySelectorAll(".scroll-anim");
    elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            el.classList.add("active");
        }
    });
});



// ============================
// Анимация кнопки при наведении
// ============================
const buttons = document.querySelectorAll("button");
buttons.forEach(btn => {
    btn.addEventListener("mouseenter", () => {
        btn.style.transform = "scale(1.1)";
    });
    btn.addEventListener("mouseleave", () => {
        btn.style.transform = "scale(1)";
    });
});

// ============================
// Псевдо-бэкенд: регистрация и вход
// ============================
const registerForm = document.querySelector("#register-form");
const loginForm = document.querySelector("#login-form");
const users = {}; // объект, имитирующий базу данных

if (registerForm) {
    registerForm.addEventListener("submit", e => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        if (!email || !password) {
            alert("Заполните все поля!");
            return;
        }
        if (users[email]) {
            alert("Такой пользователь уже существует!");
            return;
        }
        users[email] = password;
        alert("Регистрация успешна!");
        e.target.reset();
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", e => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        if (users[email] && users[email] === password) {
            alert("Вход выполнен успешно!");
        } else {
            alert("Неверный логин или пароль!");
        }
    });
};

 // Accordion
    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            const openItem = document.querySelector('.accordion-item.active');

            if (openItem && openItem !== item) {
                openItem.classList.remove('active');
                openItem.querySelector('.accordion-content').style.maxHeight = 0;
            }
            item.classList.toggle('active');
            const content = item.querySelector('.accordion-content');
            if (item.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                content.style.maxHeight = 0;
            }
        });
    });

document.getElementById("catalogBtn").addEventListener("click", () => {
  document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("aboutBtn").addEventListener("click", () => {
  document.getElementById("about").scrollIntoView({ behavior: "smooth" });
  });

   // Slider
    const sliderWrapper = document.querySelector('.slider-wrapper');
    if (sliderWrapper) {
        const slides = document.querySelectorAll('.slide');
        const nextBtn = document.querySelector('.next');
        const prevBtn = document.querySelector('.prev');
        let currentIndex = 0;
        const totalSlides = slides.length;

        function goToSlides(index) {
            if (index < 0) {
                index = totalSlides - 1;
            } else if (index >= totalSlides) {
                index = 0;
            }
            sliderWrapper.style.transform = `translateX(-${index * 100}%)`;
            currentIndex = index;
        }

        nextBtn.addEventListener('click', () => {
            goToSlides(currentIndex + 1);
        })
        prevBtn.addEventListener('click', () => {
            goToSlides(currentIndex - 1);
        })

        setInterval(() => {
            goToSlides(currentIndex + 1);
        }, 5000);
    }

     document.getElementById("contactBtn").addEventListener("click", () => {
  document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
  });
/* ===========================
   Итого: в этом скрипте реализовано > 10 визуальных эффектов и
   демонстрационных интерактивов, а также демо-бэкенд на localStorage.
   Комментарии внутри кода объясняют каждую часть — удобно для защиты.
   =========================== */
