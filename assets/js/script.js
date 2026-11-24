'use strict';

const pages = [...document.querySelectorAll('[data-page]')];
const pagePaths = new Map(pages.map(page => [page.id, page.id === 'about' ? '/' : '/' + page.id]));
const legacyNames = new Map([['blog', 'writings'], ['writting', 'writings'], ['portfolio', 'projects']]);
const homeTitle = document.title;
const alternateLanguages = [...document.querySelectorAll('link[data-hreflang]')];
const moreMenu = document.querySelector('.more-menu');
const dialog = document.querySelector('#search-dialog');
const queryField = document.querySelector('#archive-query');
const catalog = [];

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function pageNameFrom(path) {
  const name = path.replace(/^\/+|\/+$/g, '') || 'about';
  return legacyNames.get(name) || name;
}

function renderLocation(moveFocus = false) {
  const name = pageNameFrom(location.pathname);
  const active = pages.find(page => page.id === name) || pages[0];
  pages.forEach(page => page.classList.toggle('active', page === active));
  document.querySelectorAll('a[data-route]').forEach(link => {
    if (link.dataset.route === active.id) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  moreMenu.open = false;
  const path = pagePaths.get(active.id);
  const canonical = new URL(path, 'https://also.ratulruhan.cv').href;
  document.querySelector('link[rel="canonical"]').href = canonical;
  document.querySelectorAll('meta[property="og:url"], meta[property="twitter:url"]').forEach(meta => {
    meta.content = canonical;
  });
  for (const link of alternateLanguages) {
    if (path === '/' && !link.isConnected) document.head.append(link);
    else if (path !== '/') link.remove();
  }
  const heading = active.querySelector('h1, h2');
  document.title = path === '/' ? homeTitle : heading.textContent + ' | Ratul Hasan Ruhan';
  let fragment = location.hash.slice(1);
  try { fragment = decodeURIComponent(fragment); } catch { /* Keep malformed fragments literal. */ }
  const target = document.getElementById(fragment);
  const destination = target && active.contains(target) ? target : heading;
  if (target === destination) {
    const award = target.querySelector('.award-details');
    if (award) award.open = true;
  }
  if (moveFocus) {
    destination.tabIndex = -1;
    destination.focus({ preventScroll: true });
  }
  if (destination === heading) window.scrollTo(0, 0);
  else destination.scrollIntoView();
  if (active.id === 'writings') loadWritings();
}

function navigateToPage(name, href = pagePaths.get(name)) {
  if (!pagePaths.has(name)) return;
  if (dialog.open) dialog.close();
  if (new URL(href, location.origin).href !== location.href) history.pushState(null, '', href);
  renderLocation(true);
}

document.addEventListener('click', event => {
  if (!moreMenu.contains(event.target)) moreMenu.open = false;
  const link = event.target.closest('a[data-route]');
  if (!link || event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigateToPage(link.dataset.route, link.href);
});
window.addEventListener('popstate', () => renderLocation(true));

const map = document.querySelector('.orbital-map');
const viewButtons = document.querySelectorAll('[data-view]');
function setAtlasView(view) {
  const list = view === 'list';
  map.classList.toggle('list-view', list);
  for (const button of viewButtons) button.setAttribute('aria-pressed', String(view === button.dataset.view));
  document.querySelector('#atlas-hint').textContent = list ? 'Select a destination to explore' : 'Select a planet to explore';
}
for (const button of viewButtons) {
  button.addEventListener('click', () => {
    setAtlasView(button.dataset.view);
    try { localStorage.setItem('portfolio-atlas-view', button.dataset.view); } catch { /* Private browsing. */ }
  });
}
try { if (localStorage.getItem('portfolio-atlas-view') === 'list') setAtlasView('list'); } catch { /* Map is the default. */ }

const photos = [
  { file: 'portrait', caption: 'Portrait, Dhaka', alt: 'Ratul Hasan Ruhan, in a suit and tie, against an illustrated orange sun' },
  { file: 'startup-world-cup', caption: 'Startup World Cup, 2025', alt: 'Ratul on stage at the Startup World Cup Bangladesh regional final' },
  { file: 'coding-fest', caption: 'Coding Fest, 2026', alt: 'The Coding Fest award presentation at Daffodil International Academy' }
];
let photoIndex = 0;
document.querySelector('.photo-controls').addEventListener('click', event => {
  const control = event.target.closest('[data-photo-step]');
  if (!control) return;
  photoIndex = (photoIndex + Number(control.dataset.photoStep) + photos.length) % photos.length;
  const photo = photos[photoIndex];
  const image = document.querySelector('#gallery-image');
  image.src = '/assets/images/portfolio/' + photo.file + '.webp';
  image.alt = photo.alt;
  document.querySelector('#photo-caption').textContent = photo.caption;
  document.querySelector('.photo-index').textContent = String(photoIndex + 1).padStart(2, '0') + ' / 03';
  document.querySelector('.photo-tag').hidden = photoIndex !== 0;
});

// Build the search index from the same visible entries that visitors browse.
for (const page of pages) {
  const label = { about: 'Universe', profile: 'About Ratul' }[page.id] || page.querySelector('h2').textContent;
  catalog.push({ title: label, type: 'Section', page: page.id, href: pagePaths.get(page.id), body: '' });
  const entries = page.querySelectorAll('.community-list li, .timeline-item, .skill-segment');
  for (const entry of entries) {
    const title = entry.querySelector('h3, h4, .award-title').textContent.replace(/\s+/g, ' ').replace(/\s*↗$/, '').trim();
    if (!entry.id) entry.id = page.id + '-' + title.toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, '-').replace(/-$/, '');
    const group = entry.closest('section')?.querySelector('.title-wrapper h3');
    catalog.push({ title, type: group?.textContent || label, page: page.id,
      href: pagePaths.get(page.id) + '#' + entry.id, body: entry.textContent.replace(/\s+/g, ' ').trim() });
  }
}

function setCount(page, count) {
  document.querySelector('[data-count="' + page + '"]').textContent = count;
}
setCount('communities', document.querySelectorAll('.community-list li').length);
setCount('recognition', document.querySelectorAll('#recognition .timeline:first-of-type .timeline-item').length);

function indexWritings() {
  for (const link of document.querySelectorAll('.blog-posts-list a')) {
    if (catalog.some(entry => entry.href === link.href && entry.type === 'Writing')) continue;
    catalog.push({ title: link.querySelector('h3').textContent, type: 'Writing', href: link.href, body: '' });
  }
}
indexWritings();

function showSearchResults() {
  const words = queryField.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = catalog.filter(entry => {
    if (!words.length) return entry.type === 'Section';
    const searchable = (entry.title + ' ' + entry.type + ' ' + entry.body).toLowerCase();
    return words.every(word => searchable.includes(word));
  });
  const score = entry => words.filter(word => entry.title.toLowerCase().includes(word)).length;
  if (words.length) matches.sort((a, b) => score(b) - score(a));
  document.querySelector('#search-status').textContent = words.length ? matches.length + (matches.length === 1 ? ' result' : ' results') : 'Browse sections';
  const list = document.querySelector('#search-results');
  list.replaceChildren();
  if (!matches.length) list.append(element('li', '', 'Try another name, role, or topic.'));
  for (const match of matches) {
    const link = element('a', '', match.title);
    link.href = match.href;
    if (match.page) link.dataset.route = match.page;
    link.append(element('small', '', match.type));
    const item = element('li');
    item.append(link);
    list.append(item);
  }
}

function openSearch() {
  moreMenu.open = false;
  queryField.value = '';
  showSearchResults();
  dialog.showModal();
  queryField.focus();
}
document.querySelector('.search-trigger').addEventListener('click', openSearch);
document.querySelector('.close-search').addEventListener('click', () => dialog.close());
queryField.addEventListener('input', showSearchResults);
queryField.addEventListener('keydown', event => {
  if (event.key === 'Enter') document.querySelector('#search-results a')?.click();
});
document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (dialog.open) dialog.close();
    else openSearch();
  }
  if (event.key === 'Escape' && moreMenu.open) {
    moreMenu.open = false;
    moreMenu.querySelector('summary').focus();
  }
});

