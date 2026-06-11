/*
  ================================================================
  script.js — macOS Desktop Simulator
  ================================================================
  All behaviour and interactivity lives here.
  Reads HTML elements from index.html and styles from style.css.
  ================================================================
*/

/* ================================================================
   SECTION 1 — DATA
   Define all content as plain objects/arrays.
   Change data here to add/remove files, dock apps, etc.
   ================================================================ */

/* Folder contents shown inside the Finder window */
const folderContents = {
  home: [
    { name: 'Desktop',      emoji: '📁', type: 'folder' },
    { name: 'Documents',    emoji: '📁', type: 'folder' },
    { name: 'Downloads',    emoji: '📁', type: 'folder' },
    { name: 'Movies',       emoji: '📁', type: 'folder' },
    { name: 'Music',        emoji: '📁', type: 'folder' },
    { name: 'Pictures',     emoji: '📁', type: 'folder' },
    { name: 'Applications', emoji: '📁', type: 'folder' },
    { name: 'README.txt',   emoji: '📄', type: 'file'   },
    { name: 'photo.jpg',    emoji: '🖼️', type: 'file'   },
    { name: 'song.mp3',     emoji: '🎵', type: 'file'   },
    { name: 'Archive.zip',  emoji: '🗜️', type: 'file'   },
    { name: 'notes.txt',    emoji: '📝', type: 'file'   },
  ],
  desktop: [
    { name: 'My Project',     emoji: '📁', type: 'folder' },
    { name: 'screenshot.png', emoji: '🖼️', type: 'file'   },
  ],
  documents: [
    { name: 'Resume.docx', emoji: '📄', type: 'file' },
    { name: 'Budget.xlsx', emoji: '📊', type: 'file' },
    { name: 'Essay.pdf',   emoji: '📕', type: 'file' },
  ],
  downloads: [
    { name: 'installer.dmg', emoji: '💿', type: 'file' },
    { name: 'video.mp4',     emoji: '🎬', type: 'file' },
  ],
  macintosh: [
    { name: 'Applications', emoji: '📁', type: 'folder' },
    { name: 'Library',      emoji: '📁', type: 'folder' },
    { name: 'System',       emoji: '📁', type: 'folder' },
    { name: 'Users',        emoji: '📁', type: 'folder' },
  ],
  icloud: [
    { name: 'iCloud Files', emoji: '☁️', type: 'folder' },
    { name: 'Shared',       emoji: '🤝', type: 'folder' },
  ],
};

/*
  Dock apps list.
  - img:     filename inside your img/ folder
  - emoji:   shown if the image file is missing
  - running: true = dot appears below icon
  - action:  what clicking does ('openFinder', 'notify', or null)

  HOW TO USE YOUR REAL IMAGES:
  Put the matching file inside img/ next to index.html.
  Example: img: 'finder.png'  →  put  img/finder.png  in your folder.
  If the file is missing the emoji shows instead — no broken icons!
*/
const dockApps = [
  { name: 'Finder',    img: 'finder.png',    emoji: '😊', running: true,  action: 'openFinder'  },
  { name: 'Siri',      img: 'siri.png',       emoji: '🔮', running: false, action: 'notify'      },
  { name: 'Launchpad', img: 'launchpad.png',  emoji: '🚀', running: false, action: 'notify'      },
  { name: 'Contacts',  img: 'contacts.png',   emoji: '👤', running: false, action: 'notify'      },
  // separator inserted before index 4 (see buildDock)
  { name: 'Notes',     img: 'notes.png',      emoji: '📝', running: true,  action: 'notify'      },
  { name: 'Reminders', img: 'reminders.png',  emoji: '📋', running: false, action: 'notify'      },
  { name: 'Photos',    img: 'gallery.png',    emoji: '🌸', running: false, action: 'notify'      },
  { name: 'FaceTime',  img: 'facetime.png',   emoji: '📹', running: false, action: 'notify'      },
  { name: 'Messages',  img: 'messages.png',   emoji: '💬', running: true,  action: 'notify'      },
  { name: 'Music',     img: 'music.png',       emoji: '🎵', running: false, action: 'notify'      },
  { name: 'Podcasts',  img: 'podcasts.png',   emoji: '🎙️', running: false, action: 'notify'      },
  { name: 'TV',        img: 'tv.png',          emoji: '📺', running: false, action: 'notify'      },
  { name: 'App Store', img: 'appstore.png',   emoji: '🛍️', running: false, action: 'notify'      },
  { name: 'Safari',    img: 'safari.png',     emoji: '🧭', running: false, action: 'notify'      },
];

