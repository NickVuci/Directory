/**
 * Site audio player: a slim bar in the footer.
 *
 * Public API (used by main.js): window.globalPlayer
 *   tracks, currentTrackIndex, isPlaying
 *   loadTrack(index, { play, user })  select a track, optionally start it
 *   toggle(), play(), pause()
 *   getCurrentTrackId()
 *   selectInitial(trackId)            pick the track named in the URL, else a random one
 *
 * Every state change dispatches `player:change` on document, with
 * detail { index, playing, user }, so the page can stay in sync without polling.
 */
(function () {
  const ICONS = {
    play: '<path d="M8 5.5 18.5 12 8 18.5Z"/>',
    pause: '<path d="M8.5 5.5v13M15.5 5.5v13"/>',
    prev: '<path d="M6.5 5.5v13M18 5.5 9.5 12l8.5 6.5Z"/>',
    next: '<path d="M17.5 5.5v13M6 5.5l8.5 6.5L6 18.5Z"/>',
    volume: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4Z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    muted: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4Z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>'
  };

  function icon(name) {
    return `<svg class="icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
  }

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch { /* storage can be unavailable (private browsing) */ }
    return null;
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ss = String(s).padStart(2, '0');
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
  }

  class SitePlayer {
    constructor(container) {
      this.container = container;
      this.tracks = (window.tracksData && window.tracksData.tracks) || [];
      this.currentTrackIndex = -1;
      this.previousVolume = 0.7;

      this.render();
      this.bind();

      const saved = parseFloat(store('playerVolume'));
      const volume = Number.isFinite(saved) ? saved : (window.tracksData?.defaultVolume ?? 0.7);
      this.setVolume(volume);
      this.setupMediaSession();
    }

    get isPlaying() { return !this.audio.paused; }

    render() {
      this.container.innerHTML = `
        <div class="player" role="region" aria-label="Audio player">
          <div class="player-now">
            <div class="player-title">Select a track</div>
            <div class="player-sub"></div>
          </div>
          <div class="player-controls">
            <button type="button" class="icon-btn prev-btn" aria-label="Previous track">${icon('prev')}</button>
            <button type="button" class="icon-btn icon-btn--primary play-btn" aria-label="Play">${icon('play')}</button>
            <button type="button" class="icon-btn next-btn" aria-label="Next track">${icon('next')}</button>
          </div>
          <div class="player-timeline">
            <span class="time time-current">0:00</span>
            <input type="range" class="progress" min="0" max="100" value="0" step="0.1" aria-label="Seek" disabled>
            <span class="time time-duration">0:00</span>
          </div>
          <div class="player-volume">
            <button type="button" class="icon-btn mute-btn" aria-label="Mute">${icon('volume')}</button>
            <input type="range" class="volume" min="0" max="100" value="70" step="1" aria-label="Volume">
          </div>
          <audio preload="metadata"></audio>
        </div>`;
      const $ = (sel) => this.container.querySelector(sel);
      this.audio = $('audio');
      this.titleEl = $('.player-title');
      this.subEl = $('.player-sub');
      this.playBtn = $('.play-btn');
      this.prevBtn = $('.prev-btn');
      this.nextBtn = $('.next-btn');
      this.progress = $('.progress');
      this.currentEl = $('.time-current');
      this.durationEl = $('.time-duration');
      this.muteBtn = $('.mute-btn');
      this.volumeEl = $('.volume');
    }

    bind() {
      this.playBtn.addEventListener('click', () => this.toggle(true));
      this.prevBtn.addEventListener('click', () => this.previous());
      this.nextBtn.addEventListener('click', () => this.next(true));
      this.muteBtn.addEventListener('click', () => this.toggleMute());
      this.volumeEl.addEventListener('input', () => this.setVolume(this.volumeEl.value / 100));
      this.progress.addEventListener('input', () => {
        this.progress.style.setProperty('--p', this.progress.value + '%');
        const d = this.audio.duration;
        if (Number.isFinite(d)) this.audio.currentTime = (this.progress.value / 100) * d;
      });

      this.audio.addEventListener('timeupdate', () => this.updateProgress());
      this.audio.addEventListener('loadedmetadata', () => {
        this.durationEl.textContent = formatTime(this.audio.duration);
        this.progress.disabled = false;
      });
      this.audio.addEventListener('play', () => this.syncState(false));
      this.audio.addEventListener('pause', () => this.syncState(false));
      this.audio.addEventListener('ended', () => this.next(false, true));
      this.audio.addEventListener('error', () => {
        if (this.currentTrackIndex < 0) return;
        this.subEl.textContent = 'This track could not be loaded.';
        this.syncState(false);
      });
    }

    /* ---- track selection ---- */

    findIndexById(id) {
      if (!id) return -1;
      let i = this.tracks.findIndex(t => t.id === id);
      if (i === -1) i = this.tracks.findIndex(t => t.legacyId === id); // older shared links
      return i;
    }

    selectInitial(trackId) {
      if (!this.tracks.length) return;
      const i = this.findIndexById(trackId);
      this.loadTrack(i !== -1 ? i : Math.floor(Math.random() * this.tracks.length));
    }

    loadTrack(index, { play = false, user = false } = {}) {
      if (!this.tracks.length || index < 0 || index >= this.tracks.length) return;
      const changed = index !== this.currentTrackIndex;
      this.currentTrackIndex = index;
      const track = this.tracks[index];

      if (changed) {
        this.audio.src = track.file;
        this.titleEl.textContent = track.title || 'Untitled';
        this.subEl.textContent = [track.tuning, track.dateDisplay].filter(Boolean).join(' · ');
        this.progress.value = 0;
        this.progress.style.setProperty('--p', '0%');
        this.progress.disabled = true;
        this.currentEl.textContent = '0:00';
        this.durationEl.textContent = '0:00';
        this.updateMediaSession(track);
      }
      if (play) this.play();
      this.syncState(user);
    }

    next(user = false, auto = false) {
      if (!this.tracks.length) return;
      const wasPlaying = this.isPlaying || auto;
      this.loadTrack((this.currentTrackIndex + 1) % this.tracks.length, { play: wasPlaying, user });
    }

    previous() {
      if (!this.tracks.length) return;
      if (this.audio.currentTime > 3) { this.audio.currentTime = 0; return; }
      const wasPlaying = this.isPlaying;
      const i = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
      this.loadTrack(i, { play: wasPlaying, user: true });
    }

    /* ---- transport ---- */

    play() {
      if (this.currentTrackIndex < 0) this.loadTrack(0);
      return this.audio.play().catch(() => { /* blocked or interrupted; state resyncs from events */ });
    }

    pause() { this.audio.pause(); }

    toggle(user = false) {
      if (this.audio.paused) this.play(); else this.pause();
      if (user) this.syncState(true);
    }

    /* ---- volume ---- */

    setVolume(v) {
      v = Math.min(1, Math.max(0, Number(v) || 0));
      this.audio.volume = v;
      this.volumeEl.value = Math.round(v * 100);
      this.volumeEl.style.setProperty('--p', this.volumeEl.value + '%');
      if (v > 0) { this.previousVolume = v; store('playerVolume', String(v)); }
      this.updateMuteButton();
    }

    toggleMute() {
      this.setVolume(this.audio.volume > 0 ? 0 : this.previousVolume || 0.7);
    }

    updateMuteButton() {
      const muted = this.audio.volume === 0;
      this.muteBtn.innerHTML = icon(muted ? 'muted' : 'volume');
      this.muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
    }

    /* ---- display ---- */

    updateProgress() {
      const { currentTime, duration } = this.audio;
      this.currentEl.textContent = formatTime(currentTime);
      if (duration > 0) {
        this.progress.value = (currentTime / duration) * 100;
        this.progress.style.setProperty('--p', this.progress.value + '%');
        this.progress.setAttribute('aria-valuetext', `${formatTime(currentTime)} of ${formatTime(duration)}`);
      }
    }

    syncState(user) {
      const playing = this.isPlaying;
      this.playBtn.innerHTML = icon(playing ? 'pause' : 'play');
      this.playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
      document.dispatchEvent(new CustomEvent('player:change', {
        detail: { index: this.currentTrackIndex, playing, user: !!user }
      }));
    }

    getCurrentTrackId() {
      const t = this.tracks[this.currentTrackIndex];
      return t ? t.id : null;
    }

    /* ---- lock screen / media keys ---- */

    setupMediaSession() {
      if (!('mediaSession' in navigator)) return;
      const set = (action, fn) => { try { navigator.mediaSession.setActionHandler(action, fn); } catch { /* unsupported action */ } };
      set('play', () => this.play());
      set('pause', () => this.pause());
      set('previoustrack', () => this.previous());
      set('nexttrack', () => this.next(true));
      set('seekto', (d) => { if (d.seekTime != null) this.audio.currentTime = d.seekTime; });
    }

    updateMediaSession(track) {
      if (!('mediaSession' in navigator) || !window.MediaMetadata) return;
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist || 'Nick Vuci',
        album: track.tuning || ''
      });
    }
  }

  const mount = document.querySelector('.player-mount');
  if (mount) window.globalPlayer = new SitePlayer(mount);
})();