function createProjectCard(project) {
  const item = element('li', 'project-item');
  item.dataset.category = project.category;
  const link = element('a', 'project-card-link');
  link.href = project.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  const image = new Image(900, 500);
  image.loading = 'lazy';
  image.alt = '';
  image.src = '/assets/projects/' + project.image;
  const figure = element('figure', 'project-img');
  figure.append(image);
  const copy = element('div', 'project-card-content');
  copy.append(element('span', 'project-category', project.category), element('h3', 'project-title', project.title),
    element('p', 'project-subtitle', project.subtitle));
  link.append(figure, copy);
  item.append(link);
  return item;
}

async function loadProjects() {
  const status = document.querySelector('.project-status');
  const list = document.querySelector('.project-list');
  const filters = document.querySelector('.filters');
  try {
    const response = await fetch('/assets/projects/projects.json');
    if (!response.ok) throw new Error('Project catalog unavailable');
    const projects = await response.json();
    list.replaceChildren(...projects.map(createProjectCard));
    setCount('projects', projects.length);
    const categories = ['All', ...new Set(projects.map(project => project.category))];
    for (const category of categories) {
      const button = element('button', '', category);
      button.type = 'button';
      button.dataset.filterBtn = '';
      button.setAttribute('aria-pressed', String(category === 'All'));
      filters.append(button);
    }
    function filterProjects(category) {
      let count = 0;
      for (const item of list.children) {
        item.hidden = category !== 'All' && category !== item.dataset.category;
        if (!item.hidden) count++;
      }
      for (const button of filters.children) button.setAttribute('aria-pressed', String(button.textContent === category));
      status.textContent = count + (count === 1 ? ' project' : ' projects');
    }
    filters.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (button) filterProjects(button.textContent);
    });
    filterProjects('All');
    for (const project of projects) {
      catalog.push({ title: project.title, type: 'Project · ' + project.category, href: project.url, body: project.subtitle || '' });
    }
    if (dialog.open) showSearchResults();
  } catch {
    status.textContent = 'The project catalog could not load. Refresh to try again.';
  }
}