/* Icons shown directly on the desktop wallpaper (top-right) */
const desktopIconsData = [
  { name: 'Macintosh HD', img: null,  emoji: '💻' },
  { name: 'README.txt',   img: null,  emoji: '📄' },
];


/* ================================================================
   HELPER — tryImage(imgFile, onSuccess, onFail)
   Attempts to load img/imgFile.
   Calls onSuccess(imgElement) if it loads, onFail() if it doesn't.
   This gives us clean image → emoji fallback without broken icons.
   ================================================================ */
function tryImage(imgFile, onSuccess, onFail) {
  if (!imgFile) { onFail(); return; }        // no filename given → skip straight to emoji
  const img = new Image();                   // create a hidden Image object
  img.onload  = () => onSuccess(img);        // file exists and loaded → use it
  img.onerror = () => onFail();              // file missing / broken → use emoji
  img.src = 'img/' + imgFile;               // try to load from the img/ folder
}


/* ================================================================
   SECTION 2 — CLOCK
   Updates the time shown in the menu bar every 10 seconds.
   ================================================================ */
function updateClock() {
  const now    = new Date();
  const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  /* padStart(2,'0') adds a leading zero when needed: 9 → "09" */
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');

  document.getElementById('clock').textContent =
    `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${h}:${m}`;
}
updateClock();
setInterval(updateClock, 10000); /* run every 10 seconds */


/* ================================================================
   SECTION 3 — BUILD DOCK
   Creates every dock icon from the dockApps array.
   Uses tryImage() so real PNG icons show when available,
   and a large emoji shows when they are missing — NO broken icons.
   ================================================================ */
function buildDock() {
  const dock = document.getElementById('dock');

  dockApps.forEach((app, i) => {

    /* Insert separator line before "Notes" (index 4) */
    if (i === 4) {
      const sep = document.createElement('div');
      sep.className = 'dock-separator';
      dock.appendChild(sep);
    }

    /* Create the dock item wrapper */
    const item = document.createElement('div');
    item.className = 'dock-item';

    /* Tooltip label (appears above icon on hover) */
    const tooltip = document.createElement('div');
    tooltip.className = 'dock-tooltip';
    tooltip.textContent = app.name;

    /* Running dot (only shown when app.running === true) */
    const dot = document.createElement('div');
    dot.className = 'dock-dot';
    dot.style.display = app.running ? 'block' : 'none';

    /*
      tryImage tries to load the real PNG.
      If found  → creates a proper <img> with class "dock-img"
      If missing → creates a <div> with class "dock-emoji" showing the emoji
      Either way the tooltip and dot are added after the icon.
    */
    tryImage(
      app.img,
      (img) => {
        /* SUCCESS: real image loaded */
        img.className = 'dock-img';
        img.alt = app.name;
        item.appendChild(img);
        item.appendChild(tooltip);
        item.appendChild(dot);
      },
      () => {
        /* FALLBACK: no image — show emoji */
        const emojiDiv = document.createElement('div');
        emojiDiv.className = 'dock-emoji';
        emojiDiv.textContent = app.emoji;
        item.appendChild(emojiDiv);
        item.appendChild(tooltip);
        item.appendChild(dot);
      }
    );

    /* Click handler */
    item.addEventListener('click', () => {
      if (app.action === 'openFinder') {
        openFinder();
      } else {
        showNotification(app.name, `${app.name} is opening…`, app.emoji);
      }
    });

    dock.appendChild(item);
  });

  /* Separator + Trash at the end */
  const sep2 = document.createElement('div');
  sep2.className = 'dock-separator';
  dock.appendChild(sep2);

  const trash = document.createElement('div');
  trash.className = 'dock-item';

  tryImage(
    'trash.png',
    (img) => {
      img.className = 'dock-img';
      img.alt = 'Trash';
      const tt = document.createElement('div');
      tt.className = 'dock-tooltip';
      tt.textContent = 'Trash';
      trash.appendChild(img);
      trash.appendChild(tt);
    },
    () => {
      const emojiDiv = document.createElement('div');
      emojiDiv.className = 'dock-emoji';
      emojiDiv.textContent = '🗑️';
      const tt = document.createElement('div');
      tt.className = 'dock-tooltip';
      tt.textContent = 'Trash';
      trash.appendChild(emojiDiv);
      trash.appendChild(tt);
    }
  );

  trash.addEventListener('click', () => showNotification('Trash','The Trash is empty.','🗑️'));
  dock.appendChild(trash);
}

