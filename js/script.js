const CONFIG = {
  CLIENT_ID: '1042964850310-g3jqu4hpqr8bfumtul2cg7k6hcvpv8d6.apps.googleusercontent.com',
  SCOPE: 'https://www.googleapis.com/auth/calendar.events',
  GITHUB_USER: 'Mattias1610',
  CONTACT_EMAIL: 'dobaimattiasfx@gmail.com',
  REPO_PAGE: 6,
  EVENT_PAGE: 6,
  MIN_ENTRIES: 5,
  TZ: 'Europe/Bucharest',
  CACHE_MS: 10 * 60 * 1000
};

const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Java: '#b07219',
  Python: '#3572A5',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  HTML: '#e34c26',
  CSS: '#563d7c',
  PHP: '#4F5D95',
  Shell: '#89e051',
  Go: '#00ADD8',
  Rust: '#dea584',
  Vue: '#41b883',
  Dart: '#00B4AB',
  Kotlin: '#A97BFF',
  'Jupyter Notebook': '#DA5B0B',
  Assembly: '#6E4C13'
};

const ICONS = {
  repo: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5z"/></svg>',
  arrow: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5 11l6-6M5 5h6v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  star: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 1l2 4.5 5 .5-3.7 3.3L12.5 15 8 12.3 3.5 15l1.2-5.7L1 6l5-.5L8 1z"/></svg>',
  fork: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="4" cy="3" r="1.6" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="3" r="1.6" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="13" r="1.6" stroke="currentColor" stroke-width="1.3"/><path d="M4 4.6V6a2 2 0 002 2h4a2 2 0 002-2V4.6M8 8v3.4" stroke="currentColor" stroke-width="1.3"/></svg>',
  clock: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.3" stroke="currentColor" stroke-width="1.3"/><path d="M8 4.5V8l2.5 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  pin: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 14s5-4.5 5-8A5 5 0 003 6c0 3.5 5 8 5 8z" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="6" r="1.8" stroke="currentColor" stroke-width="1.3"/></svg>',
  edit: '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M11.5 3.5l3 3L6 15l-3.5.5L3 12l8.5-8.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  trash: '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 5h12M7 5V3h4v2M5 5l.7 10h6.6L13 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

const WEEKDAYS = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
const MONTHS = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'];

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const relativeTime = new Intl.RelativeTimeFormat('ro', { numeric: 'auto' });

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const store = {
  get(area, key) {
    try {
      return window[area].getItem(key);
    } catch {
      return null;
    }
  },
  set(area, key, value) {
    try {
      window[area].setItem(key, value);
    } catch {
      return;
    }
  },
  remove(area, key) {
    try {
      window[area].removeItem(key);
    } catch {
      return;
    }
  }
};

let revealObserver = null;

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeader();
  initSmoothScroll();
  initScrollAnimations();
  initBackToTop();
  initHome();
  initProjects();
  initContactForm();
  initCalendar();
});

function initMobileMenu() {
  const hamburger = $('.hamburger');
  const navMenu = $('.nav-menu');
  if (!hamburger || !navMenu) return;

  const setOpen = open => {
    hamburger.classList.toggle('active', open);
    navMenu.classList.toggle('active', open);
    document.body.classList.toggle('menu-open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul');
  };

  hamburger.addEventListener('click', () => setOpen(!navMenu.classList.contains('active')));
  $$('.nav-link', navMenu).forEach(link => link.addEventListener('click', () => setOpen(false)));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      setOpen(false);
      hamburger.focus();
    }
  });

  window.matchMedia('(min-width: 769px)').addEventListener('change', e => {
    if (e.matches) setOpen(false);
  });
}

function initHeader() {
  const header = $('.header');
  if (!header) return;
  const update = () => header.classList.toggle('scrolled', window.scrollY > 10);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initSmoothScroll() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    const target = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
    if (!target) return;
    e.preventDefault();
    scrollToElement(target);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    history.pushState(null, '', hash);
  });
}

function scrollToElement(element) {
  const offset = ($('.header')?.offsetHeight || 0) + 16;
  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(top, 0), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
}

function initScrollAnimations() {
  const items = $$('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion.matches) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }

  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => revealObserver.observe(el));
}

function observeReveal(elements) {
  elements.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.setProperty('--delay', `${Math.min(i, 6) * 70}ms`);
    if (revealObserver) revealObserver.observe(el);
    else el.classList.add('visible');
  });
}

function initBackToTop() {
  const button = $('.to-top');
  if (!button) return;
  const update = () => button.classList.toggle('show', window.scrollY > 600);
  update();
  window.addEventListener('scroll', update, { passive: true });
  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    $('#main')?.focus({ preventScroll: true });
  });
}

