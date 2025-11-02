// Rebuild clean file to fix earlier merge corruption

// Add this at the top of the file
let currentContent = 'content1';

// URL management functions
function parseURL() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return { page: params.get('page'), track: params.get('track') };
}

function updateURL(page, trackId) {
    const params = new URLSearchParams();
    if (page && page !== 'about') params.set('page', page);
    if (trackId) params.set('track', trackId);
    const newHash = params.toString();
    if (window.location.hash !== '#' + newHash) {
        const newURL = window.location.pathname + window.location.search + '#' + newHash;
        history.replaceState(null, null, newURL);
    }
}
window.updateURL = updateURL;

function getCurrentPageName() {
    const activeButton = document.querySelector('.nav-buttons button.active');
    if (activeButton) {
        const onclickAttr = activeButton.getAttribute('onclick');
        const match = onclickAttr.match(/showContent\('([^']+)'\)/);
        return match ? match[1] : 'about';
    }
    return 'about';
}

function showContent(section, updateUrlFlag = true) {
    updateActiveButton(section);
    const oldContent = document.getElementById(currentContent);
    const newContent = document.getElementById(currentContent === 'content1' ? 'content2' : 'content1');
    oldContent.classList.remove('fade-in');
    oldContent.classList.add('fade-out');
    setTimeout(() => {
        fetch(`${section}.html`)
            .then(r => r.text())
            .then(html => {
                newContent.innerHTML = html;
                newContent.style.display = 'block';
                newContent.classList.remove('fade-out');
                newContent.classList.add('fade-in');
                oldContent.style.display = 'none';
                currentContent = currentContent === 'content1' ? 'content2' : 'content1';
                if (updateUrlFlag) {
                    const currentTrackId = window.globalPlayer?.getCurrentTrackId?.() || null;
                    updateURL(section, currentTrackId);
                }
                onSectionLoaded(section);
            });
    }, 500);
}

function updateActiveButton(section) {
    const buttons = document.querySelectorAll('.nav-buttons button');
    buttons.forEach(btn => { btn.classList.remove('active'); btn.removeAttribute('aria-current'); });
    const activeButton = document.querySelector(`.nav-buttons button[onclick="showContent('${section}')"]`);
    if (activeButton) { activeButton.classList.add('active'); activeButton.setAttribute('aria-current', 'page'); }
}

let isLoadingFromURL = false;
function loadFromURL() {
    isLoadingFromURL = true;
    const { page, track } = parseURL();
    let targetPage = 'about';
    if (page) targetPage = page; else if (track) targetPage = 'music-list';
    showContent(targetPage, false);
    setTimeout(() => {
        if (track && window.globalPlayer) {
            const idx = window.globalPlayer.tracks.findIndex(t => t.id === track);
            if (idx !== -1) window.globalPlayer.loadTrack(idx); else selectRandomTrack(window.globalPlayer);
        } else if (window.globalPlayer) {
            selectRandomTrack(window.globalPlayer);
        }
        const currentTrackId = window.globalPlayer?.getCurrentTrackId?.() || null;
        updateURL(targetPage, currentTrackId);
        isLoadingFromURL = false;
    }, 600);
}

function onSectionLoaded(section) {
    if (section === 'music') {
        setTimeout(() => {
            if (window.globalPlayer) {
                window.globalPlayer.updateCollectionStats();
                if (!isLoadingFromURL) window.globalPlayer.updateMusicSection();
            }
        }, 100);
    } else if (section === 'music-list') {
        setTimeout(renderMusicList, 50);
    } else if (section === 'contact') {
        setTimeout(bindContactForm, 50);
    }
}