buildDock();


/* ================================================================
   SECTION 4 — DESKTOP ICONS
   Icons that sit on the wallpaper (top-right corner).
   Same tryImage() pattern: real PNG if available, emoji if not.
   ================================================================ */
function buildDesktopIcons() {
  const container = document.getElementById('desktop-icons');

  desktopIconsData.forEach(file => {
    const wrapper = document.createElement('div');
    wrapper.className = 'desktop-icon';

    const label = document.createElement('span');
    label.className = 'd-label';
    label.textContent = file.name;

    tryImage(
      file.img,
      (img) => {
        img.className = 'd-img';
        img.alt = file.name;
        wrapper.appendChild(img);
        wrapper.appendChild(label);
      },
      () => {
        const em = document.createElement('div');
        em.className = 'd-emoji';
        em.textContent = file.emoji;
        wrapper.appendChild(em);
        wrapper.appendChild(label);
      }
    );

    /* Single click = select */
    wrapper.addEventListener('click', (e) => {
      document.querySelectorAll('.desktop-icon').forEach(el => el.classList.remove('selected'));
      wrapper.classList.add('selected');
      e.stopPropagation(); /* stop click bubbling to desktop which would deselect */
    });

    /* Double click = open */
    wrapper.addEventListener('dblclick', () => {
      if (file.name === 'Macintosh HD') openFinder();
      else showNotification('Preview', `Opening ${file.name}`, file.emoji);
    });

    container.appendChild(wrapper);
  });
}

buildDesktopIcons();


/* ================================================================
   SECTION 5 — FINDER FILE GRID
   Renders file icons inside the Finder content area.
   Called every time the user navigates to a different folder.
   ================================================================ */
function renderFiles(files) {
  const grid = document.getElementById('file-grid');
  grid.innerHTML = ''; /* clear previous contents */

  files.forEach(file => {
    const item = document.createElement('div');
    item.className = 'file-item';

    /* Icon box */
    const iconBox = document.createElement('div');
    iconBox.className = 'file-icon';
    iconBox.textContent = file.emoji; /* emoji always works — no broken image risk */

    /* Label */
    const label = document.createElement('span');
    label.textContent = file.name;

    item.appendChild(iconBox);
    item.appendChild(label);

    /* Single click → select */
    item.addEventListener('click', (e) => {
      document.querySelectorAll('.file-item').forEach(el => el.classList.remove('selected'));
      item.classList.add('selected');
      e.stopPropagation();
    });

    /* Double click → open */
    item.addEventListener('dblclick', () => {
      if (file.type === 'folder') {
        /* Try navigating into the folder if we have data for it */
        const key = file.name.toLowerCase().replace(/\s+/g, '');
        if (folderContents[key]) {
          navigateTo(null, file.name, key);
        } else {
          showNotification('Finder', `Opening ${file.name}`, '📁');
        }
      } else {
        showNotification('Finder', `Opening ${file.name}`, file.emoji);
      }
    });

    grid.appendChild(item);
  });
}

/* Show the Home folder on first load */
renderFiles(folderContents.home);


/* ================================================================
   SECTION 6 — SIDEBAR NAVIGATION
   Called when user clicks a sidebar item.
   Updates: active highlight, breadcrumb text, window title, file grid.

   Parameters:
     el         — the clicked sidebar element (or null)
     folderName — display name e.g. "Documents"
     key        — optional lookup key e.g. "documents"
   ================================================================ */
