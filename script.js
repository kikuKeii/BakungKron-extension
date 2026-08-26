(() => {
  'use strict';

  const STORAGE_KEYS = {
    bookmarks: 'ms_bookmarks',
    shortcuts: 'ms_shortcuts',
    searchEngine: 'ms_search_engine',
    searchHistory: 'ms_search_history',
    theme: 'ms_theme',
    accentColor: 'ms_accent_color',
    bgType: 'ms_bg_type',
    bgImage: 'ms_bg_image',
  };

  const SEARCH_ENGINES = [
    { name: 'Google', url: 'https://www.google.com/search?q=', icon: 'https://www.google.com/favicon.ico', suggest: 'https://suggestqueries.google.com/complete/search?client=firefox&q=' },
    { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: 'https://www.bing.com/favicon.ico', suggest: 'https://api.bing.com/osjson.aspx?query=' },
    { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: 'https://duckduckgo.com/favicon.ico', suggest: 'https://duckduckgo.com/ac/?q=&type=list' },
    { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=', icon: 'https://www.youtube.com/favicon.ico', suggest: 'https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=' },
    { name: 'GitHub', url: 'https://github.com/search?q=', icon: 'https://github.com/favicon.ico', suggest: '' },
    { name: 'Wikipedia', url: 'https://en.wikipedia.org/w/index.php?search=', icon: 'https://en.wikipedia.org/favicon.ico', suggest: 'https://en.wikipedia.org/w/api.php?action=opensearch&limit=8&search=' },
    { name: 'Reddit', url: 'https://www.reddit.com/search/?q=', icon: 'https://www.reddit.com/favicon.ico', suggest: '' },
    { name: 'Amazon', url: 'https://www.amazon.com/s?k=', icon: 'https://www.amazon.com/favicon.ico', suggest: 'https://completion.amazon.com/api/2017/suggestions?mid=ATVPDKIKX0DER&alias=aps&prefix=' },
  ];

  const ACCENT_COLORS = {
    '#6c5ce7': { hover: '#7e6ff0', glow: 'rgba(108, 92, 231, 0.3)' },
    '#00b894': { hover: '#00d9a4', glow: 'rgba(0, 184, 148, 0.3)' },
    '#fd79a8': { hover: '#fd8fb3', glow: 'rgba(253, 121, 168, 0.3)' },
    '#fdcb6e': { hover: '#fdd589', glow: 'rgba(253, 203, 110, 0.3)' },
    '#0984e3': { hover: '#2196f3', glow: 'rgba(9, 132, 227, 0.3)' },
    '#e17055': { hover: '#e8836c', glow: 'rgba(225, 112, 85, 0.3)' },
    '#00cec9': { hover: '#26d9d5', glow: 'rgba(0, 206, 201, 0.3)' },
    '#ff6b6b': { hover: '#ff8585', glow: 'rgba(255, 107, 107, 0.3)' },
    '#a29bfe': { hover: '#b0abfe', glow: 'rgba(162, 155, 254, 0.3)' },
    '#55efc4': { hover: '#6ff2cc', glow: 'rgba(85, 239, 196, 0.3)' },
  };

  const BG_GRADIENTS = {
    'gradient-1': 'linear-gradient(135deg, #0a0a0f, #1a1a2e)',
    'gradient-2': 'linear-gradient(135deg, #0c0c1d, #1b1464)',
    'gradient-3': 'linear-gradient(135deg, #0d1117, #161b22)',
    'gradient-4': 'linear-gradient(135deg, #1a0a2e, #2d1b69)',
    'gradient-5': 'linear-gradient(135deg, #0f2027, #203a43)',
    'gradient-6': 'linear-gradient(135deg, #1f1c2c, #928dab)',
    'gradient-7': 'linear-gradient(135deg, #232526, #414345)',
    'gradient-8': 'linear-gradient(135deg, #000428, #004e92)',
    'gradient-9': 'linear-gradient(135deg, #200122, #6f0000)',
    'gradient-10': 'linear-gradient(135deg, #141e30, #243b55)',
    'gradient-11': 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    'gradient-12': 'linear-gradient(135deg, #000000, #434343)',
    'gradient-13': 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)',
    'gradient-14': 'linear-gradient(135deg, #0f2027, #2c5364)',
    'gradient-15': 'linear-gradient(135deg, #2c3e50, #fd746c)',
    'gradient-16': 'linear-gradient(135deg, #373b44, #4286f4)',
  };

  function load(key, fallback) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  }

  function save(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function getFaviconUrl(url) {
    try {
      const u = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
    } catch { return ''; }
  }

  function timeAgo(date) {
    const diff = Date.now() - date;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  }

  function hasChromeApi() {
    return typeof chrome !== 'undefined' && chrome.bookmarks;
  }

  /* --- Clock & Greeting --- */
  function updateClock() {
    const now = new Date();
    const h = now.getHours();
    let greet = 'Good evening';
    if (h < 12) greet = 'Good morning';
    else if (h < 18) greet = 'Good afternoon';

    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    const greetingEl = document.getElementById('greeting');
    greetingEl.innerHTML = `<span class="time-display">${time}</span><span class="date-display">${greet} — ${date}</span>`;
  }

  /* --- Search Engine --- */
  let currentEngine = load(STORAGE_KEYS.searchEngine, 0);

  function renderSearchEngines() {
    const dropdown = document.getElementById('searchEngineDropdown');
    const icon = document.getElementById('searchEngineIcon');

    icon.src = SEARCH_ENGINES[currentEngine].icon;
    dropdown.innerHTML = SEARCH_ENGINES.map((e, i) =>
      `<div class="search-engine-option ${i === currentEngine ? 'active' : ''}" data-idx="${i}">
        <img src="${e.icon}" alt="${e.name}"> ${e.name}
      </div>`
    ).join('');

    dropdown.querySelectorAll('.search-engine-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        currentEngine = parseInt(opt.dataset.idx);
        save(STORAGE_KEYS.searchEngine, currentEngine);
        icon.src = SEARCH_ENGINES[currentEngine].icon;
        dropdown.classList.remove('open');
        renderSearchEngines();
      });
    });
  }

  function saveSearchToHistory(query) {
    if (!query) return;
    const history = load(STORAGE_KEYS.searchHistory, []);
    const filtered = history.filter(h => h !== query);
    filtered.unshift(query);
    save(STORAGE_KEYS.searchHistory, filtered.slice(0, 20));
  }

  let suggestCache = '';
  let suggestResults = [];

  async function fetchSuggestions(query) {
    const engine = SEARCH_ENGINES[currentEngine];
    if (!engine.suggest || !query) { suggestResults = []; return; }

    try {
      let url = engine.suggest + encodeURIComponent(query);

      if (currentEngine === 2) {
        url = 'https://duckduckgo.com/ac/?q=' + encodeURIComponent(query) + '&type=list';
      }

      const resp = await fetch(url);
      const data = await resp.json();
      let results = [];

      if (currentEngine === 0 || currentEngine === 3) {
        results = data[1] || [];
      } else if (currentEngine === 2) {
        results = (data[1] || []).map(item => typeof item === 'string' ? item : item.phrase || '');
      } else if (currentEngine === 1) {
        results = data[1] || [];
      } else if (currentEngine === 5) {
        results = data[1] || [];
      } else if (currentEngine === 7) {
        results = (data.suggestions || []).map(s => typeof s === 'string' ? s : s.value || '');
      } else {
        results = data[1] || [];
      }

      suggestResults = results.filter(Boolean).slice(0, 6);
    } catch {
      suggestResults = [];
    }
  }

  async function renderSearchDropdown(filter) {
    const history = load(STORAGE_KEYS.searchHistory, []);
    const list = document.getElementById('searchHistoryList');
    const filteredHistory = filter
      ? history.filter(h => h.toLowerCase().includes(filter.toLowerCase()))
      : history;

    if (filter && filter !== suggestCache) {
      suggestCache = filter;
      await fetchSuggestions(filter);
    }

    if (!filter) {
      suggestResults = [];
      suggestCache = '';
    }

    if (!filteredHistory.length && !suggestResults.length) {
      list.innerHTML = '';
      list.classList.remove('open');
      return;
    }

    let html = '';

    if (suggestResults.length) {
      html += `<div class="search-section-label">Suggestions</div>`;
      html += suggestResults.map(s =>
        `<div class="search-history-item search-suggestion" data-query="${s}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <span>${s}</span>
        </div>`
      ).join('');
    }

    if (filteredHistory.length) {
      if (suggestResults.length) {
        html += `<div class="search-section-label">Recent</div>`;
      }
      html += filteredHistory.map(h => {
        const realIdx = history.indexOf(h);
        return `<div class="search-history-item" data-query="${h}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <span>${h}</span>
          <button class="search-history-delete" data-idx="${realIdx}">&times;</button>
        </div>`;
      }).join('');
      html += `<div class="search-history-clear" id="clearSearchHistory">Clear history</div>`;
    }

    list.innerHTML = html;
    list.classList.add('open');

    list.querySelectorAll('.search-history-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.search-history-delete')) return;
        const q = item.dataset.query;
        document.getElementById('searchInput').value = q;
        list.classList.remove('open');
      });
    });

    list.querySelectorAll('.search-history-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx);
        const hist = load(STORAGE_KEYS.searchHistory, []);
        hist.splice(idx, 1);
        save(STORAGE_KEYS.searchHistory, hist);
        renderSearchDropdown(filter);
      });
    });

    document.getElementById('clearSearchHistory')?.addEventListener('click', () => {
      save(STORAGE_KEYS.searchHistory, []);
      list.classList.remove('open');
    });
  }

  function initSearch() {
    const input = document.getElementById('searchInput');
    const btn = document.getElementById('searchBtn');
    const selector = document.getElementById('searchEngineSelector');
    const dropdown = document.getElementById('searchEngineDropdown');
    const historyList = document.getElementById('searchHistoryList');

    renderSearchEngines();

    selector.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      dropdown.classList.toggle('open');
      historyList.classList.remove('open');
    });

    dropdown.addEventListener('click', (e) => e.stopPropagation());
    historyList.addEventListener('click', (e) => e.stopPropagation());

    document.addEventListener('click', () => {
      dropdown.classList.remove('open');
      historyList.classList.remove('open');
    });

    input.addEventListener('input', () => {
      renderSearchDropdown(input.value.trim());
    });

    input.addEventListener('focus', () => {
      renderSearchDropdown(input.value.trim());
    });

    function doSearch() {
      const q = input.value.trim();
      if (!q) return;
      saveSearchToHistory(q);
      historyList.classList.remove('open');
      if (q.startsWith('http://') || q.startsWith('https://') || q.includes('.') && !q.includes(' ')) {
        window.location.href = q.startsWith('http') ? q : 'https://' + q;
      } else {
        window.location.href = SEARCH_ENGINES[currentEngine].url + encodeURIComponent(q);
      }
    }

    btn.addEventListener('click', doSearch);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSearch();
      if (e.key === 'Escape') historyList.classList.remove('open');
    });
    input.focus();
  }

  /* --- Bookmarks (Chrome API + Folders + Manual) --- */
  let chromeTree = [];
  let chromeBookmarks = [];
  let chromeFolders = [];
  let allDisplayItems = [];
  let currentFolderId = null;
  let folderPath = [];

  const ROOT_FOLDER_NAMES = {
    '0': 'All Bookmarks',
    '1': 'Bookmarks Bar',
    '2': 'Other Bookmarks',
    '3': 'Mobile Bookmarks',
  };

  function resolveFolderName(node) {
    if (node.title) return node.title;
    if (ROOT_FOLDER_NAMES[node.id]) return ROOT_FOLDER_NAMES[node.id];
    if (node.id === '0') return 'All Bookmarks';
    return 'Untitled';
  }

  function getFavicon(url) {
    return `<img src="${getFaviconUrl(url)}" alt="" onerror="this.parentElement.innerHTML='🔗'">`;
  }

  function renderBookmarks() {
    const grid = document.getElementById('bookmarksGrid');
    const breadcrumb = document.getElementById('bookmarkBreadcrumb');

    breadcrumb.innerHTML = folderPath.map((f, i) => {
      const isLast = i === folderPath.length - 1;
      const sep = i > 0 ? '<span class="breadcrumb-sep">/</span>' : '';
      return `${sep}<span class="breadcrumb-item" data-id="${f.id}">${f.name}</span>`;
    }).join('');

    breadcrumb.querySelectorAll('.breadcrumb-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        navigateToFolder(id === 'root' ? null : id);
      });
    });

    if (!allDisplayItems.length) {
      grid.innerHTML = `<div class="empty-state"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>No bookmarks here. Click + to add.</div>`;
      return;
    }

    grid.innerHTML = allDisplayItems.map((item, i) => {
      if (item._isFolder) {
        return `<div class="bookmark-item folder-item" data-idx="${i}" title="${item.name}">
          <button class="bookmark-delete" data-idx="${i}">&times;</button>
          <div class="bookmark-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </div>
          <span class="bookmark-name">${item.name}</span>
        </div>`;
      }
      const iconContent = item.icon && /\p{Emoji}/u.test(item.icon) && !item.icon.startsWith('http')
        ? item.icon
        : getFavicon(item.url);

      return `<a class="bookmark-item" href="${item.url}" title="${item.name}" data-idx="${i}">
        <button class="bookmark-delete" data-idx="${i}">&times;</button>
        <div class="bookmark-icon">${iconContent}</div>
        <span class="bookmark-name">${item.name}</span>
      </a>`;
    }).join('');

    grid.querySelectorAll('.bookmark-item.folder-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.bookmark-delete')) return;
        const idx = parseInt(el.dataset.idx);
        const item = allDisplayItems[idx];
        navigateToFolder(item._folderId);
      });
    });

    grid.querySelectorAll('.bookmark-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx);
        const item = allDisplayItems[idx];

        if (item._isFolder && hasChromeApi()) {
          chrome.bookmarks.removeTree(item._folderId, () => refreshBookmarks());
          return;
        }

        if (item._chromeId && hasChromeApi()) {
          chrome.bookmarks.remove(item._chromeId, () => refreshBookmarks());
          return;
        }

        const manualBookmarks = load(STORAGE_KEYS.bookmarks, []);
        const manualIdx = manualBookmarks.findIndex(m => m.url === item.url && m.name === item.name);
        if (manualIdx !== -1) {
          manualBookmarks.splice(manualIdx, 1);
          save(STORAGE_KEYS.bookmarks, manualBookmarks);
        }
        refreshBookmarks();
      });
    });
  }

  function navigateToFolder(folderId) {
    currentFolderId = folderId;
    buildFolderPath();
    filterDisplayItems();
    renderBookmarks();
  }

  function buildFolderPath() {
    folderPath = [{ id: 'root', name: 'Bookmarks' }];
    if (!currentFolderId) return;

    function findPath(node, targetId, path) {
      if (node.id === targetId) {
        path.push({ id: node.id, name: resolveFolderName(node) });
        return true;
      }
      if (node.children) {
        for (const child of node.children) {
          if (findPath(child, targetId, path)) {
            path.unshift({ id: node.id, name: resolveFolderName(node) });
            return true;
          }
        }
      }
      return false;
    }

    for (const root of chromeTree) {
      const path = [];
      if (findPath(root, currentFolderId, path)) {
        folderPath = path;
        break;
      }
    }
  }

  function filterDisplayItems() {
    allDisplayItems = [];

    function findNode(node, id) {
      if (!id) return node;
      if (node.id === id) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child, id);
          if (found) return found;
        }
      }
      return null;
    }

    let parentNode = null;
    for (const root of chromeTree) {
      parentNode = findNode(root, currentFolderId);
      if (parentNode) break;
    }

    if (parentNode && parentNode.children) {
      parentNode.children.forEach(child => {
        if (child.children) {
          allDisplayItems.push({
            name: resolveFolderName(child),
            _isFolder: true,
            _folderId: child.id,
          });
        } else if (child.url && !child.url.startsWith('chrome://')) {
          allDisplayItems.push({
            name: child.title || child.url,
            url: child.url,
            _chromeId: child.id,
            _chrome: true,
          });
        }
      });
    }

    const manualBookmarks = load(STORAGE_KEYS.bookmarks, []);
    if (!currentFolderId) {
      const seenUrls = new Set(allDisplayItems.filter(b => b.url).map(b => b.url.replace(/\/$/, '')));
      manualBookmarks.forEach(b => {
        const key = (b.url || '').replace(/\/$/, '');
        if (key && !seenUrls.has(key)) {
          seenUrls.add(key);
          allDisplayItems.push({ ...b, _chrome: false });
        }
      });
    }
  }

  async function fetchChromeBookmarks() {
    if (!hasChromeApi()) return;

    return new Promise((resolve) => {
      chrome.bookmarks.getTree((tree) => {
        chromeTree = tree;
        chromeBookmarks = [];
        chromeFolders = [];

        function walk(node) {
          if (node.children) {
            node.children.forEach(child => {
              if (child.children) {
                chromeFolders.push({ id: child.id, name: resolveFolderName(child), parentId: node.id });
              } else if (child.url && !child.url.startsWith('chrome://')) {
                chromeBookmarks.push({ id: child.id, name: child.title || child.url, url: child.url });
              }
              walk(child);
            });
          }
        }
        tree.forEach(walk);
        resolve();
      });
    });
  }

  async function refreshBookmarks() {
    await fetchChromeBookmarks();
    filterDisplayItems();
    renderBookmarks();
  }

  async function initBookmarks() {
    await fetchChromeBookmarks();
    filterDisplayItems();
    renderBookmarks();

    setInterval(() => refreshBookmarks(), 10000);
    window.addEventListener('focus', () => refreshBookmarks());

    document.getElementById('addBookmarkBtn').addEventListener('click', () => {
      document.getElementById('bookmarkModal').classList.add('open');
      document.getElementById('bookmarkName').value = '';
      document.getElementById('bookmarkUrl').value = '';
      document.getElementById('bookmarkIcon').value = '';
      document.getElementById('bookmarkName').focus();
    });

    document.getElementById('saveBookmarkBtn').addEventListener('click', () => {
      const name = document.getElementById('bookmarkName').value.trim();
      let url = document.getElementById('bookmarkUrl').value.trim();
      const icon = document.getElementById('bookmarkIcon').value.trim() || '';

      if (!name || !url) return;
      if (!url.startsWith('http')) url = 'https://' + url;

      if (hasChromeApi() && currentFolderId) {
        chrome.bookmarks.create({ parentId: currentFolderId, title: name, url }, () => {
          refreshBookmarks();
        });
      } else {
        const manualBookmarks = load(STORAGE_KEYS.bookmarks, []);
        manualBookmarks.push({ name, url, icon });
        save(STORAGE_KEYS.bookmarks, manualBookmarks);
        refreshBookmarks();
      }
      document.getElementById('bookmarkModal').classList.remove('open');
    });

    document.getElementById('addFolderBtn').addEventListener('click', () => {
      document.getElementById('folderModal').classList.add('open');
      document.getElementById('folderName').value = '';
      const select = document.getElementById('folderParent');
      select.innerHTML = '<option value="root">Bookmarks Bar (Root)</option>';
      chromeFolders.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = f.name;
        if (f.id === currentFolderId) opt.selected = true;
        select.appendChild(opt);
      });
      document.getElementById('folderName').focus();
    });

    document.getElementById('saveFolderBtn').addEventListener('click', () => {
      const name = document.getElementById('folderName').value.trim();
      const parentId = document.getElementById('folderParent').value;
      if (!name) return;

      if (hasChromeApi()) {
        const targetParent = parentId === 'root' ? '1' : parentId;
        chrome.bookmarks.create({ parentId: targetParent, title: name }, () => {
          refreshBookmarks();
        });
      }
      document.getElementById('folderModal').classList.remove('open');
    });
  }

  /* --- Shortcuts --- */
  function renderShortcuts() {
    const list = document.getElementById('shortcutsList');
    const shortcuts = load(STORAGE_KEYS.shortcuts, []);

    if (!shortcuts.length) {
      list.innerHTML = `<div class="empty-state"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>No shortcuts yet</div>`;
      return;
    }

    list.innerHTML = shortcuts.map((s, i) =>
      `<a class="shortcut-item" href="${s.url}">
        <div class="shortcut-color" style="background:${s.color}"></div>
        <div class="shortcut-info">
          <div class="shortcut-title">${s.title}</div>
          <div class="shortcut-url">${s.url}</div>
        </div>
        <button class="shortcut-delete" data-idx="${i}">&times;</button>
      </a>`
    ).join('');

    list.querySelectorAll('.shortcut-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx);
        shortcuts.splice(idx, 1);
        save(STORAGE_KEYS.shortcuts, shortcuts);
        renderShortcuts();
      });
    });
  }

  function initShortcuts() {
    renderShortcuts();

    let selectedColor = '#6c5ce7';

    document.getElementById('addShortcutBtn').addEventListener('click', () => {
      document.getElementById('shortcutModal').classList.add('open');
      document.getElementById('shortcutTitle').value = '';
      document.getElementById('shortcutUrl').value = '';
      selectedColor = '#6c5ce7';
      document.querySelectorAll('#shortcutColorPicker .color-opt').forEach(c => {
        c.classList.toggle('selected', c.dataset.color === selectedColor);
      });
      document.getElementById('shortcutTitle').focus();
    });

    document.querySelectorAll('#shortcutColorPicker .color-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        selectedColor = opt.dataset.color;
        document.querySelectorAll('#shortcutColorPicker .color-opt').forEach(c => c.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });

    document.getElementById('saveShortcutBtn').addEventListener('click', () => {
      const title = document.getElementById('shortcutTitle').value.trim();
      let url = document.getElementById('shortcutUrl').value.trim();
      if (!title || !url) return;
      if (!url.startsWith('http')) url = 'https://' + url;

      const shortcuts = load(STORAGE_KEYS.shortcuts, []);
      shortcuts.push({ title, url, color: selectedColor });
      save(STORAGE_KEYS.shortcuts, shortcuts);
      renderShortcuts();
      document.getElementById('shortcutModal').classList.remove('open');
    });
  }

  /* --- History --- */
  function renderHistory() {
    const list = document.getElementById('historyList');

    if (hasChromeApi()) {
      chrome.history.search({ text: '', maxResults: 20, startTime: Date.now() - 604800000 }, (results) => {
        if (!results || !results.length) {
          list.innerHTML = `<div class="empty-state"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>No history yet</div>`;
          return;
        }
        list.innerHTML = results.map(h => {
          const favicon = getFaviconUrl(h.url);
          return `<a class="history-item" href="${h.url}" title="${h.title || h.url}">
            <img class="history-favicon" src="${favicon}" alt="" onerror="this.style.display='none'">
            <span class="history-title">${h.title || h.url}</span>
            <span class="history-time">${timeAgo(h.lastVisitTime)}</span>
          </a>`;
        }).join('');
      });
    } else {
      list.innerHTML = `<div class="empty-state"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>History available in Chrome extension mode</div>`;
    }
  }

  function initHistory() {
    renderHistory();

    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
      if (hasChromeApi()) {
        chrome.history.search({ text: '', maxResults: 10000, startTime: 0 }, (results) => {
          let deleted = 0;
          const total = results.length;
          if (total === 0) { renderHistory(); return; }
          results.forEach(h => {
            chrome.history.deleteUrl({ url: h.url }, () => {
              deleted++;
              if (deleted >= total) {
                window.location.reload();
              }
            });
          });
        });
      } else {
        renderHistory();
      }
    });
  }

  /* --- Theme --- */
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  function initTheme() {
    const theme = load(STORAGE_KEYS.theme, 'light');
    applyTheme(theme);

    document.getElementById('toggleTheme').addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      applyTheme(newTheme);
      save(STORAGE_KEYS.theme, newTheme);
    });
  }

  /* --- Accent Color --- */
  function applyAccentColor(color) {
    const c = ACCENT_COLORS[color] || ACCENT_COLORS['#6c5ce7'];
    document.documentElement.style.setProperty('--accent', color);
    document.documentElement.style.setProperty('--accent-hover', c.hover);
    document.documentElement.style.setProperty('--accent-glow', c.glow);
  }

  function initAccentColor() {
    const color = load(STORAGE_KEYS.accentColor, '#6c5ce7');
    applyAccentColor(color);

    document.querySelectorAll('#accentColorPicker .color-opt').forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.color === color);
    });
  }

  /* --- Background --- */
  function applyBackground(type, imageUrl) {
    const body = document.body;
    const bgAnim = document.querySelector('.bg-animation');

    body.style.backgroundImage = '';

    if (type === 'none') {
      body.style.background = '';
      bgAnim.style.display = '';
    } else if (type === 'custom-image' && imageUrl) {
      bgAnim.style.display = 'none';
      body.style.background = `url(${imageUrl}) center/cover no-repeat fixed`;
    } else if (BG_GRADIENTS[type]) {
      bgAnim.style.display = 'none';
      body.style.background = BG_GRADIENTS[type];
      body.style.backgroundAttachment = 'fixed';
    } else {
      bgAnim.style.display = '';
    }
  }

  function initBackground() {
    const bgType = load(STORAGE_KEYS.bgType, 'gradient-1');
    const bgImage = load(STORAGE_KEYS.bgImage, '');
    applyBackground(bgType, bgImage);

    document.querySelectorAll('#bgPicker .bg-option').forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.bg === bgType);
    });
  }

  /* --- Background Refresh --- */
  function initBgRefresh() {
    document.getElementById('refreshBg').addEventListener('click', () => {
      document.querySelectorAll('.orb').forEach(orb => {
        orb.style.animation = 'none';
        orb.offsetHeight;
        orb.style.animation = '';
      });
    });
  }

  /* --- Settings Panel --- */
  function initSettings() {
    const overlay = document.getElementById('settingsOverlay');
    const themeToggle = document.getElementById('themeToggle');

    // Open settings
    document.getElementById('openSettings').addEventListener('click', () => {
      overlay.classList.add('open');
      const currentTheme = load(STORAGE_KEYS.theme, 'light');
      themeToggle.classList.toggle('active', currentTheme === 'dark');
    });

    // Close settings
    document.getElementById('closeSettings').addEventListener('click', () => {
      overlay.classList.remove('open');
    });

    document.getElementById('saveSettings').addEventListener('click', () => {
      overlay.classList.remove('open');
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });

    // Theme toggle
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      applyTheme(newTheme);
      save(STORAGE_KEYS.theme, newTheme);
      themeToggle.classList.toggle('active', newTheme === 'dark');
    });

    // Accent color picker
    document.querySelectorAll('#accentColorPicker .color-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        const color = opt.dataset.color;
        applyAccentColor(color);
        save(STORAGE_KEYS.accentColor, color);
        document.querySelectorAll('#accentColorPicker .color-opt').forEach(c => c.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });

    // Background picker
    let customImageUrl = load(STORAGE_KEYS.bgImage, '');

    document.querySelectorAll('#bgPicker .bg-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const bgType = opt.dataset.bg;

        if (bgType === 'custom-image') {
          document.getElementById('bgImageUpload').click();
          return;
        }

        applyBackground(bgType, customImageUrl);
        save(STORAGE_KEYS.bgType, bgType);
        document.querySelectorAll('#bgPicker .bg-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });

    // Image upload
    document.getElementById('bgImageUpload').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        customImageUrl = ev.target.result;
        save(STORAGE_KEYS.bgImage, customImageUrl);
        save(STORAGE_KEYS.bgType, 'custom-image');

        applyBackground('custom-image', customImageUrl);
        document.querySelectorAll('#bgPicker .bg-option').forEach(o => o.classList.remove('selected'));
        document.getElementById('bgUploadBtn').classList.add('selected');
      };
      reader.readAsDataURL(file);
    });

    // Escape to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        overlay.classList.remove('open');
      }
    });
  }

  /* --- Modal Close --- */
  function initModals() {
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.close;
        document.getElementById(id).classList.remove('open');
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('open');
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
      }
    });
  }

  /* --- Init --- */
  document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
    initSearch();
    initBookmarks();
    initShortcuts();
    initHistory();
    initTheme();
    initAccentColor();
    initBackground();
    initBgRefresh();
    initSettings();
    initModals();
  });
})();
