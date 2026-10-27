/**
 * Teryak Platform - High-Performance Vanilla SPA Router (Single Page Application Engine)
 * Features:
 * - 0ms Instant Navigation with In-Memory View Caching (Map)
 * - Intelligent Hover & Touch Prefetching (preloads on user intent)
 * - Smooth Hardware-Accelerated Micro-Transitions (fade & slide)
 * - YouTube/GitHub-style Gradient Progress Bar Indicator
 * - Persistent Shared State (<app-navbar>, <app-cart-modal>, Theme, Auth)
 * - HTML5 History API Integration (pushState, popstate, full back/forward support)
 * - Dynamic Page Script Lifecycle (teryak:page-mounted, teryak:before-leave)
 * - Same-Origin & Safe Navigation Filters (ignores external, target="_blank", mailto, etc.)
 * - Anchor smooth scrolling (#rx, #faq, etc.)
 */

class SPARouter {
  constructor() {
    this.cache = new Map();
    this.isNavigating = false;
    this.progressBar = null;
    this.progressTimer = null;
    this.prefetchTimers = new Map();

    this.init();
  }

  init() {
    this.createProgressBar();
    this.cacheCurrentPage();
    this.bindEvents();
    console.log('⚡ [Teryak SPA]: Router initialized with instant prefetch & cache engine.');
  }

  createProgressBar() {
    let bar = document.getElementById('spa-progress-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'spa-progress-bar';
      document.body.prepend(bar);
    }
    this.progressBar = bar;
  }

  startProgress() {
    if (!this.progressBar) return;
    this.progressBar.classList.add('active');
    this.progressBar.style.transform = 'scaleX(0.15)';
    clearTimeout(this.progressTimer);

    this.progressTimer = setTimeout(() => {
      this.progressBar.style.transform = 'scaleX(0.65)';
    }, 120);
  }

  finishProgress() {
    if (!this.progressBar) return;
    clearTimeout(this.progressTimer);
    this.progressBar.style.transform = 'scaleX(1)';
    setTimeout(() => {
      this.progressBar.classList.remove('active');
      setTimeout(() => {
        this.progressBar.style.transform = 'scaleX(0)';
      }, 200);
    }, 150);
  }

  normalizeUrl(rawUrl) {
    try {
      const u = new URL(rawUrl, window.location.origin);
      return u.origin + u.pathname + u.search;
    } catch (e) {
      return rawUrl;
    }
  }

  cacheCurrentPage() {
    const key = this.normalizeUrl(window.location.href);
    const container = document.getElementById('spa-content') || document.querySelector('main');
    if (container) {
      const pageScripts = Array.from(document.querySelectorAll('script[src]'))
        .map(s => {
          try {
            return new URL(s.getAttribute('src'), window.location.href).href;
          } catch (e) {
            return s.getAttribute('src');
          }
        })
        .filter(src => src && (src.includes('/pages/') || src.includes('site.js')));

      const pageStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map(l => {
          try {
            return new URL(l.getAttribute('href'), window.location.href).href;
          } catch (e) {
            return l.getAttribute('href');
          }
        })
        .filter(href => href && href.includes('/pages/'));

      this.cache.set(key, {
        title: document.title,
        bodyPage: document.body.getAttribute('data-page') || '',
        contentHtml: container.innerHTML,
        pageScripts,
        pageStyles,
        timestamp: Date.now()
      });
    }
  }

  bindEvents() {
    document.addEventListener('click', (e) => this.handleClick(e));
    document.addEventListener('mouseover', (e) => this.handlePrefetch(e), { passive: true });
    document.addEventListener('touchstart', (e) => this.handlePrefetch(e), { passive: true });

    window.addEventListener('popstate', () => {
      this.navigateTo(window.location.href, false);
    });
  }