function navigateTo(el, folderName, key) {

  /* Update sidebar highlight */
  document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
  if (el) el.classList.add('active');

  /* Update breadcrumb and window title */
  document.getElementById('breadcrumb').textContent    = folderName;
  document.getElementById('finder-title').textContent  = `Finder — ${folderName}`;

  /* Derive the key from the name if one wasn't passed in */
  const dataKey = key || folderName.toLowerCase().replace(/\s+/g, '').replace('hd','');

  const files = folderContents[dataKey] || folderContents[folderName.toLowerCase()];
  if (files) {
    renderFiles(files);
  } else {
    document.getElementById('file-grid').innerHTML =
      '<p style="color:#666;font-size:13px;padding:16px 0;">This folder is empty.</p>';
  }
}


/* ================================================================
   SECTION 7 — WINDOW CONTROLS
   Close, minimize, maximize — called by onclick in index.html.
   ================================================================ */

/* CLOSE — adds CSS class "hidden" which sets display:none */
function closeWindow(id) {
  document.getElementById(id).classList.add('hidden');
}

/* MINIMIZE — animates window off-screen then hides it */
function minimizeWindow(id) {
  const win = document.getElementById(id);
  win.dataset.prevTop  = win.style.top  || '50px';
  win.dataset.prevLeft = win.style.left || '60px';
  win.style.transition = 'top 0.3s ease, opacity 0.3s ease';
  win.style.top     = '110%';
  win.style.opacity = '0';
  setTimeout(() => {
    win.classList.add('hidden');
    win.style.opacity    = '1';
    win.style.transition = '';
  }, 320);
}

/* MAXIMIZE — toggle between full-screen and original size */
function maximizeWindow(id) {
  const win = document.getElementById(id);
  if (win.dataset.maximized === 'true') {
    win.style.top    = win.dataset.prevTop    || '50px';
    win.style.left   = win.dataset.prevLeft   || '60px';
    win.style.width  = win.dataset.prevWidth  || '590px';
    win.style.height = win.dataset.prevHeight || '440px';
    win.dataset.maximized = 'false';
  } else {
    win.dataset.prevTop    = win.style.top;
    win.dataset.prevLeft   = win.style.left;
    win.dataset.prevWidth  = win.style.width;
    win.dataset.prevHeight = win.style.height;
    win.dataset.maximized  = 'true';
    win.style.top    = '27px';
    win.style.left   = '0';
    win.style.width  = '100%';
    win.style.height = 'calc(100vh - 27px)';
  }
}

/* OPEN FINDER — removes "hidden" and restores last position */
function openFinder() {
  const win = document.getElementById('finder-window');
  win.classList.remove('hidden');
  win.style.top  = win.dataset.prevTop  || '50px';
  win.style.left = win.dataset.prevLeft || '60px';
  bringToFront(win);
}


/* ================================================================
   SECTION 8 — BRING WINDOW TO FRONT
   Clicking any window raises its z-index above the others.
   ================================================================ */
function bringToFront(win) {
  document.querySelectorAll('.window').forEach(w => {
    w.style.zIndex = 50;
    w.classList.remove('focused');
  });
  win.style.zIndex = 60;
  win.classList.add('focused');
}

/* Apply to all windows — mousedown fires before 'click' so it feels instant */
document.querySelectorAll('.window').forEach(win => {
  win.addEventListener('mousedown', () => bringToFront(win));
});


/* ================================================================
   SECTION 9 — WINDOW DRAGGING
   Click and drag a window's title bar to move it around.

   How it works:
   1. mousedown on title bar  → record starting positions
   2. mousemove on document   → calculate delta, update window position
   3. mouseup  on document    → stop dragging
   ================================================================ */
function makeDraggable(windowEl, titleBarEl) {
  let dragging = false;
  let startMouseX, startMouseY, startLeft, startTop;

  titleBarEl.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('win-btn')) return; /* don't drag when clicking buttons */
    dragging     = true;
    startMouseX  = e.clientX;
    startMouseY  = e.clientY;
    startLeft    = parseInt(windowEl.style.left) || 60;
    startTop     = parseInt(windowEl.style.top)  || 50;
    bringToFront(windowEl);
    document.body.style.cursor = 'move';
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    windowEl.style.left = (startLeft + e.clientX - startMouseX) + 'px';
    windowEl.style.top  = (startTop  + e.clientY - startMouseY) + 'px';
  });

  document.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.cursor = '';
  });
}