async function fetchRepos() {
  const cacheKey = `gh_repos_${CONFIG.GITHUB_USER}`;
  try {
    const cached = JSON.parse(store.get('sessionStorage', cacheKey));
    if (cached && Date.now() - cached.time < CONFIG.CACHE_MS) return cached.data;
  } catch {
    store.remove('sessionStorage', cacheKey);
  }

  let res;
  try {
    res = await fetch(`https://api.github.com/users/${CONFIG.GITHUB_USER}/repos?sort=updated&per_page=100`);
  } catch {
    throw new Error('Ups! Nu am putut încărca proiectele momentan. Verifică conexiunea la internet.');
  }
  if (res.status === 404) throw new Error('Utilizatorul GitHub nu a fost găsit.');
  if (res.status === 403 || res.status === 429) throw new Error('Limita de cereri către GitHub a fost atinsă. Încearcă din nou peste câteva minute.');
  if (!res.ok) throw new Error(`Ups! Nu am putut încărca proiectele momentan (eroare ${res.status}).`);

  const repos = (await res.json())
    .filter(repo => !repo.fork)
    .map(repo => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      url: repo.html_url,
      updated: repo.pushed_at || repo.updated_at
    }))
    .sort((a, b) => b.stars - a.stars || new Date(b.updated) - new Date(a.updated));

  store.set('sessionStorage', cacheKey, JSON.stringify({ time: Date.now(), data: repos }));
  return repos;
}

function repoCard(repo) {
  const card = document.createElement('a');
  card.className = 'repo';
  card.href = repo.url;
  card.target = '_blank';
  card.rel = 'noopener';
  const color = LANG_COLORS[repo.language] || 'var(--color-accent)';
  card.innerHTML = `
    <div class="repo-top">
      <h3 class="repo-name">${ICONS.repo}${esc(repo.name)}</h3>
      <span class="repo-arrow">${ICONS.arrow}</span>
    </div>
    <p class="repo-desc${repo.description ? '' : ' empty'}">${esc(repo.description || 'Fără descriere disponibilă.')}</p>
    <div class="repo-meta">
      <span class="repo-lang"><span class="lang-dot" style="background:${color}"></span>${esc(repo.language || 'Nespecificat')}</span>
      <span class="repo-stat" title="Stele">${ICONS.star}<span class="sr-only">Stele:</span> ${repo.stars}</span>
      <span class="repo-stat" title="Fork-uri">${ICONS.fork}<span class="sr-only">Fork-uri:</span> ${repo.forks}</span>
      <span class="repo-stat" title="Ultima actualizare">${ICONS.clock}${relTime(new Date(repo.updated))}</span>
    </div>`;
  return card;
}

async function initHome() {
  const recent = $('#recentRepos');
  const count = $('#repoCount');
  if (!recent && !count) return;

  try {
    const repos = await fetchRepos();
    if (count) count.textContent = repos.length;
    if (!recent) return;
    recent.innerHTML = '';
    if (!repos.length) {
      recent.innerHTML = '<div class="st"><span class="ico" aria-hidden="true">✦</span><span>Nu există încă proiecte publice.</span></div>';
      return;
    }
    const latest = [...repos].sort((a, b) => new Date(b.updated) - new Date(a.updated)).slice(0, 3);
    const cards = latest.map(repoCard);
    recent.append(...cards);
    observeReveal(cards);
  } catch (err) {
    if (count) count.textContent = '—';
    if (recent) {
      recent.innerHTML = `
        <div class="st">
          <span class="ico" aria-hidden="true">⚠️</span>
          <span>${esc(err.message)}</span>
          <a class="btn btn-out btn-sm" href="https://github.com/${CONFIG.GITHUB_USER}" target="_blank" rel="noopener">Vezi direct pe GitHub</a>
        </div>`;
    }
  } finally {
    recent?.setAttribute('aria-busy', 'false');
  }
}

