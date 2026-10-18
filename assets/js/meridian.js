'use strict';

// Theme: persist + prefers-color-scheme
(function themeInit() {
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') {
    root.setAttribute('data-theme', saved);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.setAttribute('data-theme', 'light');
  }
})();

function toggleTheme() {
  const root = document.documentElement;
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

// Smooth scroll for internal links
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^=\"#\"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  const el = document.getElementById(id);
  if (el) {
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  }
});

// Projects: Featured + Archive
const FEATURED_TITLES = new Set([
  'Ojogor (অজগর)',
  'GoruSheba',
  'Datayon'
]);

const EXTRA_FEATURED = [
  {
    title: 'CCRP — Caller Collision Resolution Protocol',
    subtitle: 'Preprint (Oct 2025), DOI: 10.13140/RG.2.2.26499.98081',
    url: 'https://www.researchgate.net/publication/397017372_Caller_Collision_Resolution_Protocol_CCRP_Bridging_Simultaneous_Call_Attempts_in_Real-World_Telephony',
    tags: ['Research'],
  },
  {
    title: 'Ishara',
    subtitle: 'Real-time Bengali sign language translation (National Tech Award 2025)',
    // Use a verified press link from the repo
    url: 'https://www.prothomalo.com/technology/hqdxhziscj',
    tags: ['AI/ML', 'Accessibility'],
  },
  {
    title: 'Appibrium',
    subtitle: 'Founder & Full-Stack Mobile Architect (Oct 2025–present)',
    url: 'https://appibrium.com',
    tags: ['Leadership', 'Systems'],
  }
];

function rowHTML(item, idx) {
  const tags = (item.tags || item.category ? (item.tags || [item.category]).filter(Boolean) : []);
  const tagsHTML = tags.length ? `<span class="mono">${tags.join(' · ')}</span>` : '';
  const safeSubtitle = item.subtitle ? `<div class="meta">${item.subtitle}</div>` : '';
  const linkOpen = item.url ? `<a href="${item.url}" target="_blank" rel="noopener" class="toggle">` : `<button class="toggle" type="button" aria-expanded="false">`;
  const linkClose = item.url ? `</a>` : `</button>`;
  return `
    <div class="row" role="listitem" aria-expanded="false">
      <div class="tablelike">
        <div>
          ${linkOpen}
            <div class="title">${idx != null ? String(idx).padStart(2, '0') + '. ' : ''}${item.title}</div>
            ${safeSubtitle}
          ${linkClose}
          <div class="details"></div>
        </div>
        <div class="meta"></div>
        <div class="meta">${tagsHTML}</div>
        <div></div>
      </div>
    </div>
  `;
}

async function loadProjects() {
  try {
    const res = await fetch('/assets/projects/projects.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load projects');
    const all = await res.json();
    const featured = [];
    const archive = [];
    for (const p of all) {
      if (FEATURED_TITLES.has(p.title)) featured.push({ title: p.title, subtitle: p.subtitle, url: p.url, category: p.category });
      archive.push({ title: p.title, subtitle: p.subtitle, url: p.url, category: p.category });
    }
    // Merge extras to featured
    const mergedFeatured = [
      ...featured,
      ...EXTRA_FEATURED
    ].slice(0, 6);

    // Render featured
    const featuredBox = document.getElementById('featured-projects');
    if (featuredBox) {
      featuredBox.innerHTML = mergedFeatured.map((it, i) => rowHTML(it, i + 1)).join('');
    }
    // Render archive
    const archiveBox = document.getElementById('projects-archive');
    if (archiveBox) {
      archiveBox.innerHTML = archive.map((it) => rowHTML(it)).join('');
    }
  } catch (e) {
    const featuredBox = document.getElementById('featured-projects');
    const archiveBox = document.getElementById('projects-archive');
    if (featuredBox) featuredBox.innerHTML = `<div class="muted">Failed to load featured projects.</div>`;
    if (archiveBox) archiveBox.innerHTML = `<div class="muted">Failed to load project archive.</div>`;
  }
}

// Search filter
function setupProjectSearch() {
  const input = document.getElementById('project-search');
  if (!input) return;
  const container = document.getElementById('projects-archive');
  if (!container) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    const rows = container.querySelectorAll('.row');
    rows.forEach(r => {
      const text = r.textContent.toLowerCase();
      r.style.display = text.includes(q) ? '' : 'none';
    });
  });
}

// Copy email button
function setupCopyEmail() {
  const btn = document.getElementById('copy-email');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('ratulhasan1644@gmail.com');
      btn.textContent = 'Copied';
      setTimeout(() => (btn.textContent = 'Copy email'), 1400);
    } catch {}
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  loadProjects().then(setupProjectSearch);
  setupCopyEmail();
});

