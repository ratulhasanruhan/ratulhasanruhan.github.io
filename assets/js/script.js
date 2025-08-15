'use strict';

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });

// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

// Attach select dropdown open/close event ONCE
if (select) {
  select.addEventListener('click', function () {
    this.classList.toggle('active');
  });
}

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);
  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {
  for (let i = 0; i < filterItems.length; i++) {
    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }
  }
}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {
  filterBtn[i].addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;
  });
}

// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {
    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }
  });
}

// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }
  });
}

// --- Direct URL navigation to Portfolio section ---
window.addEventListener('DOMContentLoaded', function () {
  // Only use hash-based navigation for main sections
  const hash = window.location.hash.toLowerCase();
  const sectionMap = {
    '#about': 'about',
    '#resume': 'resume',
    '#contact': 'contact',
    '#works': 'portfolio',
    '#portfolio': 'portfolio'
  };
  if (sectionMap[hash]) {
    for (let i = 0; i < navigationLinks.length; i++) {
      if (navigationLinks[i].innerText.trim().toLowerCase() === sectionMap[hash]) {
        navigationLinks[i].click();
        break;
      }
    }
  }
});

// Blog Integration with GitHub
async function fetchBlogPosts() {
  try {
    const response = await fetch('https://api.github.com/repos/ratulhasanruhan/blogs/contents/');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const files = await response.json();
    const mdFiles = files.filter(file => file.name.endsWith('.md'));
    
    const posts = await Promise.all(mdFiles.map(async file => {
      const contentResponse = await fetch(file.download_url);
      const content = await contentResponse.text();
      
      // Parse markdown content
      const lines = content.split('\n');
      let title = '';
      let datePublished = '';
      let coverImage = '';
      let brief = '';
      let url = '';
      let isMetadata = false;
      let contentStart = 0;

      // Find metadata section
      if (lines[0].trim() === '---') {
        isMetadata = true;
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line === '---') {
            contentStart = i + 1;
            break;
          }
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();
          if (key === 'title') title = value;
          if (key === 'datePublished') datePublished = value;
          if (key === 'cover') coverImage = value;
          if (key === 'originalUrl') url = value;
        }
      }

      // Get first paragraph for brief
      for (let i = contentStart; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('#') && !line.startsWith('!')) {
          brief = line;
          break;
        }
      }

      // Find first image if no cover image specified
      if (!coverImage) {
        const imageMatch = content.match(/!\[.*?\]\((.*?)\)/);
        if (imageMatch) {
          coverImage = imageMatch[1];
        }
      }

      return {
        title: title || file.name.replace('.md', ''),
        brief: brief.length > 150 ? brief.substring(0, 150) + '...' : brief,
        coverImage: coverImage || './assets/images/blog-1.jpg',
        dateAdded: datePublished || new Date().toISOString(),
        url: url || file.html_url,
        content: content
      };
    }));

    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw new Error(`Failed to load blog posts: ${error.message}`);
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: '2-digit' 
  });
}

function createBlogPostHTML(post) {
  return `
    <li class="blog-post-item improved-blog-card">
      <a href="${post.url}" target="_blank" class="improved-blog-link">
        <figure class="improved-blog-img">
          <img src="${post.coverImage}" alt="${post.title}" loading="lazy" onerror="this.src='./assets/images/blog-1.jpg'">
        </figure>
        <div class="improved-blog-content">
          <h3 class="improved-blog-title">${post.title}</h3>
          <p class="improved-blog-brief">${post.brief || ''}</p>
        </div>
      </a>
    </li>
  `;
}

