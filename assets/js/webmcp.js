'use strict';

/**
 * WebMCP tools — expose the site's real actions to in-browser AI agents.
 *
 * Supports both API shapes:
 *   - Chrome early preview: navigator.modelContext.provideContext({ tools })
 *   - Spec draft:           document.modelContext.registerTool(tool)
 * No-op in browsers without the API. Every tool is either read-only or
 * drives the existing UI (router, project filter, contact form); nothing
 * here submits data on the agent's behalf.
 */
(function () {
  const ctx = (typeof navigator !== 'undefined' && navigator.modelContext) ||
              (typeof document !== 'undefined' && document.modelContext);
  if (!ctx) return;

  const ORIGIN = 'https://also.ratulruhan.cv';
  const PROFILE_URL = './ratul-hasan-ruhan.json';
  const PROJECTS_URL = './assets/projects/projects.json';
  const RESUME_URL = ORIGIN + '/assets/Ratul-Hasan-Ruhan-Resume.pdf';
  const BOOKING_URL = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ01vVQ1tVn35qEWA91zEWLjB0OY56xiZE_gVIc58FSZojPLTSxfHnpbgNrCQudJHp1GyClOtSOs?gv=true';
  const PAGES = ['about', 'resume', 'projects', 'research', 'writings', 'recognition', 'contact'];

  const CONTACT = {
    name: 'Ratul Hasan Ruhan',
    email: 'ratulhasan1644@gmail.com',
    whatsapp: 'https://wa.me/8801789536985',
    linkedin: 'https://www.linkedin.com/in/ratul-hasan-ruhan/',
    github: 'https://github.com/ratulhasanruhan',
    location: 'Dhaka, Bangladesh',
    booking_url: BOOKING_URL,
    resume_pdf: RESUME_URL,
    contact_form_page: ORIGIN + '/contact'
  };

  // ---- helpers -------------------------------------------------------------

  async function fetchJSON(url, signal) {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.json();
  }

  // Drive the SPA router from script.js (showPage / updateURL / pageToUrlMap are globals).
  function goTo(page) {
    if (!PAGES.includes(page)) throw new Error(`Unknown page "${page}". Use one of: ${PAGES.join(', ')}`);
    if (typeof showPage === 'function') {
      showPage(page);
      if (typeof updateURL === 'function' && typeof pageToUrlMap === 'object') updateURL(pageToUrlMap[page] || `/${page}`);
    } else {
      window.location.hash = page; // hash fallback handled by the router on load
    }
    return { page, url: ORIGIN + (page === 'about' ? '/' : `/${page}`) };
  }

  function clickFilter(category) {
    const wanted = category.trim().toLowerCase();
    const btn = Array.from(document.querySelectorAll('[data-filter-btn]'))
      .find(b => b.innerText.trim().toLowerCase() === wanted);
    if (!btn) return false;
    btn.click();
    return true;
  }

  // ---- tools ---------------------------------------------------------------

  const tools = [
    {
      name: 'get_profile',
      title: 'Get profile',
      description: 'Return Ratul Hasan Ruhan\'s full structured profile (schema.org Person JSON-LD): roles, education, credentials, awards, memberships/volunteering, publications, skills, research interests, media coverage.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      async execute(_input, options) {
        return fetchJSON(PROFILE_URL, options && options.signal);
      }
    },
    {
      name: 'list_projects',
      title: 'List projects',
      description: 'List portfolio projects, optionally filtered by category (e.g. "Mobile Apps", "Web Apps", "Library", "Compiler", "AI/ML", "Networking", "Desktop Apps") and/or a free-text query matched against title and subtitle.',
      inputSchema: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Exact category label (case-insensitive). Omit for all.' },
          query: { type: 'string', description: 'Case-insensitive substring to match in title or subtitle.' }
        },
        additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      async execute(input, options) {
        const projects = await fetchJSON(PROJECTS_URL, options && options.signal);
        const cat = input && input.category ? String(input.category).toLowerCase() : null;
        const q = input && input.query ? String(input.query).toLowerCase() : null;
        const out = projects
          .filter(p => !cat || p.category.toLowerCase() === cat)
          .filter(p => !q || (p.title + ' ' + (p.subtitle || '')).toLowerCase().includes(q))
          .map(p => ({ ...p, image: `${ORIGIN}/assets/projects/${p.image}` }));
        return { count: out.length, categories: [...new Set(projects.map(p => p.category))], projects: out };
      }
    },
    {
      name: 'get_contact_info',
      title: 'Get contact info',
      description: 'Return ways to reach Ratul: email, WhatsApp, LinkedIn, GitHub, location, the meeting booking link, the resume PDF URL, and the contact-form page.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      async execute() {
        return CONTACT;
      }
    },
    {
      name: 'navigate',
      title: 'Open a section',
      description: 'Show one of the site\'s sections in the current tab: about, resume, projects, research, writings, recognition, or contact.',
      inputSchema: {
        type: 'object',
        properties: { page: { type: 'string', enum: PAGES } },
        required: ['page'],
        additionalProperties: false
      },
      async execute(input) {
        return goTo(String(input.page));
      }
    },
    {
      name: 'show_projects',
      title: 'Show projects filtered',
      description: 'Open the Projects section and apply a category filter in the UI (use "All" to clear).',
      inputSchema: {
        type: 'object',
        properties: { category: { type: 'string', description: 'Category label as shown on the filter bar, or "All".' } },
        required: ['category'],
        additionalProperties: false
      },
      async execute(input) {
        const nav = goTo('projects');
        // Filter buttons are rendered from projects.json after fetch; wait briefly for them.
        for (let i = 0; i < 20; i++) {
          if (clickFilter(String(input.category))) return { ...nav, filter: input.category, applied: true };
          await new Promise(r => setTimeout(r, 100));
        }
        return { ...nav, filter: input.category, applied: false, hint: 'Category not found on the filter bar.' };
      }
    },
    {
      name: 'prefill_contact_form',
      title: 'Prefill contact form',
      description: 'Open the Contact section and fill in the message form (name, email, message). The form is NOT submitted — the user reviews and presses Send.',
      inputSchema: {
        type: 'object',
        properties: {
          fullname: { type: 'string', maxLength: 200 },
          email: { type: 'string', format: 'email', maxLength: 200 },
          message: { type: 'string', maxLength: 5000 }
        },
        required: ['fullname', 'email', 'message'],
        additionalProperties: false
      },
      async execute(input) {
        goTo('contact');
        const form = document.querySelector('[data-form]');
        if (!form) throw new Error('Contact form not found.');
        for (const key of ['fullname', 'email', 'message']) {
          const field = form.elements[key];
          if (!field) continue;
          field.value = String(input[key]);
          field.dispatchEvent(new Event('input', { bubbles: true })); // enables the Send button via script.js
        }
        form.elements.message.focus();
        return { page: 'contact', filled: true, submitted: false, next_step: 'User must click "Send Message".' };
      }
    },
    {
      name: 'open_booking_page',
      title: 'Book a meeting',
      description: 'Open the Google Calendar appointment page ("Quick sync with Ratul") in a new tab so the user can pick a slot.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { consequentialHint: true },
      async execute() {
        const w = window.open(BOOKING_URL, '_blank', 'noopener');
        return { opened: !!w, url: BOOKING_URL };
      }
    },
    {
      name: 'download_resume',
      title: 'Download resume',
      description: 'Open the resume PDF in a new tab (the browser may download it).',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      async execute() {
        const w = window.open(RESUME_URL, '_blank', 'noopener');
        return { opened: !!w, url: RESUME_URL };
      }
    }
  ];

  // ---- register ------------------------------------------------------------

  const done = (typeof ctx.provideContext === 'function')
    ? Promise.resolve(ctx.provideContext({ tools }))
    : Promise.all(tools.map(t => ctx.registerTool(t)));

  done.catch(err => console.warn('[webmcp] tool registration failed:', err));
})();