function initProjects() {
  const grid = $('#repos');
  if (!grid) return;

  const state = { repos: [], filter: 'all', query: '', expanded: false };
  const elements = {
    load: $('#repoLoad'),
    err: $('#repoErr'),
    errMsg: $('#repoErrMsg'),
    empty: $('#repoEmpty'),
    filters: $('#filters'),
    buttons: $('#filterBtns'),
    search: $('#repoSearch'),
    info: $('#resultsInfo'),
    toggle: $('#repoToggle'),
    toggleBtn: $('#repoToggleBtn')
  };

  const languageOf = repo => repo.language || 'Nespecificat';

  const matches = repo => {
    const okLanguage = state.filter === 'all' || languageOf(repo) === state.filter;
    const okQuery = !state.query
      || repo.name.toLowerCase().includes(state.query)
      || (repo.description || '').toLowerCase().includes(state.query);
    return okLanguage && okQuery;
  };

  const buildFilters = () => {
    const counts = state.repos.reduce((acc, repo) => {
      const lang = languageOf(repo);
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {});
    const languages = Object.keys(counts).sort((a, b) =>
      (a === 'Nespecificat') - (b === 'Nespecificat') || counts[b] - counts[a] || a.localeCompare(b)
    );
    elements.buttons.innerHTML = '';
    [['all', 'Toate', state.repos.length], ...languages.map(lang => [lang, lang, counts[lang]])].forEach(([value, label, n]) => {
      const button = document.createElement('button');
      const active = value === state.filter;
      button.type = 'button';
      button.className = `filter-btn${active ? ' active' : ''}`;
      button.dataset.filter = value;
      button.setAttribute('aria-pressed', String(active));
      button.innerHTML = `${esc(label)} <span class="count">${n}</span>`;
      elements.buttons.appendChild(button);
    });
  };

  const render = () => {
    const list = state.repos.filter(matches);
    const visible = state.expanded ? list : list.slice(0, CONFIG.REPO_PAGE);
    grid.innerHTML = '';
    const cards = visible.map(repoCard);
    grid.append(...cards);
    observeReveal(cards);
    elements.empty.hidden = list.length > 0;
    elements.info.textContent = list.length ? `Afișez ${visible.length} din ${plural(list.length, 'proiect', 'proiecte')}` : '';
    elements.toggle.hidden = list.length <= CONFIG.REPO_PAGE;
    elements.toggleBtn.textContent = state.expanded ? 'Arată mai puține' : `Vezi toate proiectele (${list.length})`;
    elements.toggleBtn.setAttribute('aria-expanded', String(state.expanded));
  };

  const showStatus = status => {
    elements.load.hidden = status !== 'load';
    elements.err.hidden = status !== 'err';
  };

  async function load() {
    showStatus('load');
    elements.filters.hidden = true;
    elements.empty.hidden = true;
    elements.toggle.hidden = true;
    grid.innerHTML = '';
    try {
      state.repos = await fetchRepos();
      if (!state.repos.length) {
        elements.errMsg.textContent = 'Nu există încă repository-uri publice.';
        showStatus('err');
        return;
      }
      showStatus('none');
      elements.filters.hidden = false;
      buildFilters();
      render();
    } catch (err) {
      elements.errMsg.textContent = err.message;
      showStatus('err');
    }
  }

  elements.buttons.addEventListener('click', e => {
    const button = e.target.closest('.filter-btn');
    if (!button) return;
    state.filter = button.dataset.filter;
    state.expanded = false;
    $$('.filter-btn', elements.buttons).forEach(btn => {
      const active = btn === button;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    render();
  });

  elements.search.addEventListener('input', debounce(() => {
    state.query = elements.search.value.trim().toLowerCase();
    state.expanded = false;
    render();
  }, 150));

  elements.toggleBtn.addEventListener('click', () => {
    state.expanded = !state.expanded;
    render();
    if (!state.expanded) scrollToElement(elements.filters);
  });

  $('#repoReset').addEventListener('click', () => {
    state.filter = 'all';
    state.query = '';
    state.expanded = false;
    elements.search.value = '';
    buildFilters();
    render();
    elements.search.focus();
  });

  $('#repoRetry').addEventListener('click', load);

  load();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE = /^[\p{L}\s]+$/u;
const PHONE_RE = /^\+?[\d\s\-()]+$/;

const CONTACT_RULES = {
  name(value) {
    if (!value) return 'Te rog să îți scrii numele.';
    if (value.length < 2) return 'Numele trebuie să aibă cel puțin 2 caractere.';
    if (!NAME_RE.test(value)) return 'Numele poate conține doar litere și spații.';
    return '';
  },
  email(value) {
    if (!value) return 'Te rog să îți scrii adresa de email.';
    if (!EMAIL_RE.test(value)) return 'Adresa de email nu pare validă (ex: nume@exemplu.ro).';
    return '';
  },
  phone(value) {
    if (!value) return '';
    if (!PHONE_RE.test(value)) return 'Telefonul poate conține doar cifre, spații, cratime și paranteze.';
    const digits = value.replace(/\D/g, '').length;
    if (digits < 7 || digits > 15) return 'Numărul de telefon trebuie să aibă între 7 și 15 cifre.';
    return '';
  },
  subject(value) {
    return value ? '' : 'Alege subiectul mesajului.';
  },
  message(value) {
    if (!value) return 'Te rog să scrii un mesaj.';
    if (value.length < 10) {
      const missing = 10 - value.length;
      return `Mesajul e prea scurt: mai scrie cel puțin ${missing} ${missing === 1 ? 'caracter' : 'caractere'}.`;
    }
    if (value.length > 1000) return 'Mesajul poate avea cel mult 1000 de caractere.';
    return '';
  }
};

function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  const fields = Object.keys(CONTACT_RULES).map(name => form.elements[name]);
  const touched = new Set();
  const counter = $('#message-counter');
  const success = $('#formSuccess');
  const error = $('#formError');

  const validateField = field => {
    const value = field.value.trim();
    const message = CONTACT_RULES[field.name](value);
    const wrapper = field.closest('.field');
    $(`#${field.name}-error`).textContent = message;
    wrapper.classList.toggle('invalid', Boolean(message));
    wrapper.classList.toggle('valid', !message && value !== '');
    field.setAttribute('aria-invalid', String(Boolean(message)));
    return !message;
  };

  const updateCounter = () => {
    const length = form.elements.message.value.length;
    counter.textContent = `${length} / 1000`;
    counter.classList.toggle('warn', length >= 900 && length <= 1000);
    counter.classList.toggle('over', length > 1000);
  };

  const clearField = field => {
    field.closest('.field').classList.remove('valid', 'invalid');
    field.removeAttribute('aria-invalid');
    $(`#${field.name}-error`).textContent = '';
  };

  fields.forEach(field => {
    field.addEventListener('input', () => {
      if (field.name === 'message') updateCounter();
      success.classList.remove('show');
      if (touched.has(field.name)) validateField(field);
    });
    field.addEventListener('change', () => {
      if (field.tagName !== 'SELECT') return;
      touched.add(field.name);
      validateField(field);
    });
    field.addEventListener('blur', () => {
      if (field.value.trim()) touched.add(field.name);
      if (touched.has(field.name)) validateField(field);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    success.classList.remove('show');
    error.classList.remove('show');
    fields.forEach(field => touched.add(field.name));

    const invalid = fields.filter(field => !validateField(field));
    if (invalid.length) {
      $('#formErrorMsg').textContent = invalid.length === 1
        ? 'Un câmp trebuie corectat înainte de trimitere.'
        : `${invalid.length} câmpuri trebuie corectate înainte de trimitere.`;
      error.classList.add('show');
      invalid[0].focus();
      return;
    }

    const data = Object.fromEntries(fields.map(field => [field.name, field.value.trim()]));
    const subjectText = form.elements.subject.selectedOptions[0].textContent;
    const lines = [data.message, '', `— ${data.name}`, data.email];
    if (data.phone) lines.push(data.phone);
    const mailto = `mailto:${CONFIG.CONTACT_EMAIL}?subject=${encodeURIComponent(`[Portofoliu] ${subjectText}`)}&body=${encodeURIComponent(lines.join('\n'))}`;

    $('#formSuccessMsg').textContent = `Mulțumesc, ${data.name.split(/\s+/)[0]}! Mesajul e pregătit în aplicația ta de email — verifică-l și apasă „Trimite”.`;
    success.classList.add('show');
    success.focus();
    window.location.href = mailto;

    form.reset();
    touched.clear();
    fields.forEach(clearField);
    updateCounter();
  });
}

const GCAL_BASE = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const DEMO_KEY = 'demo_calendar_events';
const TOKEN_KEY = 'g_tok';

const calendarState = {
  tokenClient: null,
  token: null,
  all: [],
  filtered: [],
  page: 0,
  range: 'all',
  fetching: false,
  editId: null,
  lastFocus: null
};

function initCalendar() {
  if (!$('#crudPanel')) return;

  $('#authBtn').addEventListener('click', handleAuth);
  $('#authWallBtn').addEventListener('click', handleAuth);
  $('#searchInput').addEventListener('input', debounce(applyEventFilters, 150));
  $('#sortSel').addEventListener('change', applyEventFilters);
  $('#addEventBtn').addEventListener('click', () => openEventModal());
  $('#emptyAddBtn').addEventListener('click', () => openEventModal());
  $('#retryBtn').addEventListener('click', loadEvents);
  $('#demoAddBtn').addEventListener('click', addDemoData);
  $('#demoClearBtn').addEventListener('click', clearDemoData);
  $('#prevBtn').addEventListener('click', () => changePage(-1));
  $('#nextBtn').addEventListener('click', () => changePage(1));
  $$('.rchip').forEach(chip => chip.addEventListener('click', () => setRange(chip)));

  $('#eventForm').addEventListener('submit', e => {
    e.preventDefault();
    saveEvent();
  });
  $('#mClose').addEventListener('click', closeEventModal);
  $('#mCancel').addEventListener('click', closeEventModal);
  $('#confCancel').addEventListener('click', closeConfirm);
  $('#ov').addEventListener('click', e => {
    if (e.target.id === 'ov') closeEventModal();
  });
  $('#ovConfirm').addEventListener('click', e => {
    if (e.target.id === 'ovConfirm') closeConfirm();
  });

  $('#agenda').addEventListener('click', e => {
    const button = e.target.closest('.ev-btn');
    if (!button) return;
    const ev = calendarState.all.find(item => item.id === button.dataset.id);
    if (!ev) return;
    if (button.classList.contains('edit')) openEventModal(ev);
    else confirmDelete(ev);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeEventModal();
      closeConfirm();
    }
  });

  initAuth();

  if (restoreSession()) {
    setAuthUI(true);
    loadEvents();
  }
}

function initAuth(attempt = 0) {
  if (typeof google === 'undefined' || !google.accounts?.oauth2) {
    if (attempt < 40) setTimeout(() => initAuth(attempt + 1), 300);
    return;
  }
  calendarState.tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.CLIENT_ID,
    scope: CONFIG.SCOPE,
    callback: onToken
  });
}

function restoreSession() {
  try {
    const saved = JSON.parse(store.get('sessionStorage', TOKEN_KEY));
    if (saved && saved.token && saved.exp > Date.now() + 30000) {
      calendarState.token = saved.token;
      return true;
    }
  } catch {
    calendarState.token = null;
  }
  store.remove('sessionStorage', TOKEN_KEY);
  return false;
}

function onToken(response) {
  if (response.error) {
    toast(`Autentificare eșuată: ${response.error}`, 'err');
    return;
  }
  calendarState.token = response.access_token;
  const expiresIn = (Number(response.expires_in) || 3600) * 1000;
  store.set('sessionStorage', TOKEN_KEY, JSON.stringify({ token: calendarState.token, exp: Date.now() + expiresIn }));
  setAuthUI(true);
  loadEvents();
}

function handleAuth() {
  if (calendarState.token) {
    signOut();
    return;
  }
  if (!calendarState.tokenClient) {
    toast('Serviciul Google nu s-a încărcat încă. Verifică conexiunea și încearcă din nou.', 'info');
    initAuth();
    return;
  }
  calendarState.tokenClient.requestAccessToken({ prompt: '' });
}

function signOut() {
  if (calendarState.token && typeof google !== 'undefined' && google.accounts?.oauth2) {
    google.accounts.oauth2.revoke(calendarState.token, () => {});
  }
  calendarState.token = null;
  store.remove('sessionStorage', TOKEN_KEY);
  setAuthUI(false);
  resetCalendar();
  toast('Te-ai deconectat de la Google.', 'info');
}

function onExpired() {
  calendarState.token = null;
  store.remove('sessionStorage', TOKEN_KEY);
  closeEventModal();
  closeConfirm();
  setAuthUI(false, 'Sesiunea Google a expirat. Conectează-te din nou pentru a continua.');
  resetCalendar();
  toast('Sesiunea a expirat — conectează-te din nou.', 'info');
}

function setAuthUI(on, message) {
  $('#authTxt').textContent = on ? 'Deconectare' : 'Conectare Google';
  $('#authBtn').classList.toggle('on', on);
  $('#authWall').hidden = on;
  $('#crudPanel').hidden = !on;
  $('#crudStatus').textContent = message || (on
    ? 'Evenimentele tale din Google Calendar, gestionate direct din pagină.'
    : 'Autentifică-te cu Google pentru a vizualiza și gestiona evenimentele din calendar.');
}

async function gcal(url, options = {}) {
  if (!calendarState.token) throw new Error('Nu ești autentificat.');
  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: { Authorization: `Bearer ${calendarState.token}`, 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
  } catch {
    throw new Error('Nu s-au putut încărca datele. Verifică conexiunea sau încearcă din nou.');
  }
  if (res.status === 401) {
    onExpired();
    throw new Error('Sesiunea a expirat.');
  }
  if (res.status === 403 || res.status === 429) throw new Error('Limită API atinsă. Încearcă din nou în câteva secunde.');
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `Eroare HTTP ${res.status}`);
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') return {};
  return res.json();
}

function apiList(pageToken = null) {
  const params = new URLSearchParams({
    maxResults: 50,
    singleEvents: 'true',
    orderBy: 'startTime',
    timeMin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString()
  });
  if (pageToken) params.set('pageToken', pageToken);
  return gcal(`${GCAL_BASE}?${params}`);
}

function apiCreate(data) {
  return gcal(GCAL_BASE, { method: 'POST', body: JSON.stringify(eventBody(data)) });
}

function apiUpdate(id, data) {
  return gcal(`${GCAL_BASE}/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(eventBody(data)) });
}

function apiDelete(id) {
  return gcal(`${GCAL_BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

function eventBody({ title, start, end, loc }) {
  const body = {
    summary: title.trim(),
    start: { dateTime: new Date(start).toISOString(), timeZone: CONFIG.TZ },
    end: { dateTime: new Date(end).toISOString(), timeZone: CONFIG.TZ }
  };
  if (loc && loc.trim()) body.location = loc.trim();
  return body;
}

function parseEvent(item) {
  const allDay = Boolean(item.start?.date);
  const startISO = item.start?.dateTime || item.start?.date;
  const endISO = item.end?.dateTime || item.end?.date;
  return {
    id: item.id,
    title: item.summary || '(fără titlu)',
    loc: item.location || '',
    allDay,
    start: new Date(startISO),
    end: endISO ? new Date(endISO) : new Date(startISO)
  };
}

async function loadEvents() {
  if (calendarState.fetching) return;
  calendarState.fetching = true;
  showState('load');
  const items = [];
  try {
    let pageToken = null;
    let pages = 0;
    do {
      const data = await apiList(pageToken);
      (data.items || []).forEach(item => items.push(parseEvent(item)));
      pageToken = data.nextPageToken || null;
      pages++;
    } while (pageToken && pages < 3);
    calendarState.all = items.concat(getDemoEvents());
    updateDemoBanner(items.length);
    applyEventFilters();
  } catch (err) {
    showState('err', err.message);
  } finally {
    calendarState.fetching = false;
  }
}

function getDemoEvents() {
  try {
    const raw = JSON.parse(store.get('localStorage', DEMO_KEY) || '[]');
    return raw.map(e => ({ ...e, start: new Date(e.start), end: new Date(e.end), demo: true }));
  } catch {
    return [];
  }
}

function saveDemoEvents(list) {
  if (list.length) store.set('localStorage', DEMO_KEY, JSON.stringify(list));
  else store.remove('localStorage', DEMO_KEY);
}

function updateDemoBanner(realCount) {
  const hasDemo = getDemoEvents().length > 0;
  const banner = $('#demoBanner');
  banner.hidden = !(realCount < CONFIG.MIN_ENTRIES || hasDemo);
  if (banner.hidden) return;
  $('#demoCount').textContent = realCount === 0 ? 'Niciun eveniment real' : plural(realCount, 'eveniment real', 'evenimente reale');
  $('#demoMsg').textContent = hasDemo
    ? '— sunt afișate și date demonstrative locale, pe care le poți edita sau șterge.'
    : 'în calendar. Poți adăuga date demonstrative pentru a testa aplicația.';
  $('#demoAddBtn').hidden = hasDemo;
  $('#demoClearBtn').hidden = !hasDemo;
}

function addDemoData() {
  const now = new Date();
  const make = (dayOffset, hour, duration, title, loc) => {
    const start = new Date(now);
    start.setDate(now.getDate() + dayOffset);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(hour + duration);
    return {
      id: `demo_${Math.random().toString(36).slice(2, 9)}`,
      title,
      loc,
      allDay: false,
      start: start.toISOString(),
      end: end.toISOString()
    };
  };
  saveDemoEvents([
    make(0, 16, 2, 'Laborator Programare Web', 'ULBS, Sala E.01'),
    make(1, 10, 2, 'Curs Structuri de Date', 'ULBS, Amfiteatrul A2'),
    make(2, 14, 1, 'Consultații proiect OpenGL', 'ULBS, Laborator C3'),
    make(4, 9, 3, 'Examen parțial POO', 'ULBS, Sala E.12'),
    make(6, 18, 2, 'Sesiune de studiu — algoritmi', 'Bibliotecă'),
    make(8, 12, 1, 'Întâlnire echipă proiect', 'Online')
  ]);
  toast('Date demonstrative adăugate.', 'ok');
  loadEvents();
}

function clearDemoData() {
  store.remove('localStorage', DEMO_KEY);
  toast('Datele demonstrative au fost șterse.', 'ok');
  loadEvents();
}

function updateDemoEvent(id, data) {
  const list = JSON.parse(store.get('localStorage', DEMO_KEY) || '[]');
  const index = list.findIndex(e => e.id === id);
  if (index < 0) return;
  list[index] = {
    ...list[index],
    title: data.title,
    loc: data.loc,
    start: new Date(data.start).toISOString(),
    end: new Date(data.end).toISOString()
  };
  saveDemoEvents(list);
}

function deleteDemoEvent(id) {
  const list = JSON.parse(store.get('localStorage', DEMO_KEY) || '[]').filter(e => e.id !== id);
  saveDemoEvents(list);
}

function applyEventFilters() {
  const query = $('#searchInput').value.trim().toLowerCase();
  const order = $('#sortSel').value;
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  calendarState.filtered = calendarState.all.filter(ev => {
    if (query && !ev.title.toLowerCase().includes(query)) return false;
    if (calendarState.range === '7') return ev.start >= weekAgo && ev.start <= now;
    if (calendarState.range === 'up') return ev.end >= now;
    if (calendarState.range === 'month') return ev.start >= monthStart && ev.start < monthEnd;
    return true;
  });
  calendarState.filtered.sort((a, b) => (order === 'asc' ? a.start - b.start : b.start - a.start));
  calendarState.page = 0;
  renderEvents();
}

function setRange(chip) {
  calendarState.range = chip.dataset.r;
  $$('.rchip').forEach(c => {
    const active = c === chip;
    c.classList.toggle('active', active);
    c.setAttribute('aria-pressed', String(active));
  });
  applyEventFilters();
}

function changePage(delta) {
  const total = Math.ceil(calendarState.filtered.length / CONFIG.EVENT_PAGE);
  const next = calendarState.page + delta;
  if (next < 0 || next >= total) return;
  calendarState.page = next;
  renderEvents();
  scrollToElement($('#crudPanel'));
}

function renderEvents() {
  const start = calendarState.page * CONFIG.EVENT_PAGE;
  const slice = calendarState.filtered.slice(start, start + CONFIG.EVENT_PAGE);
  const agenda = $('#agenda');
  const pagination = $('#pag');
  agenda.innerHTML = '';

  if (!slice.length) {
    showState('empty');
    pagination.hidden = true;
    return;
  }
  showState('none');

  const groups = new Map();
  slice.forEach(ev => {
    const key = dayKey(ev.start);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(ev);
  });

  const todayKey = dayKey(new Date());
  groups.forEach((events, key) => {
    const day = events[0].start;
    const group = document.createElement('div');
    group.className = 'day-group';
    group.innerHTML = `
      <div class="day-head">
        <div class="day-dow">${WEEKDAYS[day.getDay()]}</div>
        <div class="day-num${key === todayKey ? ' today' : ''}">${day.getDate()}</div>
        <div class="day-mon">${MONTHS[day.getMonth()]}</div>
      </div>
      <div class="events"></div>`;
    const box = $('.events', group);
    events.forEach(ev => box.appendChild(eventCard(ev)));
    agenda.appendChild(group);
  });

  const total = Math.ceil(calendarState.filtered.length / CONFIG.EVENT_PAGE);
  pagination.hidden = total <= 1;
  if (total > 1) {
    $('#pagInfo').textContent = `Pagina ${calendarState.page + 1} din ${total}`;
    $('#prevBtn').disabled = calendarState.page === 0;
    $('#nextBtn').disabled = calendarState.page >= total - 1;
  }
}

function eventCard(ev) {
  const card = document.createElement('article');
  card.className = 'ev';
  const time = ev.allDay
    ? '<span class="allday">toată ziua</span>'
    : `${hm(ev.start)}<br><span class="dash" aria-hidden="true">↓</span><br>${hm(ev.end)}`;
  card.innerHTML = `
    <div class="ev-time">${time}</div>
    <div class="ev-main">
      <h3 class="ev-title">${esc(ev.title)}${ev.demo ? '<span class="ev-demo">demo</span>' : ''}</h3>
      ${ev.loc ? `<p class="ev-loc">${ICONS.pin}${esc(ev.loc)}</p>` : ''}
    </div>
    <div class="ev-actions">
      <button class="ev-btn edit" type="button" data-id="${esc(ev.id)}" aria-label="Editează „${esc(ev.title)}”">${ICONS.edit}</button>
      <button class="ev-btn del" type="button" data-id="${esc(ev.id)}" aria-label="Șterge „${esc(ev.title)}”">${ICONS.trash}</button>
    </div>`;
  return card;
}

function openEventModal(ev = null) {
  calendarState.lastFocus = document.activeElement;
  calendarState.editId = ev ? ev.id : null;
  $('#mTitle').textContent = ev ? 'Editează eveniment' : 'Eveniment nou';
  $('#saveLbl').textContent = ev ? 'Salvează modificările' : 'Salvează';
  $('#fTitle').value = ev ? ev.title : '';
  $('#fLoc').value = ev ? ev.loc : '';
  $('#fStart').value = toLocalInput(ev ? ev.start : roundNextHour());
  $('#fEnd').value = toLocalInput(ev ? ev.end : roundNextHour(1));
  $('#mErr').hidden = true;
  $('#ov').classList.add('open');
  $('#fTitle').focus();
}

function closeEventModal() {
  const overlay = $('#ov');
  if (!overlay?.classList.contains('open')) return;
  overlay.classList.remove('open');
  calendarState.lastFocus?.focus();
}

function showModalError(message) {
  const box = $('#mErr');
  box.textContent = message;
  box.hidden = false;
}

function setSaving(on) {
  $('#saveBtn').disabled = on;
  $('#saveSpin').hidden = !on;
}

async function saveEvent() {
  const data = {
    title: $('#fTitle').value.trim(),
    start: $('#fStart').value,
    end: $('#fEnd').value,
    loc: $('#fLoc').value.trim()
  };
  if (!data.title) return showModalError('Titlul este obligatoriu.');
  if (!data.start || !data.end) return showModalError('Data de început și cea de sfârșit sunt obligatorii.');
  if (new Date(data.end) <= new Date(data.start)) return showModalError('Data de sfârșit trebuie să fie după cea de început.');

  $('#mErr').hidden = true;
  setSaving(true);
  try {
    if (calendarState.editId && String(calendarState.editId).startsWith('demo_')) {
      updateDemoEvent(calendarState.editId, data);
      toast('Eveniment demo actualizat.', 'ok');
    } else if (calendarState.editId) {
      await apiUpdate(calendarState.editId, data);
      toast('Eveniment actualizat.', 'ok');
    } else {
      await apiCreate(data);
      toast('Eveniment adăugat.', 'ok');
    }
    closeEventModal();
    await loadEvents();
  } catch (err) {
    if (calendarState.token) showModalError(err.message);
  } finally {
    setSaving(false);
  }
}

function confirmDelete(ev) {
  calendarState.lastFocus = document.activeElement;
  $('#confMsg').textContent = `Sigur vrei să ștergi „${ev.title}”? Acțiunea este ireversibilă.`;
  $('#confDelBtn').onclick = () => deleteEvent(ev);
  $('#ovConfirm').classList.add('open');
  $('#confCancel').focus();
}

function closeConfirm() {
  const overlay = $('#ovConfirm');
  if (!overlay?.classList.contains('open')) return;
  overlay.classList.remove('open');
  calendarState.lastFocus?.focus();
}

async function deleteEvent(ev) {
  closeConfirm();
  if (String(ev.id).startsWith('demo_')) {
    deleteDemoEvent(ev.id);
    toast(`„${ev.title}” a fost șters.`, 'ok');
    loadEvents();
    return;
  }
  try {
    await apiDelete(ev.id);
    toast(`„${ev.title}” a fost șters.`, 'ok');
    await loadEvents();
  } catch (err) {
    if (calendarState.token) toast(`Eroare la ștergere: ${err.message}`, 'err');
  }
}

function showState(state, message = '') {
  $('#stLoad').hidden = state !== 'load';
  $('#stErr').hidden = state !== 'err';
  $('#stEmpty').hidden = state !== 'empty';
  if (state === 'err') {
    $('#errMsg').textContent = message || 'Nu s-au putut încărca datele. Verifică conexiunea sau încearcă din nou.';
    $('#pag').hidden = true;
  }
}

function resetCalendar() {
  calendarState.all = [];
  calendarState.filtered = [];
  calendarState.page = 0;
  calendarState.range = 'all';
  $('#agenda').innerHTML = '';
  $('#pag').hidden = true;
  $('#demoBanner').hidden = true;
  $$('.rchip').forEach(chip => {
    const active = chip.dataset.r === 'all';
    chip.classList.toggle('active', active);
    chip.setAttribute('aria-pressed', String(active));
  });
  showState('load');
}

function toast(message, type = 'info', duration = 3500) {
  const box = $('#toasts');
  if (!box) return;
  const item = document.createElement('div');
  item.className = `toast ${type}`;
  const mark = type === 'ok' ? '✓' : type === 'err' ? '✕' : '•';
  item.innerHTML = `<span class="mk" aria-hidden="true">${mark}</span><span>${esc(message)}</span>`;
  box.appendChild(item);
  setTimeout(() => {
    item.classList.add('out');
    setTimeout(() => item.remove(), 300);
  }, duration);
}

function debounce(fn, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

function plural(n, one, many) {
  if (n === 1) return `1 ${one}`;
  const rest = n % 100;
  return n !== 0 && (rest === 0 || rest >= 20) ? `${n} de ${many}` : `${n} ${many}`;
}

function relTime(date) {
  const seconds = Math.round((date - Date.now()) / 1000);
  const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relativeTime.format(Math.round(seconds / size), unit);
  }
  return 'chiar acum';
}

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function hm(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function toLocalInput(date) {
  const local = new Date(date);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().slice(0, 16);
}

function roundNextHour(extra = 0) {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1 + extra);
  return date;
}