// Ensure modal HTML is present (for safety)
if (!document.querySelector('.modal-container')) {
  const modalHTML = `
    <div class="modal-container" style="display: none;">
      <div class="modal-content">
        <span class="modal-close">&times;</span>
        <div id="modal-blog-content"></div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}
if (!document.getElementById('modal-styles')) {
  const modalStyles = `
    .modal-container {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.8);
      overflow-y: auto;
    }
    .modal-content {
      background: var(--eerie-black-2);
      margin: 5% auto;
      padding: 30px;
      width: 90%;
      max-width: 800px;
      border-radius: 14px;
      position: relative;
      color: var(--light-gray);
    }
    .modal-close {
      position: absolute;
      right: 20px;
      top: 20px;
      color: var(--light-gray);
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
      width: 30px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      border-radius: 50%;
      background: var(--onyx);
    }
    .modal-close:hover {
      color: var(--orange-yellow-crayola);
      background: var(--jet);
    }
    #modal-blog-content {
      margin-top: 20px;
    }
    #modal-blog-content img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 15px 0;
    }
    #modal-blog-content h1,
    #modal-blog-content h2,
    #modal-blog-content h3 {
      color: var(--white-2);
      margin: 20px 0 10px;
    }
    #modal-blog-content p {
      margin: 15px 0;
      line-height: 1.6;
    }
    #modal-blog-content a {
      color: var(--orange-yellow-crayola);
      text-decoration: none;
    }
    #modal-blog-content a:hover {
      text-decoration: underline;
    }
  `;
  const styleSheet = document.createElement("style");
  styleSheet.id = 'modal-styles';
  styleSheet.textContent = modalStyles;
  document.head.appendChild(styleSheet);
}

function showBlogModal(postData) {
  try {
    const post = typeof postData === 'string' ? JSON.parse(postData) : postData;
    const modalContent = document.getElementById('modal-blog-content');
    const modalContainer = document.querySelector('.modal-container');
    if (!modalContent || !modalContainer) return;
    // Convert markdown to HTML
    let markdown = post.content.replace(/\r?\n/g, '\n');
    markdown = markdown.replace(/^---[\s\S]*?---/, '');
    let htmlContent = markdown
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2">')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/\n/g, ' ');
    htmlContent = `<p>${htmlContent}</p>`;
    modalContent.innerHTML = `
      <h1>${post.title}</h1>
      <div class="blog-meta">
        <img src="${post.coverImage}" alt="${post.title}" style="max-width:220px;border-radius:8px;margin-bottom:18px;">
      </div>
      ${htmlContent}
    `;
    modalContainer.style.display = 'block';
    document.body.style.overflow = 'hidden';
    // Close modal when clicking outside or on close button
    const closeModal = () => {
      modalContainer.style.display = 'none';
      document.body.style.overflow = '';
    };
    modalContainer.onclick = (e) => {
      if (e.target === modalContainer || e.target.classList.contains('modal-close')) {
        closeModal();
      }
    };
    // Close on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape' && modalContainer.style.display === 'block') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  } catch (error) {
    console.error('Error showing modal:', error);
  }
}

function attachBlogModalHandler() {
  document.body.addEventListener('click', function(e) {
    const link = e.target.closest('.blog-confetti-link');
    if (link) {
      e.preventDefault();
      // Find the blog post data from the parent li
      const li = link.closest('.blog-post-item');
      let postData = li && li.dataset.post;
      if (!postData) {
        // fallback: try to find by title
        const title = link.querySelector('.improved-blog-title')?.textContent;
        const posts = window.__blogPosts || [];
        const post = posts.find(p => p.title === title);
        postData = post ? JSON.stringify(post) : null;
      }
      if (postData) showBlogModal(postData);
    }
  });
}

// Store blog posts for modal lookup
async function displayBlogPosts() {
  const blogList = document.querySelector('.blog-posts-list');
  const loadingDiv = document.querySelector('.blog-loading');
  if (!blogList || !loadingDiv) return;
  try {
    loadingDiv.style.display = 'block';
    blogList.innerHTML = '';
    const posts = await fetchBlogPosts();
    window.__blogPosts = posts; // store for modal lookup
    if (!posts || posts.length === 0) {
      blogList.innerHTML = '<p class="no-posts">No blog posts found</p>';
      return;
    }
    // Sort posts by date in descending order
    posts.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    const blogHTML = posts.map(post => createBlogPostHTML(post)).join('');
    blogList.innerHTML = blogHTML;
  } catch (error) {
    console.error('Error displaying blog posts:', error);
    blogList.innerHTML = `<p class="no-posts">Failed to load blog posts: ${error.message}</p>`;
  } finally {
    loadingDiv.style.display = 'none';
  }
}

// Attach modal handler after DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachBlogModalHandler);
} else {
  attachBlogModalHandler();
}

// Dynamic Projects Section
async function fetchProjects() {
  const response = await fetch('./assets/projects/projects.json');
  if (!response.ok) throw new Error('Failed to load projects');
  return await response.json();
}

function createProjectHTML(project) {
  return `
    <li class="project-item active" data-filter-item data-category="${project.category.toLowerCase()}">
      <a href="${project.url}" target="_blank" class="project-card-link">
        <figure class="project-img enhanced-project-img">
          <img src="./assets/projects/${project.image}" alt="${project.title}" loading="lazy">
          <span class="project-category-badge">${project.category}</span>
        </figure>
        <div class="project-card-content">
          <h3 class="project-title enhanced-project-title">${project.title}</h3>
          <p class="project-subtitle enhanced-project-subtitle">${project.subtitle || ''}</p>
        </div>
      </a>
    </li>
  `;
}

async function displayProjects() {
  const projectList = document.querySelector('.project-list');
  if (!projectList) return;
  try {
    const projects = await fetchProjects();
    const html = projects.map(createProjectHTML).join('');
    projectList.innerHTML = html;
  } catch (e) {
    projectList.innerHTML = '<li>Failed to load projects.</li>';
  }
}

function attachProjectFilterEvents() {
  const filterBtn = document.querySelectorAll('[data-filter-btn]');
  const selectItems = document.querySelectorAll('[data-select-item]');
  const selectValue = document.querySelector('[data-selecct-value]');

  // Filter function
  const filterFunc = function (selectedValue) {
    const items = document.querySelectorAll('.project-item');
    for (let i = 0; i < items.length; i++) {
      if (selectedValue === 'all') {
        items[i].classList.add('active');
      } else if (selectedValue === items[i].dataset.category.toLowerCase()) {
        items[i].classList.add('active');
      } else {
        items[i].classList.remove('active');
      }
    }
  };

  // Large screen filter buttons
  let lastClickedBtn = filterBtn[0];
  for (let i = 0; i < filterBtn.length; i++) {
    filterBtn[i].addEventListener('click', function () {
      let selectedValue = this.innerText.toLowerCase();
      if (selectValue) selectValue.innerText = this.innerText;
      filterFunc(selectedValue);
      if (lastClickedBtn) lastClickedBtn.classList.remove('active');
      this.classList.add('active');
      lastClickedBtn = this;
    });
  }

  // Dropdown select items (mobile)
  for (let i = 0; i < selectItems.length; i++) {
    selectItems[i].addEventListener('click', function () {
      let selectedValue = this.innerText.toLowerCase();
      if (selectValue) selectValue.innerText = this.innerText;
      filterFunc(selectedValue);
      if (select) select.classList.remove('active');
      // Also update the active state of filter buttons for consistency
      filterBtn.forEach(btn => btn.classList.remove('active'));
      // Set the corresponding filterBtn as active if exists
      filterBtn.forEach(btn => {
        if (btn.innerText.toLowerCase() === selectedValue) btn.classList.add('active');
        if (selectedValue === 'all' && btn.innerText.toLowerCase() === 'all') btn.classList.add('active');
      });
    });
  }
}

// After both categories and projects are rendered, re-attach filter events
async function displayProjectCategoriesAndProjects() {
  await displayProjectCategories();
  await displayProjects();
  attachProjectFilterEvents();
}

async function displayProjectCategories() {
  const filterList = document.querySelector('.filter-list');
  const selectList = document.querySelector('.select-list');
  if (!filterList || !selectList) return;
  try {
    const projects = await fetchProjects();
    const categories = Array.from(new Set(projects.map(p => p.category)));
    // Render filter-list
    filterList.innerHTML = `<li class="filter-item"><button class="active" data-filter-btn>All</button></li>` +
      categories.map(cat => `<li class="filter-item"><button data-filter-btn>${cat}</button></li>`).join('');
    // Render select-list ONLY (not the select button)
    selectList.innerHTML = `<li class="select-item"><button data-select-item>All</button></li>` +
      categories.map(cat => `<li class="select-item"><button data-select-item>${cat}</button></li>`).join('');
  } catch (e) {
    // fallback: do nothing
  }
}

displayProjectCategoriesAndProjects();

// Add enhanced card styles if not present
if (!document.getElementById('enhanced-project-card-styles')) {
  const style = document.createElement('style');
  style.id = 'enhanced-project-card-styles';
  style.textContent = `
    .project-card-link {
      display: block;
      background: var(--border-gradient-onyx);
      border-radius: 18px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.10);
      overflow: hidden;
      transition: box-shadow 0.2s, transform 0.2s;
      text-decoration: none;
      color: inherit;
      height: 100%;
    }
    .project-card-link:hover {
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      transform: translateY(-4px) scale(1.02);
    }
    .enhanced-project-img {
      position: relative;
      width: 100%;
      height: 210px;
      overflow: hidden;
      border-radius: 16px 16px 0 0;
      margin-bottom: 0;
    }
    .enhanced-project-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
      display: block;
    }
    .project-card-link:hover .enhanced-project-img img {
      transform: scale(1.07);
    }
    .project-category-badge {
      position: absolute;
      top: 14px;
      right: 14px;
      background: var(--orange-yellow-crayola);
      color: #222;
      font-size: 13px;
      font-weight: 600;
      padding: 4px 14px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      z-index: 2;
      letter-spacing: 0.5px;
    }
    .project-card-content {
      padding: 18px 18px 16px 18px;
      background: var(--eerie-black-2);
      border-radius: 0 0 16px 16px;
      min-height: 90px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
    }
    .enhanced-project-title {
      font-size: 1.18rem;
      font-weight: 600;
      color: var(--white-2);
      margin: 0 0 7px 0;
      line-height: 1.3;
      letter-spacing: 0.1px;
    }
    .enhanced-project-subtitle {
      font-size: 0.98rem;
      color: var(--light-gray-70);
      margin: 0 0 0 0;
      line-height: 1.5;
      max-height: 2.8em;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  `;
  document.head.appendChild(style);
}

// Add improved blog card styles if not present
if (!document.getElementById('improved-blog-card-styles')) {
  const style = document.createElement('style');
  style.id = 'improved-blog-card-styles';
  style.textContent = `
    .improved-blog-card {
      border-radius: 14px;
      box-shadow: 0 4px 18px rgba(0,0,0,0.10);
      overflow: hidden;
      background: var(--eerie-black-2);
      margin: 0;
      padding: 0;
      border: 1px solid var(--jet);
      transition: box-shadow 0.18s, transform 0.18s;
    }
    .improved-blog-link {
      display: block;
      text-decoration: none;
      color: inherit;
      padding: 0;
      background: none;
      border-radius: 14px;
      transition: box-shadow 0.18s, transform 0.18s;
    }
    .improved-blog-link:hover {
      box-shadow: 0 8px 28px rgba(0,0,0,0.16);
      transform: translateY(-3px) scale(1.015);
    }
    .improved-blog-img {
      position: relative;
      width: 100%;
      height: 150px;
      border-radius: 14px 14px 0 0;
      overflow: hidden;
      margin: 0;
      background: #222;
    }
    .improved-blog-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.22s;
    }
    .improved-blog-link:hover .improved-blog-img img {
      transform: scale(1.05);
    }
    .improved-blog-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: var(--orange-yellow-crayola);
      color: #222;
      font-size: 12px;
      font-weight: 600;
      padding: 3px 12px;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      z-index: 2;
      letter-spacing: 0.5px;
    }
    .improved-blog-content {
      padding: 15px 16px 16px 16px;
      background: none;
      text-align: left;
    }
    .improved-blog-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--white-2);
      margin: 0 0 7px 0;
      line-height: 1.3;
      letter-spacing: 0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .improved-blog-brief {
      font-size: 0.97rem;
      color: var(--light-gray-70);
      margin: 0;
      line-height: 1.5;
      max-height: 1.5em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      opacity: 0.92;
    }
  `;
  document.head.appendChild(style);
}

const blogSection = document.querySelector('[data-page="blog"]');
if (blogSection) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.classList.contains('active')) {
        displayBlogPosts();
      }
    });
  });

  observer.observe(blogSection, {
    attributes: true,
    attributeFilter: ['class']
  });

  // Load posts immediately if blog section is already active
  if (blogSection.classList.contains('active')) {
    displayBlogPosts();
  }
}