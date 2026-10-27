// Page routing and the music list.
//
// Pages are plain HTML fragments loaded into #content. The URL hash is the single
// source of truth: #page=tools, #page=music-list&track=20240817-PreludeAndFugue.
// Navigation links are ordinary <a href="#page=...">, so Back, middle-click and
// bookmarks all work.

const PAGES = {
    'about': { file: 'about.html', label: 'About' },
    'music-list': { file: 'music-list.html', label: 'Music' },
    'tools': { file: 'tools.html', label: 'Tools' },
    'contact': { file: 'contact.html', label: 'Contact' }
};
const DEFAULT_PAGE = 'about';
const PAGE_ALIASES = { music: 'music-list' }; // older links

const content = document.getElementById('content');
const mainEl = document.querySelector('.main-content');
const htmlCache = new Map();
let loadController = null;
let sharedTrackId = null; // track the visitor chose; kept in the URL so it can be shared

/* ---- URL ---- */

function parseHash() {
    const params = new URLSearchParams(window.location.hash.slice(1));
    let page = params.get('page') || DEFAULT_PAGE;
    page = PAGE_ALIASES[page] || page;
    if (!Object.hasOwn(PAGES, page)) page = DEFAULT_PAGE;
    return { page, track: params.get('track') };
}

function buildHash(page, trackId) {
    const params = new URLSearchParams();
    if (page && page !== DEFAULT_PAGE) params.set('page', page);
    if (trackId) params.set('track', trackId);
    const hash = params.toString();
    return hash ? '#' + hash : '';
}

// replaceState does not fire hashchange, so this never re-enters the router.
function syncURL(page) {
    const hash = buildHash(page, sharedTrackId);
    if (window.location.hash === hash || (!hash && !window.location.hash)) return;
    history.replaceState(null, '', window.location.pathname + window.location.search + hash);
}

/* ---- pages ---- */

