/**
 * Minimal track data derived from filenames in /music
 * Keeps only what the player and playlist need, with auto-formatted titles and dates
 * Version: 3.0-min
 */

(function () {
  // Helper: format YYYYMMDD -> { iso: YYYY-MM-DD, display: Month D, YYYY }
  function formatDateToken(dateToken) {
    const y = dateToken.slice(0, 4);
    const m = dateToken.slice(4, 6);
    const d = dateToken.slice(6, 8);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIdx = Math.max(0, Math.min(11, parseInt(m, 10) - 1));
    const display = `${monthNames[monthIdx]} ${parseInt(d, 10)}, ${y}`;
    return { iso: `${y}-${m}-${d}`, display };
  }

  // Helper: prettify title for display from raw id segment
  function formatTitle(raw) {
    if (!raw) return '';
    let t = raw;
    // Replace underscores and leftover hyphens inside the title with spaces
    t = t.replace(/_/g, ' ').replace(/-/g, ' ');
    // Insert spaces between a lower->Upper boundary (camel case)
    t = t.replace(/([a-z])([A-Z])/g, '$1 $2');
    // Insert spaces between letters and numbers boundaries
    t = t.replace(/([A-Za-z])(\d)/g, '$1 $2').replace(/(\d)([A-Za-z])/g, '$1 $2');
    // Trim common noisy suffix tokens at end
    t = t.replace(/\b(MP3|FLAC|WAV|MIXED)\b$/i, '').trim();
    // Collapse extra spaces
    t = t.replace(/\s{2,}/g, ' ').trim();
    return t;
  }

  // Build a minimal track object from a filename
  function buildTrack(fileName) {
    const base = fileName.replace(/^.*[\\\/]/, '');
    const noExt = base.replace(/\.(mp3|flac|wav)$/i, '');
    const parts = noExt.split('-');
    const dateToken = parts[1];
    const tuning = parts[2];
    const titleRaw = parts.slice(3).join('-'); // keep exactly as written for id
    const { iso, display } = formatDateToken(dateToken);
    const id = titleRaw; // exact as in filename (without extension)
    const title = formatTitle(titleRaw);
    return {
      id,
      title,
      artist: 'Nick Vuci',
      file: `music/${base}`,
      tuning,
      date: iso,
      dateDisplay: display
    };
  }

  // The current set of files found in /music at generation time
  const files = [
    'NickVuci-20200610-Free Pitch-Fractal_Soundscape.mp3',
    'NickVuci-20201022-24edo-PianoMinature2.mp3',
    'NickVuci-20210330-JI (AlFarabi1)-Improv.mp3',
    'NickVuci-20210528-JI (4567 CrossSet)-PreludeAndFugue.mp3',
    'NickVuci-20210530-16edo-AntiIonianDubstep.mp3',
    'NickVuci-20210605-16edo-AntiLydianDubstep.mp3',
    'NickVuci-20210611-16edo-AntiDorianDubstep1.mp3',
    'NickVuci-20210707-JI (AlFarabi7)-Gymnopedie3.mp3',
    'NickVuci-20210707-JI (Mode12)-Gymnopedie1.mp3',
    'NickVuci-20210712-24EDO-Surge_DXEP_Improv.mp3',
    'NickVuci-20210925-JI (7neji13)-Intro.mp3',
    'NickVuci-20211018-16edo-7over4Beat.mp3',
    'NickVuci-20211026-JI (Mode14)-FutureGarage.mp3',
    'NickVuci-20211119-JI (Mode12)-Fugue.mp3',
    'NickVuci-20211203-JI (Mode13)-Soundscape.mp3',
    'NickVuci-20220206-16edo-Prelude.mp3',
    'NickVuci-20220211-16edo-Softer for J.mp3',
    'NickVuci-20220306-16edo-Invention.mp3',
    'NickVuci-20220404-5edo-PianoNocturne.mp3',
    'NickVuci-20220605-13edo-Romance for Keyboard and Violin.mp3',
    'NickVuci-20230503-14edo-Semiquartal_EDM.mp3',
    'NickVuci-20230523-22edo-Praeambulum.mp3',
    'NickVuci-20230531-22edo-PorcupineChoraleWithPrelude.mp3',
    'NickVuci-20230602-10edo-3L 4s Xentimbre Prelude and Fugue.mp3',
    'NickVuci-20230606-19edo-Summertime Supermoon.mp3',
    'NickVuci-20230825-22edo-Prelude3.mp3',
    'NickVuci-20231216-13edo-5L3s Fugue.mp3',
    'NickVuci-20240105-16edo-MavilaFugueForTromboneTrio.mp3',
    'NickVuci-20240105-Mavila7Optimal5Lim-EDM_with_retuned_samples.mp3',
    'NickVuci-20240213-13edo-Prelude 1.mp3',
    'NickVuci-20240328-JI (11 limit and Archytas Enharmonic)-Prelude and Fugue for String Quartet.mp3',
    'NickVuci-20240411-34edo_6L1s_6_0-SwimmingInLakeOpeongo.mp3',
    'NickVuci-20240623-22edo-PostOrgyClarity.mp3',
    'NickVuci-20240718-22edo-PorcupineBeats.mp3',
    'NickVuci-20240721-11edo-3L 5s Synthwave.mp3',
    'NickVuci-20240723-11edo-RosieChillwave-MP3.mp3',
    'NickVuci-20240817-9edo-PreludeAndFugue.mp3',
    'NickVuci-20240822-34edo-AfterTheWildfires.mp3',
    'NickVuci-20240826-22edo-FullFangle.mp3',
    'NickVuci-20240903-34edo-ImmunityEDM.mp3',
    'NickVuci-20240915-34edo-TetracotEDM.mp3',
    'NickVuci-20250112-34edo-MabilaPassacaglia.mp3',
    'NickVuci-20250902-27edo-2 5 7 Subgroup EDM.mp3'
  ];

  const minimalTracks = files.map(buildTrack);

  window.tracksData = {
    tracks: minimalTracks,

    // Minimal schema used by PlaylistDataManager; keep artist present for sanitation
    trackSchema: {
      required: ['id', 'title', 'file'],
      optional: ['artist', 'tuning', 'date', 'dateDisplay'],
      types: {
        id: 'string',
        title: 'string',
        file: 'string',
        artist: 'string',
        tuning: 'string',
        date: 'string',
        dateDisplay: 'string'
      }
    },

    // Player defaults
    defaultVolume: 0.7,
    defaultPlaybackRate: 1.0,
    rememberLastTrack: true,
    version: '3.0-min'
  };
})();