// Render the existing GitHub writing feed only when its section is opened.
let writingsRequested = false;
async function loadWritings() {
  const list = document.querySelector('.blog-posts-list');
  if (writingsRequested) return;
  writingsRequested = true;
  const status = document.querySelector('.blog-loading');
  try {
    const posts = await fetchBlogPosts();
    const refreshed = document.createDocumentFragment();
    posts.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    for (const post of posts) {
      const item = element('li');
      const link = element('a');
      link.href = safeWebURL(post.url);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      if (post.coverImage && safeWebURL(post.coverImage)) {
        const figure = element('figure', 'blog-img');
        const image = new Image(800, 450);
        image.alt = '';
        image.loading = 'lazy';
        image.src = safeWebURL(post.coverImage);
        image.addEventListener('error', () => figure.remove(), { once: true });
        figure.append(image);
        link.append(figure);
      }
      const copy = element('div', 'blog-copy');
      if (post.dateAdded) copy.append(element('span', 'blog-date', formatDate(post.dateAdded)));
      copy.append(element('h3', '', post.title), element('p', '', post.brief));
      link.append(copy);
      item.append(link);
      refreshed.append(item);
    }
    if (posts.length) list.replaceChildren(refreshed);
    indexWritings();
    if (dialog.open) showSearchResults();
  } catch {
    status.textContent = 'Showing the saved article list.';
  }
}

function safeWebURL(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

// GitHub Pages serves 404.html on clean deep links. Restore its local route,
// including query and fragment, before selecting the section.
const initial = new URL(location.href);
const redirected = initial.searchParams.get('portfolio-section');
if (initial.pathname === '/' && redirected && pagePaths.has(pageNameFrom(redirected))) {
  initial.pathname = pagePaths.get(pageNameFrom(redirected));
  initial.searchParams.delete('portfolio-section');
  history.replaceState(null, '', initial);
} else if (initial.pathname === '/' && initial.hash) {
  const legacy = pageNameFrom(initial.hash.slice(1));
  if (pagePaths.has(legacy)) {
    initial.pathname = pagePaths.get(legacy);
    initial.hash = '';
    history.replaceState(null, '', initial);
  }
}
renderLocation();
loadProjects();

async function fetchBlogPosts() {
  const response = await fetch('https://api.github.com/repos/ratulhasanruhan/blogs/contents/');
  if (!response.ok) throw new Error('Writing feed unavailable');

  const files = await response.json();
  return Promise.all(files.filter(file => file.name.endsWith('.md')).map(async file => {
    const article = await fetch(file.download_url);
    if (!article.ok) throw new Error('Article unavailable');

    const markdown = await article.text();
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(markdown);
    const metadata = {};
    for (const line of (frontmatter?.[1] || '').split('\n')) {
      const split = line.indexOf(':');
      if (split === -1) continue;
      metadata[line.slice(0, split).trim()] = line.slice(split + 1).trim().replace(/^"(.*)"$/, '$1');
    }
    const articleText = markdown.slice(frontmatter?.[0].length || 0);
    const paragraph = articleText.split('\n').map(line => line.trim()).find(line => line && !/^[#!]/.test(line));
    const brief = metadata.seoDescription || paragraph || '';
    const published = metadata.slug && 'https://ratulhasanruhan.hashnode.dev/' + encodeURIComponent(metadata.slug);
    return {
      title: metadata.title || file.name.replace(/\.md$/, ''),
      brief: brief.length > 150 ? brief.slice(0, 150).trimEnd() + '…' : brief,
      coverImage: metadata.cover,
      dateAdded: metadata.datePublished,
      url: safeWebURL(metadata.originalUrl) || published || file.html_url
    };
  }));
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