function setActiveLink(page) {
    document.querySelectorAll('.nav-buttons a').forEach(link => {
        const active = link.dataset.page === page;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
}

function showContent(html) {
    content.innerHTML = html;
    content.classList.remove('fade-in');
    void content.offsetWidth; // restart the animation
    content.classList.add('fade-in');
}

function showError(page) {
    showContent(`
        <div class="section-hero"><div class="section-card">
            <h3>Page unavailable</h3>
            <p>This page could not be loaded. Check your connection and try again.</p>
            <p><button type="button" class="text-btn" data-retry="${page}">Try again</button></p>
        </div></div>`);
}

async function loadPage(page, { moveFocus = false } = {}) {
    setActiveLink(page);
    document.title = `${PAGES[page].label} — Nick Vuci`;

    if (loadController) loadController.abort();
    loadController = new AbortController();
    const { signal } = loadController;

    try {
        let html = htmlCache.get(page);
        if (html === undefined) {
            const res = await fetch(PAGES[page].file, { signal });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            html = await res.text();
            htmlCache.set(page, html);
        }
        showContent(html);
        if (page === 'music-list') renderMusicList();
    } catch (err) {
        if (err.name === 'AbortError') return; // superseded by a newer navigation
        console.error(`Could not load ${page}:`, err);
        showError(page);
    }

    if (moveFocus) {
        mainEl.scrollTop = 0;
        content.focus({ preventScroll: true });
    }
}

content.addEventListener('click', (e) => {
    const retry = e.target.closest('[data-retry]');
    if (retry) loadPage(retry.dataset.retry, { moveFocus: true });
});

function route({ initial = false } = {}) {
    const { page, track } = parseHash();
    if (initial) {
        sharedTrackId = track;
        if (window.globalPlayer) window.globalPlayer.selectInitial(track);
    }
    loadPage(page, { moveFocus: !initial }).then(() => syncURL(page));
}

window.addEventListener('hashchange', () => route());

// A track the visitor picks or skips to goes into the URL; the random first
// track does not, so a plain visit keeps a clean address.
document.addEventListener('player:change', (e) => {
    if (!e.detail.user) return;
    sharedTrackId = window.globalPlayer.getCurrentTrackId();
    syncURL(parseHash().page);
});

/* ---- music list ---- */

const PLAY_ICON = '<path d="M8 5.5 18.5 12 8 18.5Z"/>';
const PAUSE_ICON = '<path d="M8.5 5.5v13M15.5 5.5v13"/>';

function rowIcon(playing) {
    return `<svg class="icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">${playing ? PAUSE_ICON : PLAY_ICON}</svg>`;
}

function loadSortState() {
    const fallback = { key: 'date', dir: 'desc' };
    try {
        const saved = JSON.parse(localStorage.getItem('musicListSort'));
        if (saved && ['title', 'date', 'tuning'].includes(saved.key) && ['asc', 'desc'].includes(saved.dir)) return saved;
    } catch { /* unreadable or unavailable */ }
    return fallback;
}

function saveSortState(state) {
    try { localStorage.setItem('musicListSort', JSON.stringify(state)); } catch { /* ignore */ }
}

let musicSort = null;

function renderMusicList() {
    const container = document.getElementById('all-tracks-list');
    if (!container) return;
    const tracks = window.tracksData?.tracks ?? [];
    if (!musicSort) musicSort = loadSortState();

    container.textContent = '';

    // Sort controls
    const sortBar = document.createElement('div');
    sortBar.className = 'sort-bar';
    const label = document.createElement('span');
    label.className = 'sort-label';
    label.textContent = 'Sort by';
    sortBar.appendChild(label);

    [['title', 'Title'], ['date', 'Date'], ['tuning', 'Tuning']].forEach(([key, text]) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sort-btn';
        const active = musicSort.key === key;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
        btn.textContent = text;
        if (active) {
            const dir = document.createElement('span');
            dir.className = 'dir';
            dir.setAttribute('aria-hidden', 'true');
            dir.textContent = musicSort.dir === 'asc' ? '▲' : '▼';
            btn.appendChild(dir);
            btn.setAttribute('aria-label', `${text}, ${musicSort.dir === 'asc' ? 'ascending' : 'descending'}`);
        }
        btn.addEventListener('click', () => {
            if (musicSort.key === key) {
                musicSort.dir = musicSort.dir === 'asc' ? 'desc' : 'asc';
            } else {
                musicSort = { key, dir: key === 'date' ? 'desc' : 'asc' };
            }
            saveSortState(musicSort);
            renderMusicList();
            container.querySelector('.sort-btn.active')?.focus();
        });
        sortBar.appendChild(btn);
    });
    container.appendChild(sortBar);

    // Rows, keeping each track's index in the player's list
    const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });
    const sign = musicSort.dir === 'asc' ? 1 : -1;
    const byDateDesc = (a, b) => (b.t.date || '').localeCompare(a.t.date || '');
    const entries = tracks.map((t, i) => ({ t, i })).sort((a, b) => {
        let cmp = 0;
        if (musicSort.key === 'title') cmp = collator.compare(a.t.title || '', b.t.title || '');
        else if (musicSort.key === 'tuning') cmp = collator.compare(a.t.tuning || '', b.t.tuning || '');
        else cmp = (a.t.date || '').localeCompare(b.t.date || '');
        return cmp * sign || byDateDesc(a, b);
    });

    const list = document.createElement('ul');
    list.className = 'all-tracks-list';
    entries.forEach(({ t, i }) => {
        const li = document.createElement('li');
        li.className = 'track-row';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'track-btn';
        btn.dataset.index = i;
        btn.setAttribute('aria-label', `Play ${t.title}`);

        const state = document.createElement('span');
        state.className = 'track-state';
        state.innerHTML = rowIcon(false);

        const text = document.createElement('span');
        text.className = 'track-text';
        const title = document.createElement('span');
        title.className = 'track-name';
        title.textContent = t.title;
        const sub = document.createElement('span');
        sub.className = 'track-sub';
        const tuning = document.createElement('span');
        tuning.className = 'tuning';
        tuning.textContent = t.tuning || '';
        sub.appendChild(tuning);
        if (t.date) sub.append(` · ${t.date.slice(0, 4)}`);
        text.append(title, sub);

        btn.append(state, text);
        li.appendChild(btn);
        list.appendChild(li);
    });
    container.appendChild(list);

    if (!container.dataset.bound) {
        container.dataset.bound = '1';
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.track-btn');
            const player = window.globalPlayer;
            if (!btn || !player) return;
            const index = Number(btn.dataset.index);
            if (index === player.currentTrackIndex) player.toggle(true);
            else player.loadTrack(index, { play: true, user: true });
        });
    }
    syncMusicList();
}

// Mark the current track and show pause on it while it plays.
function syncMusicList() {
    const container = document.getElementById('all-tracks-list');
    const player = window.globalPlayer;
    if (!container || !player) return;
    container.querySelectorAll('.track-btn').forEach(btn => {
        const index = Number(btn.dataset.index);
        const current = index === player.currentTrackIndex;
        const playing = current && player.isPlaying;
        const title = player.tracks[index]?.title ?? '';
        btn.classList.toggle('current', current);
        if (current) btn.setAttribute('aria-current', 'true'); else btn.removeAttribute('aria-current');
        btn.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${title}`);
        btn.querySelector('.track-state').innerHTML = rowIcon(playing);
    });
}
document.addEventListener('player:change', syncMusicList);

route({ initial: true });