makeDraggable(
  document.getElementById('finder-window'),
  document.getElementById('finder-titlebar')
);


/* ================================================================
   SECTION 10 — WINDOW RESIZING
   Drag the bottom-right corner handle to resize the window.
   ================================================================ */
function makeResizable(windowEl, handleEl) {
  let resizing = false;
  let startMouseX, startMouseY, startW, startH;

  handleEl.addEventListener('mousedown', (e) => {
    resizing    = true;
    startMouseX = e.clientX;
    startMouseY = e.clientY;
    startW      = windowEl.offsetWidth;
    startH      = windowEl.offsetHeight;
    e.stopPropagation(); /* prevent drag handler from also firing */
    document.body.style.cursor = 'se-resize';
  });

  document.addEventListener('mousemove', (e) => {
    if (!resizing) return;
    windowEl.style.width  = Math.max(320, startW + e.clientX - startMouseX) + 'px';
    windowEl.style.height = Math.max(250, startH + e.clientY - startMouseY) + 'px';
  });

  document.addEventListener('mouseup', () => {
    resizing = false;
    document.body.style.cursor = '';
  });
}

makeResizable(
  document.getElementById('finder-window'),
  document.getElementById('finder-resize')
);


/* ================================================================
   SECTION 11 — RIGHT-CLICK CONTEXT MENU
   Shows a custom menu wherever the user right-clicks.
   ================================================================ */
const contextMenu = document.getElementById('context-menu');

/* Show on right-click */
document.getElementById('desktop').addEventListener('contextmenu', (e) => {
  e.preventDefault(); /* stop the browser's own menu from appearing */
  contextMenu.style.left    = e.clientX + 'px';
  contextMenu.style.top     = e.clientY + 'px';
  contextMenu.style.display = 'block';
});

/* Hide when clicking anywhere else */
document.addEventListener('click', () => {
  contextMenu.style.display = 'none';
});

/* Clicking empty desktop also deselects all icons */
document.getElementById('desktop').addEventListener('click', () => {
  document.querySelectorAll('.file-item, .desktop-icon').forEach(el => {
    el.classList.remove('selected');
  });
});


/* ================================================================
   SECTION 12 — NOTIFICATIONS
   Shows macOS-style pop-up cards in the top-right corner.
   They slide in automatically and disappear after 3 seconds.

   Usage: showNotification('App Name', 'Message text', '🔔')
   ================================================================ */
function showNotification(title, message, icon = '🔔') {
  const container = document.getElementById('notification-container');

  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.innerHTML = `
    <div class="notif-icon">${icon}</div>
    <div>
      <div class="notif-title">${title}</div>
      <div class="notif-text">${message}</div>
    </div>
  `;
  container.appendChild(notif);

  /* Auto-dismiss after 3 seconds */
  setTimeout(() => {
    notif.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    notif.style.opacity    = '0';
    notif.style.transform  = 'translateX(110%)';
    setTimeout(() => notif.remove(), 320);
  }, 3000);

  /* Click to dismiss early */
  notif.addEventListener('click', () => notif.remove());
}

/* Welcome notification 800ms after page loads */
setTimeout(() => {
  showNotification('macOS Desktop', 'Welcome! Right-click to explore.', '🖥️');
}, 800);


/* ================================================================
   SECTION 13 — KEYBOARD SHORTCUTS
   ================================================================ */
document.addEventListener('keydown', (e) => {

  /* Cmd+W / Ctrl+W → close the focused window */
  if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
    e.preventDefault();
    const focused = document.querySelector('.window.focused');
    if (focused) closeWindow(focused.id);
  }

  /* Escape → close context menu + deselect everything */
  if (e.key === 'Escape') {
    contextMenu.style.display = 'none';
    document.querySelectorAll('.file-item, .desktop-icon').forEach(el => {
      el.classList.remove('selected');
    });
  }

  /* Space → Quick Look on selected file */
  if (e.key === ' ') {
    const sel = document.querySelector('.file-item.selected');
    if (sel) {
      const name = sel.querySelector('span').textContent;
      showNotification('Quick Look', `Previewing "${name}"`, '👁️');
    }
  }
});
