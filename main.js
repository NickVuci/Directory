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
    if (page) targetPage = page; else if (track) targetPage = 'music';
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
    const list = document.createElement('ul');
    list.className = 'all-tracks-list';
    const clean = (title) => (title ? title.replace(/^Nick\s*Vuci\s*[-–:]*\s*/i, '').trim() : 'Untitled');
    tracks.forEach((t, i) => {
        const li = document.createElement('li');
        li.className = 'track-row';
        li.innerHTML = `
            <div class="track-row-inner">
                <button class="play-icon" aria-label="Play" data-index="${i}">▶</button>
                <div class="track-meta">
                    <strong class="title">${clean(t.title)}</strong>
                    ${t.year ? `<span class="sep"> • </span><span class="year">${t.year}</span>` : ''}
                    ${t.tuning ? `<span class="sep"> • </span><span class="tuning">${t.tuning}</span>` : ''}
                </div>
            </div>`;
        list.appendChild(li);
    });
    container.appendChild(list);
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.play-icon');
        if (!btn) return;
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        const playSelected = () => {
            try {
                window.globalPlayer.loadTrack(idx);
                if (window.globalPlayer.audioElement && window.globalPlayer.audioElement.paused) {
                    window.globalPlayer.audioElement.play().catch(() => {});
                }
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