function renderMusicList() {
    const container = document.getElementById('all-tracks-list');
    if (!container) return;
    const tracks = (window.tracksData && Array.isArray(window.tracksData.tracks)) ? window.tracksData.tracks : [];
    const totalTracksEl = document.getElementById('total-tracks');
    if (totalTracksEl) totalTracksEl.textContent = tracks.length;
    container.innerHTML = '';

    // Sorting state (persist across re-renders)
    const defaultSort = { key: 'date', dir: 'desc' }; // newest first by default
    if (!window.musicListSort) {
        try {
            const saved = localStorage.getItem('musicListSort');
            window.musicListSort = saved ? JSON.parse(saved) : defaultSort;
        } catch { window.musicListSort = defaultSort; }
    }
    // Back-compat: migrate old 'year' key to 'date'
    if (window.musicListSort.key === 'year') {
        window.musicListSort.key = 'date';
        // Migrate to newest-first by default when coming from the old 'year' key
        window.musicListSort.dir = 'desc';
        try { localStorage.setItem('musicListSort', JSON.stringify(window.musicListSort)); } catch {}
    }
    const sortState = window.musicListSort;

    // Build sort controls
    const sortBar = document.createElement('div');
    sortBar.className = 'sort-bar';
    const label = document.createElement('span');
    label.className = 'sort-label';
    label.textContent = 'Sort by:';
    sortBar.appendChild(label);

    function makeSortBtn(key, text) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sort-btn' + (sortState.key === key ? ' active' : '');
        btn.setAttribute('data-key', key);
        btn.textContent = text;
        if (sortState.key === key) {
            const dirEl = document.createElement('span');
            dirEl.className = 'dir';
            dirEl.textContent = sortState.dir === 'asc' ? '▲' : '▼';
            btn.appendChild(dirEl);
        }
        btn.addEventListener('click', () => {
            if (window.musicListSort.key === key) {
                window.musicListSort.dir = window.musicListSort.dir === 'asc' ? 'desc' : 'asc';
            } else {
                window.musicListSort.key = key;
                window.musicListSort.dir = (key === 'date') ? 'desc' : 'asc';
            }
            try { localStorage.setItem('musicListSort', JSON.stringify(window.musicListSort)); } catch {}
            renderMusicList();
        }, { passive: true });
        return btn;
    }
    sortBar.appendChild(makeSortBtn('title', 'Title'));
    sortBar.appendChild(makeSortBtn('date', 'Date'));
    sortBar.appendChild(makeSortBtn('tuning', 'Tuning'));
    container.appendChild(sortBar);

    const list = document.createElement('ul');
    list.className = 'all-tracks-list';

    // Helpers
    const clean = (title) => (title ? title.replace(/^Nick\s*Vuci\s*[-–:]*\s*/i, '').trim() : 'Untitled');
    const getDateRank = (t) => {
        if (t.date && /^\d{4}-\d{2}-\d{2}$/.test(t.date)) return parseInt(t.date.replace(/-/g, ''), 10);
        if (t.file) {
            const m = String(t.file).match(/-(\d{4})(\d{2})(\d{2})-/);
            if (m) return parseInt(`${m[1]}${m[2]}${m[3]}`, 10);
        }
        return null;
    };
    const rankToIso = (rank) => {
        if (rank == null) return '';
        const s = String(rank).padStart(8, '0');
        return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`;
    };

    // Prepare entries with original indices
    const entries = tracks.map((t, i) => ({
        t,
        i,
        titleClean: clean(t.title || ''),
        tuningClean: (t.tuning || '').toString(),
        dateRank: getDateRank(t),
        dateText: t.dateDisplay || (t.date ? t.date : '')
    }));

    // Sort entries
    const dirMul = (sortState.dir === 'asc') ? 1 : -1;
    entries.sort((a, b) => {
        let cmp = 0;
        if (sortState.key === 'title') {
            cmp = a.titleClean.localeCompare(b.titleClean, undefined, { sensitivity: 'base' });
        } else if (sortState.key === 'tuning') {
            cmp = a.tuningClean.localeCompare(b.tuningClean, undefined, { sensitivity: 'base' });
            // push empties to end regardless of dir
            if (!a.tuningClean && b.tuningClean) cmp = 1;
            else if (a.tuningClean && !b.tuningClean) cmp = -1;
        } else if (sortState.key === 'date') {
            const ax = a.dateRank, bx = b.dateRank;
            if (ax == null && bx == null) cmp = 0;
            else if (ax == null) cmp = 1;
            else if (bx == null) cmp = -1;
            else cmp = ax - bx;
        }
        return cmp * dirMul;
    });

    // Render rows using original index for play mapping (dates hidden from UI)
    entries.forEach(({ t, i: origIdx, titleClean: titleTxt }) => {
        const li = document.createElement('li');
        li.className = 'track-row';
        li.innerHTML = `
            <div class="track-row-inner">
                <button class="play-icon" aria-label="Play" data-index="${origIdx}">▶</button>
                <div class="track-meta">
                    <strong class="title">${titleTxt}</strong>
                    ${t.tuning ? `<span class="sep"> • </span><span class="tuning">${t.tuning}</span>` : ''}
                </div>
            </div>`;
        list.appendChild(li);
    });
    container.appendChild(list);
    // Helper to sync list play icons with the global player state
    function syncListIcons() {
        try {
            const buttons = container.querySelectorAll('.play-icon');
            buttons.forEach(btn => { btn.textContent = '▶'; btn.setAttribute('aria-label','Play'); });
            const gp = window.globalPlayer;
            if (!gp || !gp.tracks || gp.currentTrackIndex == null) return;
            const isPlaying = gp.audioElement && !gp.audioElement.paused;
            const currentIdx = gp.currentTrackIndex;
            const currentBtn = container.querySelector(`.play-icon[data-index="${currentIdx}"]`);
            if (currentBtn) {
                currentBtn.textContent = isPlaying ? '❙❙' : '▶';
                currentBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
            }
        } catch {}
    }

    // Click handler to play from list and update icons (attach once)
    if (!container.__listClickHandlerRegistered) {
      container.addEventListener('click', (e) => {
        const btn = e.target.closest('.play-icon');
        if (!btn) return;
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        const playSelected = () => {
            try {
                const gp = window.globalPlayer;
                if (!gp) return;

                const sameTrack = (gp.currentTrackIndex === idx);
                const audio = gp.audioElement;

                if (sameTrack && audio) {
                    // Toggle play/pause when clicking the current track
                    if (audio.paused) {
                        audio.play().catch(() => {});
                    } else {
                        audio.pause();
                    }
                } else {
                    // Load a different track and start playing
                    gp.loadTrack(idx);
                    if (gp.audioElement && gp.audioElement.paused) {
                        gp.audioElement.play().catch(() => {});
                    }
                }
                // Reflect state immediately in the list
                syncListIcons();
            } catch {}
        };
        if (window.globalPlayer) playSelected();
        else {
            let tries = 0;
            const int = setInterval(() => {
                tries++;
                if (window.globalPlayer || tries > 20) {
                    clearInterval(int);
                    if (window.globalPlayer) playSelected();
                }
            }, 100);
        }
      }, { passive: true });
      container.__listClickHandlerRegistered = true;
    }

    // If a player exists, keep the list icons synced with its state
    const attachPlayerSync = () => {
        const gp = window.globalPlayer;
        if (!gp || !gp.audioElement) return false;
        const el = gp.audioElement;
        if (el.__musicListSyncAttached) { syncListIcons(); return true; }
        const sync = () => syncListIcons();
        el.addEventListener('play', sync);
        el.addEventListener('pause', sync);
        el.addEventListener('ended', sync);
        el.addEventListener('loadedmetadata', sync);
        // Initial sync
        syncListIcons();
        el.__musicListSyncAttached = true;
        return true;
    };

    if (!attachPlayerSync()) {
        // Retry briefly if the player isn't ready yet
        let tries = 0;
        const t = setInterval(() => {
            if (attachPlayerSync() || ++tries > 25) clearInterval(t);
        }, 120);
    }
}

function bindContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const statusEl = document.getElementById('cf-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    function setStatus(msg, type = 'info') {
        if (!statusEl) return;
        statusEl.textContent = msg;
        statusEl.hidden = !msg;
        statusEl.dataset.type = type;
    }
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = (document.getElementById('cf-name')?.value || '').trim();
        const email = (document.getElementById('cf-email')?.value || '').trim();
        const message = (document.getElementById('cf-message')?.value || '').trim();
        const honeypot = (document.getElementById('cf-company')?.value || '').trim();
        const emailOk = /^\S+@\S+\.\S+$/.test(email);
        if (honeypot) { setStatus('Thanks! Message received.', 'success'); return; }
        if (!name || !emailOk || !message) { setStatus('Please enter your name, a valid email, and a message.', 'error'); return; }
        const endpoint = form.getAttribute('data-endpoint');
        if (endpoint && endpoint.startsWith('http')) {
            const payload = { name, email, message, _subject: `Website Contact from ${name}`, _source: 'nickvuci.com/contact' };
            if (submitBtn) submitBtn.disabled = true;
            setStatus('Sending…', 'info');
            fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) })
            .then(async (res) => {
                if (res.ok) { setStatus('Thanks! Your message was sent.', 'success'); form.reset(); }
                else { let detail = ''; try { const data = await res.json(); detail = data?.errors?.[0]?.message || data?.message || ''; } catch {} throw new Error(detail || `Request failed (${res.status})`); }
            })
            .catch((err) => { console.error('Form submit failed:', err); setStatus('Sorry, there was a problem sending your message. Please try again or email directly.', 'error'); })
            .finally(() => { if (submitBtn) submitBtn.disabled = false; });
        } else {
            const recipient = form.getAttribute('data-recipient') || 'contact@nickvuci.com';
            const subject = `Website Contact from ${name}`;
            const bodyLines = [ message, '', `— Sent from nickvuci.com contact page`, `From: ${name}`, `Email: ${email}` ];
            const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
            try { window.location.href = mailtoUrl; setStatus('Opening your email app… If nothing happens, ensure a default mail app is set.', 'success'); }
            catch (err) { console.error('Failed to open mail client', err); setStatus('Could not open your email app. You can email me directly instead.', 'error'); }
        }
    });
}

window.addEventListener('hashchange', () => { loadFromURL(); });

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash) {
        loadFromURL();
    } else {
        showContent('about');
        setTimeout(() => { if (window.globalPlayer) { selectRandomTrack(window.globalPlayer); } }, 700);
    }
});