  shouldIntercept(anchor, e) {
    if (!anchor || !anchor.href) return false;
    if (e && e.defaultPrevented) return false;
    if (e && e.button !== 0) return false;
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return false;
    if (anchor.hasAttribute('download')) return false;
    if (anchor.target && anchor.target !== '_self') return false;
    if (anchor.hasAttribute('data-no-spa')) return false;

    try {
      const url = new URL(anchor.href, window.location.origin);
      if (url.origin !== window.location.origin) return false;
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;

      // Exclude standalone dashboard portals with custom sidebars (pharmacist, admin)
      const currentPath = window.location.pathname.replace(/\\/g, '/');
      const targetPath = url.pathname.replace(/\\/g, '/');
      if (
        targetPath.includes('/pages/pharmacist/') ||
        targetPath.includes('/pages/admin/') ||
        currentPath.includes('/pages/pharmacist/') ||
        currentPath.includes('/pages/admin/')
      ) {
        return false;
      }

      // Hash link on same page
      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) {
        return 'hash';
      }

      return true;
    } catch (err) {
      return false;
    }
  }

  handleClick(e) {
    const anchor = e.target.closest('a');
    if (!anchor) return;

    const action = this.shouldIntercept(anchor, e);
    if (!action) return;

    if (action === 'hash') {
      const targetHash = new URL(anchor.href, window.location.origin).hash;
      const targetEl = document.querySelector(targetHash);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
        history.pushState(null, '', targetHash);
      }
      return;
    }

    e.preventDefault();
    this.navigateTo(anchor.href, true);
  }

  handlePrefetch(e) {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    const action = this.shouldIntercept(anchor, e);
    if (!action || action === 'hash') return;

    const key = this.normalizeUrl(anchor.href);
    if (this.cache.has(key)) return;

    if (this.prefetchTimers.has(key)) return;
    const timer = setTimeout(() => {
      this.fetchPage(anchor.href).catch(() => {});
      this.prefetchTimers.delete(key);
    }, 60);
    this.prefetchTimers.set(key, timer);
  }

  async fetchPage(url) {
    const key = this.normalizeUrl(url);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const res = await fetch(url, {
      headers: {
        'X-Requested-With': 'Teryak-SPA-Router'
      }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const container = doc.getElementById('spa-content') || doc.querySelector('main');
    if (!container) throw new Error('No SPA content container found in target page');

    const pageScripts = Array.from(doc.querySelectorAll('script[src]'))
      .map(s => {
        try {
          return new URL(s.getAttribute('src'), url).href;
        } catch (e) {
          return s.getAttribute('src');
        }
      })
      .filter(src => src && (src.includes('/pages/') || src.includes('site.js')));

    const pageStyles = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))
      .map(l => {
        try {
          return new URL(l.getAttribute('href'), url).href;
        } catch (e) {
          return l.getAttribute('href');
        }
      })
      .filter(href => href && href.includes('/pages/'));

    const pageData = {
      title: doc.title,
      bodyPage: doc.body.getAttribute('data-page') || '',
      contentHtml: container.innerHTML,
      pageScripts,
      pageStyles,
      timestamp: Date.now()
    };

    this.cache.set(key, pageData);
    return pageData;
  }

  async navigateTo(url, push = true) {
    if (this.isNavigating) return;
    this.isNavigating = true;

    // 1. Immediately dismiss any open Bootstrap modals and backdrops
    try {
      document.querySelectorAll('.modal.show').forEach(m => {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          const inst = bootstrap.Modal.getInstance(m);
          if (inst) inst.hide();
        }
        m.classList.remove('show');
        m.style.display = 'none';
        m.setAttribute('aria-hidden', 'true');
      });
      document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');
    } catch (e) {}

    const currentContainer = document.getElementById('spa-content') || document.querySelector('main');
    if (!currentContainer) {
      window.location.href = url;
      return;
    }

    window.dispatchEvent(new CustomEvent('teryak:before-leave', { detail: { to: url } }));
    this.startProgress();

    try {
      const pageData = await this.fetchPage(url);

      // Animate out
      currentContainer.classList.add('spa-leaving');
      await new Promise(r => setTimeout(r, 110));

      // Swap Document Metadata
      document.title = pageData.title || document.title;
      if (pageData.bodyPage) {
        document.body.setAttribute('data-page', pageData.bodyPage);
      }

      // Update History
      if (push) {
        window.history.pushState({ url }, pageData.title, url);
      }

      // Inject new CSS if needed
      if (pageData.pageStyles && pageData.pageStyles.length) {
        pageData.pageStyles.forEach(href => {
          const fileName = href.split('/').pop().split('?')[0];
          if (!document.querySelector(`link[href*="${fileName}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
          }
        });
      }

      // Preserve Dark Theme Consistency During SPA Navigation
      const activeTheme = localStorage.getItem('teryak_theme') || localStorage.getItem('theme') || (document.documentElement.getAttribute('data-theme') || 'light');
      if (activeTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark-theme');
        document.documentElement.style.backgroundColor = '#0b1120';
        document.documentElement.style.colorScheme = 'dark';
        document.body.classList.add('dark-theme');
      }

      // Swap Content
      currentContainer.innerHTML = pageData.contentHtml;
      currentContainer.classList.remove('spa-leaving');
      currentContainer.classList.add('spa-entering');
      setTimeout(() => currentContainer.classList.remove('spa-entering'), 250);

      // Scroll Handling
      const targetHash = new URL(url, window.location.origin).hash;
      if (targetHash) {
        const targetEl = document.querySelector(targetHash);
        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }

      // Re-trigger App Navbar state & active link
      const navbar = document.querySelector('app-navbar');
      if (navbar) {
        if (typeof navbar.render === 'function') navbar.render();
        if (typeof navbar.initTheme === 'function') navbar.initTheme();
        if (typeof navbar.bindEvents === 'function') navbar.bindEvents();
        if (typeof navbar.updateAuthState === 'function') navbar.updateAuthState();
        if (typeof navbar.updateCartCount === 'function') navbar.updateCartCount();
      }

      // Load & execute page scripts dynamically and await their completion
      await this.executePageScripts(pageData.pageScripts, pageData.bodyPage);

      // Fire Page Mounted Global Event
      window.dispatchEvent(new CustomEvent('teryak:page-mounted', {
        detail: {
          url,
          page: pageData.bodyPage
        }
      }));

      window.dispatchEvent(new CustomEvent('teryak:auth-change'));
      window.dispatchEvent(new CustomEvent('teryak:cart-change'));

      this.finishProgress();
    } catch (err) {
      console.warn('⚠️ [Teryak SPA]: SPA navigation error, falling back to browser navigation:', err);
      window.location.href = url;
    } finally {
      this.isNavigating = false;
    }
  }

  async executePageScripts(scripts, pageName) {
    if (!scripts || !scripts.length) return;

    for (const src of scripts) {
      const scriptName = src.split('/').pop().split('?')[0];

      const existing = document.querySelector(`script[data-spa-script="${scriptName}"]`);
      if (existing) existing.remove();

      await new Promise((resolve) => {
        const scriptEl = document.createElement('script');
        scriptEl.src = src + (src.includes('?') ? '&' : '?') + 't=' + Date.now();
        scriptEl.setAttribute('data-spa-script', scriptName);
        scriptEl.async = false;
        scriptEl.onload = () => resolve();
        scriptEl.onerror = (err) => {
          console.warn(`[Teryak SPA]: Failed to load script: ${src}`, err);
          resolve();
        };
        document.body.appendChild(scriptEl);
      });
    }
  }
}

// Global Singleton Instance
if (!window.SPARouterInstance) {
  window.SPARouterInstance = new SPARouter();
}
