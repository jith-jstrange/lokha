/**
 * Lokha.Today - Medium-Grade Global Publishing Engine & Physics Suite
 * Features:
 * - Floating Discreet Reading Studio Dial (Bottom-Right corner & Header Aa button)
 * - Medium-Style Claps Reaction System (👏 with floating particle bursts)
 * - Reading List Bookmarking (🔖 saved locally with instant sidebar sync)
 * - Topic Pill Filtering for all 12 Traditions (Smooth spring transitions)
 * - Celestial Grand Colophon Seal (Gyro physics & star aura at bottom)
 * - Web Speech Story Narrator & Dynamic Table of Contents
 * - Zen Focus Mode (Distraction-free reading)
 */

(function () {
  'use strict';

  // 1. Initial State Restoration
  const savedTheme = localStorage.getItem('lokha-paper-theme') || 'parchment';
  const savedFont = localStorage.getItem('lokha-font-family') || 'serif';
  const savedSize = localStorage.getItem('lokha-font-size') || 'md';

  document.documentElement.setAttribute('data-paper-theme', savedTheme);
  document.documentElement.setAttribute('data-font-family', savedFont);
  document.documentElement.setAttribute('data-font-size', savedSize);

  document.addEventListener('DOMContentLoaded', () => {
    initNavigationMenu();
    initStickyHeader();
    initReadingStudioDial();
    initMediumTopicFilter();
    initClapsSystem();
    initBookmarksSystem();
    initCelestialColophon();
    initReadingProgress();
    initTableOfContents();
    initReadingResume();
  });

  // =========================================================================
  // 1. FLOATING READING STUDIO DIAL (Bottom-Right Corner & Header Aa)
  // =========================================================================
  function initReadingStudioDial() {
    const dialTrigger = document.getElementById('reading-dial-trigger');
    const headerStudioBtn = document.getElementById('header-reading-studio-btn');
    const studioPanel = document.getElementById('reading-studio-panel');
    const studioCloseBtn = document.getElementById('studio-close-btn');

    function toggleStudio() {
      if (!studioPanel) return;
      studioPanel.classList.toggle('is-open');
    }

    function closeStudio() {
      if (studioPanel) studioPanel.classList.remove('is-open');
    }

    if (dialTrigger) dialTrigger.addEventListener('click', toggleStudio);
    if (headerStudioBtn) headerStudioBtn.addEventListener('click', toggleStudio);
    if (studioCloseBtn) studioCloseBtn.addEventListener('click', closeStudio);

    document.addEventListener('click', (e) => {
      if (!studioPanel) return;
      const isInside = studioPanel.contains(e.target);
      const isDial = dialTrigger && dialTrigger.contains(e.target);
      const isHeaderBtn = headerStudioBtn && headerStudioBtn.contains(e.target);
      if (!isInside && !isDial && !isHeaderBtn && studioPanel.classList.contains('is-open')) {
        closeStudio();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeStudio();
    });

    // Theme Swatches
    const themeButtons = document.querySelectorAll('[data-set-theme]');
    themeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-set-theme');
        document.documentElement.setAttribute('data-paper-theme', theme);
        localStorage.setItem('lokha-paper-theme', theme);
        updateActiveThemeButtons(theme);
      });
    });

    function updateActiveThemeButtons(activeTheme) {
      themeButtons.forEach((btn) => {
        if (btn.getAttribute('data-set-theme') === activeTheme) {
          btn.classList.add('is-active');
        } else {
          btn.classList.remove('is-active');
        }
      });
    }
    updateActiveThemeButtons(document.documentElement.getAttribute('data-paper-theme') || 'parchment');

    // Font Scaling
    const decreaseBtn = document.getElementById('font-decrease-btn');
    const increaseBtn = document.getElementById('font-increase-btn');
    const sizeMap = ['sm', 'md', 'lg', 'xl'];

    function changeFontSize(direction) {
      const current = document.documentElement.getAttribute('data-font-size') || 'md';
      let idx = sizeMap.indexOf(current);
      if (idx === -1) idx = 1;

      if (direction === 'increase' && idx < sizeMap.length - 1) idx++;
      else if (direction === 'decrease' && idx > 0) idx--;

      const newSize = sizeMap[idx];
      document.documentElement.setAttribute('data-font-size', newSize);
      localStorage.setItem('lokha-font-size', newSize);
    }

    if (decreaseBtn) decreaseBtn.addEventListener('click', () => changeFontSize('decrease'));
    if (increaseBtn) increaseBtn.addEventListener('click', () => changeFontSize('increase'));

    // Font Family Switcher
    const fontToggleBtn = document.getElementById('toggle-font-btn');
    if (fontToggleBtn) {
      fontToggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-font-family') || 'serif';
        const next = current === 'serif' ? 'sans' : 'serif';
        document.documentElement.setAttribute('data-font-family', next);
        localStorage.setItem('lokha-font-family', next);
        fontToggleBtn.textContent = next === 'serif' ? 'Aa Serif' : 'Aa Sans';
      });
    }

    // Zen Focus Mode
    const zenBtn = document.getElementById('zen-mode-toggle-btn');
    const exitZenBtn = document.getElementById('exit-zen-btn');

    function toggleZenMode() {
      document.body.classList.toggle('zen-focus-mode');
      closeStudio();
    }

    if (zenBtn) zenBtn.addEventListener('click', toggleZenMode);
    if (exitZenBtn) exitZenBtn.addEventListener('click', toggleZenMode);

    document.addEventListener('keydown', (e) => {
      if ((e.key === 'f' || e.key === 'F') && !e.target.matches('input, textarea')) {
        toggleZenMode();
      }
    });

    // Audio Story Narrator
    initAudioNarrator();
  }

  // =========================================================================
  // 2. AUDIO STORY NARRATOR
  // =========================================================================
  function initAudioNarrator() {
    const narratorBtn = document.getElementById('story-narrator-btn');
    if (!narratorBtn) return;

    if (!('speechSynthesis' in window)) {
      narratorBtn.style.display = 'none';
      return;
    }

    let isPlaying = false;
    let utterance = null;

    narratorBtn.addEventListener('click', () => {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        isPlaying = false;
        narratorBtn.classList.remove('is-playing');
        const label = narratorBtn.querySelector('.audio-label');
        if (label) label.textContent = 'Listen';
      } else {
        const article = document.querySelector('.gh-content');
        if (!article) return;
        const textToRead = article.innerText;

        utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.rate = 0.92;
        utterance.pitch = 1.0;

        utterance.onend = () => {
          isPlaying = false;
          narratorBtn.classList.remove('is-playing');
          const label = narratorBtn.querySelector('.audio-label');
          if (label) label.textContent = 'Listen';
        };

        utterance.onerror = () => {
          isPlaying = false;
          narratorBtn.classList.remove('is-playing');
          const label = narratorBtn.querySelector('.audio-label');
          if (label) label.textContent = 'Listen';
        };

        window.speechSynthesis.speak(utterance);
        isPlaying = true;
        narratorBtn.classList.add('is-playing');
        const label = narratorBtn.querySelector('.audio-label');
        if (label) label.textContent = 'Pause';
      }
    });
  }

  // =========================================================================
  // 3. MEDIUM-STYLE TOPIC PILL FILTERING (All 12 Traditions)
  // =========================================================================
  function initMediumTopicFilter() {
    const topicPills = document.querySelectorAll('.topic-pill');
    const storyRows = document.querySelectorAll('.medium-story-row');

    if (!topicPills.length || !storyRows.length) return;

    topicPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        topicPills.forEach((p) => p.classList.remove('is-active'));
        pill.classList.add('is-active');

        const filterTag = pill.getAttribute('data-filter-tag');

        storyRows.forEach((row) => {
          if (!filterTag || filterTag === 'all') {
            row.style.display = 'flex';
            row.style.opacity = '0';
            row.style.transform = 'translateY(8px)';
            requestAnimationFrame(() => {
              row.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
              row.style.opacity = '1';
              row.style.transform = 'translateY(0)';
            });
          } else {
            const classes = row.className.toLowerCase();
            const matches = classes.includes(`tag-${filterTag}`) || classes.includes(filterTag);
            if (matches) {
              row.style.display = 'flex';
              row.style.opacity = '0';
              row.style.transform = 'translateY(8px)';
              requestAnimationFrame(() => {
                row.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
              });
            } else {
              row.style.display = 'none';
            }
          }
        });
      });
    });
  }

  // =========================================================================
  // 4. MEDIUM-STYLE CLAPS REACTION SYSTEM (👏 + Floating Burst)
  // =========================================================================
  function initClapsSystem() {
    const clapButtons = document.querySelectorAll('.clap-btn');

    clapButtons.forEach((btn) => {
      const slug = btn.getAttribute('data-post-slug');
      if (!slug) return;

      const storageKey = `lokha_claps_${slug}`;
      const countEl = btn.querySelector('.clap-count');
      let claps = parseInt(localStorage.getItem(storageKey) || '0', 10);

      if (countEl) {
        countEl.textContent = claps > 0 ? claps : '👏';
      }

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        claps++;
        localStorage.setItem(storageKey, claps.toString());
        if (countEl) countEl.textContent = claps;

        btn.classList.add('is-clapping');
        setTimeout(() => btn.classList.remove('is-clapping'), 300);

        createClapBubble(btn);
      });
    });

    function createClapBubble(targetBtn) {
      const bubble = document.createElement('div');
      bubble.className = 'clap-floating-bubble';
      bubble.textContent = '+1 👏';
      targetBtn.appendChild(bubble);
      requestAnimationFrame(() => bubble.classList.add('animate-up'));
      setTimeout(() => bubble.remove(), 700);
    }
  }

  // =========================================================================
  // 5. READING LIST / BOOKMARKS SYSTEM (🔖 LocalStorage + Sidebar Sync)
  // =========================================================================
  function initBookmarksSystem() {
    const bookmarkBtns = document.querySelectorAll('.bookmark-btn');
    const readingListContainer = document.getElementById('reading-list-items');
    const clearBtn = document.getElementById('clear-bookmarks-btn');

    function getBookmarks() {
      try {
        return JSON.parse(localStorage.getItem('lokha_reading_list') || '[]');
      } catch (e) {
        return [];
      }
    }

    function saveBookmarks(list) {
      localStorage.setItem('lokha_reading_list', JSON.stringify(list));
      renderReadingList();
      updateButtonStates();
    }

    function updateButtonStates() {
      const list = getBookmarks();
      const slugs = list.map((item) => item.slug);

      bookmarkBtns.forEach((btn) => {
        const slug = btn.getAttribute('data-post-slug');
        if (slugs.includes(slug)) {
          btn.classList.add('is-bookmarked');
          btn.querySelector('.bookmark-icon').textContent = '🏷️';
        } else {
          btn.classList.remove('is-bookmarked');
          btn.querySelector('.bookmark-icon').textContent = '🔖';
        }
      });
    }

    function renderReadingList() {
      if (!readingListContainer) return;
      const list = getBookmarks();

      if (list.length === 0) {
        readingListContainer.innerHTML = '<p class="reading-list-empty">Click 🔖 on any dispatch to save it here for later.</p>';
        return;
      }

      readingListContainer.innerHTML = list.map((item) => `
        <div class="reading-list-item">
          <a href="${item.url}" class="reading-item-title">${item.title}</a>
          <button class="remove-bookmark-btn" data-slug="${item.slug}" title="Remove">&times;</button>
        </div>
      `).join('');

      readingListContainer.querySelectorAll('.remove-bookmark-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const slug = btn.getAttribute('data-slug');
          const current = getBookmarks();
          saveBookmarks(current.filter((item) => item.slug !== slug));
        });
      });
    }

    bookmarkBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const slug = btn.getAttribute('data-post-slug');
        const title = btn.getAttribute('data-post-title') || 'Untitled';
        const url = btn.getAttribute('data-post-url') || '#';

        let list = getBookmarks();
        const existingIdx = list.findIndex((item) => item.slug === slug);

        if (existingIdx !== -1) {
          list.splice(existingIdx, 1);
        } else {
          list.unshift({ slug, title, url });
        }

        saveBookmarks(list);
      });
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        saveBookmarks([]);
      });
    }

    renderReadingList();
    updateButtonStates();
  }

  // =========================================================================
  // 6. CELESTIAL COLOPHON SEAL (Bottom Footer Gyro Physics)
  // =========================================================================
  function initCelestialColophon() {
    const emblemContainer = document.getElementById('celestial-emblem');
    const emblemImg = emblemContainer ? emblemContainer.querySelector('.hero-emblem-image') : null;
    if (!emblemContainer || !emblemImg) return;

    let bounds;

    function onMouseMove(e) {
      if (!bounds) bounds = emblemContainer.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const center = {
        x: mouseX - (bounds.left + bounds.width / 2),
        y: mouseY - (bounds.top + bounds.height / 2),
      };

      const distance = Math.sqrt(center.x ** 2 + center.y ** 2);
      if (distance < 300) {
        const rotateX = (-center.y / bounds.height) * 20;
        const rotateY = (center.x / bounds.width) * 20;
        emblemImg.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.06, 1.06, 1.06)`;
      }
    }

    function onMouseLeave() {
      emblemImg.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      bounds = null;
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    emblemContainer.addEventListener('mouseleave', onMouseLeave);
  }

  // =========================================================================
  // 7. STICKY TOP NAV & SCROLL SENSING
  // =========================================================================
  function initStickyHeader() {
    const navContainer = document.querySelector('.floating-nav-container');
    if (!navContainer) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        navContainer.classList.add('is-scrolled');
      } else {
        navContainer.classList.remove('is-scrolled');
      }
    }, { passive: true });
  }

  // =========================================================================
  // 8. NAVIGATION & EXPLORE POPOVER
  // =========================================================================
  function initNavigationMenu() {
    const menuTrigger = document.getElementById('menu-popover-trigger');
    const menuDropdown = document.getElementById('menu-popover-dropdown');
    const backdrop = document.getElementById('popover-backdrop');
    const closeBtn = document.getElementById('popover-close-btn');

    function openMenu() {
      if (menuDropdown) menuDropdown.classList.add('is-open');
      if (backdrop) backdrop.classList.add('is-open');
    }

    function closeMenu() {
      if (menuDropdown) menuDropdown.classList.remove('is-open');
      if (backdrop) backdrop.classList.remove('is-open');
    }

    if (menuTrigger && menuDropdown) {
      menuTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (menuDropdown.classList.contains('is-open')) closeMenu();
        else openMenu();
      });

      if (backdrop) backdrop.addEventListener('click', closeMenu);
      if (closeBtn) closeBtn.addEventListener('click', closeMenu);

      document.addEventListener('click', (e) => {
        if (!menuDropdown.contains(e.target) && !menuTrigger.contains(e.target)) {
          closeMenu();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
      });
    }
  }

  // =========================================================================
  // 9. READING PROGRESS BAR
  // =========================================================================
  function initReadingProgress() {
    const progressBar = document.getElementById('reading-progress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const scrolled = (window.scrollY / docHeight) * 100;
        const bounded = Math.min(100, Math.max(0, scrolled));
        progressBar.style.width = `${bounded}%`;
      }
    }, { passive: true });
  }

  // =========================================================================
  // 10. DYNAMIC TABLE OF CONTENTS & SCROLLSPY
  // =========================================================================
  function initTableOfContents() {
    const article = document.querySelector('.gh-content');
    if (!article) return;

    const headings = article.querySelectorAll('h2, h3');
    if (headings.length < 2) return;

    const tocContainer = document.createElement('aside');
    tocContainer.className = 'story-toc-container';
    tocContainer.innerHTML = `
      <div class="toc-header">
        <span class="toc-emblem">✦</span>
        <span class="toc-title">Story Outline</span>
      </div>
      <nav class="toc-nav" id="toc-nav"></nav>
    `;

    const tocNav = tocContainer.querySelector('#toc-nav');
    headings.forEach((heading, idx) => {
      if (!heading.id) {
        heading.id = `section-${idx + 1}-${heading.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      }
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.className = `toc-link toc-${heading.tagName.toLowerCase()}`;
      link.textContent = heading.textContent;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      tocNav.appendChild(link);
    });

    const headerElem = document.querySelector('.post-full-header');
    if (headerElem && headerElem.nextElementSibling) {
      headerElem.parentNode.insertBefore(tocContainer, headerElem.nextElementSibling);
    }

    const tocLinks = tocNav.querySelectorAll('.toc-link');
    window.addEventListener('scroll', () => {
      let currentId = '';
      headings.forEach((h) => {
        const top = h.getBoundingClientRect().top;
        if (top <= 140) {
          currentId = h.id;
        }
      });
      tocLinks.forEach((link) => {
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('is-active');
        } else {
          link.classList.remove('is-active');
        }
      });
    }, { passive: true });
  }

  // =========================================================================
  // 11. READING RESUME MEMORY
  // =========================================================================
  function initReadingResume() {
    const article = document.querySelector('.post-full-container');
    if (!article) return;

    const pageKey = `lokha-scroll-${window.location.pathname}`;
    const savedPos = localStorage.getItem(pageKey);

    if (savedPos && Number(savedPos) > 300) {
      const toast = document.createElement('div');
      toast.className = 'reading-resume-toast';
      toast.innerHTML = `
        <span>Resume reading where you left off?</span>
        <button id="resume-scroll-btn">Resume &rarr;</button>
        <button id="dismiss-scroll-btn">&times;</button>
      `;
      document.body.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add('is-visible'));

      toast.querySelector('#resume-scroll-btn').addEventListener('click', () => {
        window.scrollTo({ top: Number(savedPos), behavior: 'smooth' });
        toast.classList.remove('is-visible');
        setTimeout(() => toast.remove(), 300);
      });

      toast.querySelector('#dismiss-scroll-btn').addEventListener('click', () => {
        toast.classList.remove('is-visible');
        setTimeout(() => toast.remove(), 300);
      });
    }

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        localStorage.setItem(pageKey, window.scrollY.toString());
      }
    }, { passive: true });
  }
})();
