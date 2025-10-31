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
    'NickVuci-20200610-FreePitch-Fractal_Soundscape.mp3',
    'NickVuci-20201022-24edo-PianoMinature2.mp3',
    'NickVuci-20210330-AlFarabi1-Improv.mp3',
    'NickVuci-20210528-4567CrossSet-PreludeAndFugue.mp3',
    'NickVuci-20210530-16edo-AntiIonianDubstep.mp3',
    'NickVuci-20210605-16edo-AntiLydianDubstep.mp3',
    'Nickvuci-20210611-16edo-AntiDorianDubstep.mp3',
    'NickVuci-20210707-AlFarabi7-Gymnopedie3.mp3',
    'NickVuci-20210707-Mode12-Gymnopedie1.mp3',
    'NickVuci-20210712-24EDO-Surge_DXEP_Improv.mp3',
    'NickVuci-20210925-7neji13-Intro.mp3',
    'NickVuci-20211018-16edo-7over4Beat.mp3',
    'NickVuci-20211026-Mode14-FutureGarage.mp3',
    'NickVuci-20211119-Mode12-Fugue.mp3',
    'NickVuci-20211203-Mode13-Soundscape.mp3',
    'NickVuci-20220206-16edo-Prelude.mp3',
    'NickVuci-20220211-16edo-Softer.mp3',
    'NickVuci-20220306-16edo-Invention.mp3',
    'NickVuci-20220404-5edo-PianoNocturne.mp3',
    'NickVuci-20220605-13edo-Romance for Keyboard and Violin.mp3',
    'NickVuci-20230503-14edo-Semiquartal_EDM.mp3',
    'NickVuci-20230523-22edo-Praeambulum.mp3',
    'NickVuci-20230531-22edo-PorcupineChoraleWithPrelude.mp3',
    'NickVuci-20230602-10edo-3L4s Xentimbre Prelude and Fugue.mp3',
    'NickVuci-20230606-19edo-Summertime Supermoon_MP3.mp3',
    'NickVuci-20230825-22edo-Prelude3.mp3',
    'NickVuci-20231216-13edo-5L3s Fugue.mp3',
    'NickVuci-20240105-16edo-MavilaFugueForTromboneTrio_MP3.mp3',
    'NickVuci-20240105-Mavila7Optimal5Lim-EDM_with_retuned_samples.mp3',
    'NickVuci-20240213-13edo-WT13C_Prelude1_in_C_Dylathian.mp3',
    'NickVuci-20240328-EJI and Archytas Enharmonic-Prelude and Fugue for String Quartet.mp3',
    'NickVuci-20240411-34edo_6L1s_6_0-SwimmingInLakeOpeongo.mp3',
    'NickVuci-20240623-22edo-PostOrgyClarity.mp3',
    'NickVuci-20240718-22edo-PorcupineBeats.mp3',
    'NickVuci-20240721-11edo-3L5sSynthwave.mp3',
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
/**
 * Track data for the audio player
 * Enhanced with comprehensive metadata for playlist features
 * Version: 2.0 - Full playlist support with auto-generated filters
 */

/* window.tracksData = {
    // Track information with comprehensive metadata
    tracks: [
        {
            id: "softer-for-j",
            title: "Softer for J",
            artist: "Nick Vuci",
            file: "music/NickVuci-20220211-16TET-Softer.mp3",
            year: 2022,
            genre: ["Modern Piano", "Experimental"],
            tuning: "16-TET",
            mood: ["contemplative", "experimental"],
            tags: ["microtonal", "piano", "ambient"],
            duration: null, // Will be populated when loaded
            album: null,
            bpm: 80,
            key: null,
            instruments: ["piano", "foley"],
            description: "A softer piece composed in 16 equal divisions of the octave",
            dateAdded: "2022-02-11",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null, // For future waveform visualization
            analysisData: null  // For future music theory analysis
        },        
        {
            id: "24tet-piano-mini-1",
            title: "Quarter-Tone Piano Miniature 1",
            artist: "Nick Vuci", 
            file: "music/NickVuci-20201021-24TET-SoloPianoMiniature1.flac",
            year: 2020,
            genre: ["Classical Piano", "Minimalist"],
            tuning: "24-TET",
            mood: ["meditative", "peaceful"],
            tags: ["microtonal", "piano", "classical", "miniature"],
            duration: null, // Will be populated when loaded
            album: "Quarter-Tone Piano Miniatures",
            bpm: 72,
            key: "A minor (24-TET)",
            instruments: ["piano"],
            description: "A solo piano miniature composed in 24 equal divisions of the octave",
            dateAdded: "2020-10-21",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null,
            analysisData: null
        },
        {
            id: "mavila7-study-1",
            title: "Mavila[7] Studies: 1. Anti-Ionian",
            artist: "Nick Vuci",
            file: "music/NickVuci-20210511-16TET-Mavila7Studies_1_AntiIonian.mp3",
            year: 2021,
            genre: ["Modern Piano", "Experimental", "Microtonal Studies"],
            tuning: "16-TET",
            mood: ["academic", "exploratory"],
            tags: ["microtonal", "piano", "mavila", "anti-ionian"],
            duration: null,
            album: "Mavila[7] Studies",
            bpm: 85,
            key: "Anti-Ionian (16-TET)",
            instruments: ["piano"],
            description: "Study exploring the Anti-Ionian mode in 16-TET using Mavila temperament concepts",
            dateAdded: "2021-05-11",

        },
        {
            id: "track_107",
            title: "Mavila Tintinnabuli Sketch (16-TET)",
            artist: "Nick Vuci",
            file: "music/NickVuci-20240106-16TET-Mavila_TitinnabuliSketch.mp3",
            year: 2024,
            genre: ["Minimalism", "Sketch", "Sacred"],
            tuning: "16-TET (Mavila)",
            mood: ["meditative", "sacred", "minimalist"],
            tags: ["microtonal", "16-TET", "mavila", "tintinnabuli", "minimalism"],
            duration: null,
            album: "Sacred Works",
            bpm: 54,
            key: "Mavila[7]",
            instruments: ["piano", "bells"],
            description: "A tintinnabuli-style sketch in mavila temperament",
            dateAdded: "2024-01-06",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null,
            analysisData: null
        },
        {
            id: "track_108",
            title: "WT13C Prelude 1 in C Dylathian (13-TET)",
            artist: "Nick Vuci",
            file: "music/NickVuci-20240213-13TET-WT13C_Prelude1_in_C_Dylathian.mp3",
            year: 2024,
            genre: ["Prelude", "Well-Tempered"],
            tuning: "13-TET",
            mood: ["classical", "well-tempered", "sophisticated"],
            tags: ["microtonal", "13-TET", "well-tempered", "dylathian", "prelude"],
            duration: null,
            album: "Well-Tempered 13",
            bpm: 82,
            key: "13-TET Dylathian",
            instruments: ["piano"],
            description: "First prelude from Well-Tempered 13-TET in C Dylathian",
            dateAdded: "2024-02-13",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null,
            analysisData: null
        },
        {
            id: "string-quartet-into-the-limit",
            title: "Into The Limit for String Quartet",
            artist: "Nick Vuci",
            file: "music/NickVuci-20240213-EJI-IntoTheLimitForStringQuartet_MP3.mp3",
            year: 2024,
            genre: ["Chamber Music", "Just Intonation"],
            tuning: "Extended Just Intonation",
            mood: ["pure", "harmonic", "mathematical"],
            tags: ["just intonation", "EJI", "string quartet", "pure intervals"],
            duration: null,
            album: "Just Intonation Works",
            bpm: 78,
            key: "Just Intonation",
            instruments: ["string quartet"],
            description: "A string quartet exploring the mathematical beauty of just intonation",
            dateAdded: "2024-02-13",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null,
            analysisData: null
        },        {
            id: "track_110",
            title: "5L3s 4-3 Fugue Sketch Piano (13-TET)",
            artist: "Nick Vuci",
            file: "music/NickVuci-20240215-13TET-5L3s_4-3_Fugue_Sketch_Piano_WAV.mp3",
            year: 2024,
            genre: ["Fugue", "Sketch"],
            tuning: "13-TET (5L3s)",
            mood: ["intellectual", "contrapuntal", "complex"],
            tags: ["microtonal", "13-TET", "5L3s", "fugue", "sketch"],
            duration: null,
            album: "Contrapuntal Works",
            bpm: 94,
            key: "13-TET 5L3s",
            instruments: ["piano"],
            description: "Piano sketch of the 5L3s fugue in 13-TET",
            dateAdded: "2024-02-15",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null,
            analysisData: null
        },
        {
            id: "track_111",
            title: "WT13C Fugue 3 in D Ultharian (13-TET)",
            artist: "Nick Vuci",
            file: "music/NickVuci-20240215-13TET-WT13C_Fugue3_in_D_Ultharian.mp3",
            year: 2024,
            genre: ["Fugue", "Well-Tempered"],
            tuning: "13-TET",
            mood: ["classical", "contrapuntal", "sophisticated"],
            tags: ["microtonal", "13-TET", "well-tempered", "ultharian", "fugue"],
            duration: null,
            album: "Well-Tempered 13",
            bpm: 108,
            key: "13-TET Ultharian",
            instruments: ["piano"],
            description: "Third fugue from Well-Tempered 13-TET in D Ultharian",
            dateAdded: "2024-02-15",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null,
            analysisData: null
        },
        {
            id: "45tet-orchestral-piece",
            title: "Orchestral Piece for Tuning Club",
            artist: "Nick Vuci",
            file: "music/NickVuci-20240217-45TET-Orchestral_Piece_for_Tuning_Club_MP3.mp3",
            year: 2024,
            genre: ["Orchestral", "Community"],
            tuning: "45-TET",
            mood: ["grand", "orchestral", "community"],
            tags: ["microtonal", "45-TET", "orchestral", "tuning club", "community"],
            duration: null,
            album: "Community Works",
            bpm: 116,
            key: "45-TET",
            instruments: ["orchestra"],
            description: "A piece for orchestra in 45-TET composed for the tuning community",
            dateAdded: "2024-02-17",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null,
            analysisData: null
        },
        {
            id: "34tet-swimming-in-lake-opeongo",
            title: "Swimming in Lake Opeongo",
            artist: "Nick Vuci",
            file: "music/NickVuci-20240411-34TET_6L1s_6_0-SwimmingInLakeOpeongo.mp3",
            year: 2024,
            genre: ["Nature", "Ambient"],
            tuning: "34-TET (6L1s)",
            mood: ["peaceful", "nature", "aquatic"],
            tags: ["microtonal", "34-TET", "6L1s", "nature", "lake", "ambient"],
            duration: null,
            album: "Nature Works",
            bpm: 68,
            key: "34-TET 6L1s",
            instruments: ["synthesizer", "piano"],
            description: "An ambient piece inspired by swimming in Lake Opeongo",
            dateAdded: "2024-04-11",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null,
            analysisData: null
        },
        {
            id: "track_114",
            title: "Prelude (22-TET, June 2024)",
            artist: "Nick Vuci",
            file: "music/NickVuci-20240614-22TET-Prelude.mp3",
            year: 2024,
            genre: ["Prelude", "Classical"],
            tuning: "22-TET",
            mood: ["contemplative", "elegant", "flowing"],
            tags: ["microtonal", "22-TET", "prelude", "classical"],
            duration: null,
            album: "2024 Works",
            bpm: 74,
            key: "22-TET",
            instruments: ["piano"],
            description: "A June 2024 prelude exploring 22-TET harmonies",
            dateAdded: "2024-06-14",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null,
            analysisData: null
        },
        {
            id: "track_115",
            title: "DR Serial Sacred Minimalism (11-TET)",
            artist: "Nick Vuci",
            file: "music/NickVuci-20240701-11TET-DR_Serial_SacredMinimalism.mp3",
            year: 2024,
            genre: ["Minimalism", "Sacred", "Serial"],
            tuning: "11-TET",
            mood: ["sacred", "meditative", "mathematical"],
            tags: ["microtonal", "11-TET", "minimalism", "sacred", "serial"],
            duration: null,
            album: "Sacred Works",
            bpm: 58,
            key: "11-TET",
            instruments: ["piano", "organ"],
            description: "A sacred minimalist work using serial techniques in 11-TET",
            dateAdded: "2024-07-01",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null,
            analysisData: null
        },
        {
            id: "22tet-piano-presto",
            title: "Piano Presto",
            artist: "Nick Vuci",
            file: "music/NickVuci-20240718-22TET-PianoPresto.mp3",
            year: 2024,
            genre: ["Classical", "Presto"],
            tuning: "22-TET",
            mood: ["energetic", "virtuosic", "fast"],
            tags: ["microtonal", "22-TET", "presto", "virtuosic", "piano"],
            duration: null,
            album: "2024 Works",
            bpm: 168,
            key: "22-TET",
            instruments: ["piano"],
            description: "A fast-paced presto showcasing 22-TET piano techniques",
            dateAdded: "2024-07-18",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null,
            analysisData: null
        },
        {
            id: "track_117",
            title: "Porcupine Beats (22-TET)",
            artist: "Nick Vuci",
            file: "music/NickVuci-20240718-22TET-PorcupineBeats.mp3",
            year: 2024,
            genre: ["Electronic", "Beats", "Porcupine Temperament"],
            tuning: "22-TET (Porcupine)",
            mood: ["rhythmic", "electronic", "experimental"],
            tags: ["microtonal", "22-TET", "porcupine", "beats", "electronic"],
            duration: null,
            album: "Electronic Experiments",
            bpm: 120,
            key: "Porcupine[8]",
            instruments: ["drum machine", "synthesizer"],
            description: "Electronic beats in porcupine temperament",
            dateAdded: "2024-07-18",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null,
            analysisData: null
        },
        {
            id: "track_118",
            title: "3L5s Synthwave Draft (11-TET)",
            artist: "Nick Vuci",
            file: "music/NickVuci-20240721-11TET-3L5sSynthwave-Draft.mp3",
            year: 2024,
            genre: ["Synthwave", "Electronic", "Draft"],
            tuning: "11-TET (3L5s)",
            mood: ["retro", "electronic", "nostalgic"],
            tags: ["microtonal", "11-TET", "3L5s", "synthwave", "retro"],
            duration: null,
            album: "Electronic Experiments",
            bpm: 112,
            key: "11-TET 3L5s",
            instruments: ["synthesizer", "drum machine"],
            description: "A synthwave draft in the 3L5s scale of 11-TET",
            dateAdded: "2024-07-21",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null,
            analysisData: null
        },
        {
            id: "track_119",
            title: "EDM Thing Sketch V2 (11-TET)",
            artist: "Nick Vuci",
            file: "music/NickVuci-20240723_2-11TET-EDM_thing-SketchV2-MP3.mp3",
            year: 2024,
            genre: ["EDM", "Electronic", "Sketch"],
            tuning: "11-TET",
            mood: ["energetic", "electronic", "experimental"],
            tags: ["microtonal", "11-TET", "edm", "sketch", "electronic"],
            duration: null,
            album: "Electronic Experiments",
            bpm: 128,
            key: "11-TET",
            instruments: ["synthesizer", "drum machine"],
            description: "Second version of an EDM sketch in 11-TET",
            dateAdded: "2024-07-23",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null,
            analysisData: null
        },
        {
            id: "track_120",
            title: "Rosie Chillwave (11-TET)",
            artist: "Nick Vuci",
            file: "music/NickVuci-20240723-11TET-RosieChillwave-MP3.mp3",
            year: 2024,
            genre: ["Chillwave", "Electronic", "Ambient"],
            tuning: "11-TET",
            mood: ["chill", "relaxed", "dreamy"],
            tags: ["microtonal", "11-TET", "chillwave", "ambient", "chill"],
            duration: null,
            album: "Electronic Experiments",
            bpm: 88,
            key: "11-TET",
            instruments: ["synthesizer", "soft drums"],
            description: "A chillwave piece in 11-TET with a relaxed vibe",
            dateAdded: "2024-07-23",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null,
            analysisData: null
        },
        {
            id: "9tet-prelude-and-fugue",
            title: "Prelude and Fugue (9-TET)",
            artist: "Nick Vuci",
            file: "music/NickVuci-20240817-9TET-PreludeAndFugue.mp3",
            year: 2024,
            genre: ["Prelude", "Fugue", "Classical"],
            tuning: "9-TET",
            mood: ["intellectual", "contrapuntal", "meditative"],
            tags: ["microtonal", "9-TET", "prelude", "fugue", "classical"],
            duration: null,
            album: "Contrapuntal Works",
            bpm: 96,
            key: "9-TET",
            instruments: ["synth"],
            description: "A prelude and fugue pair in the sparse harmonies of 9-TET",
            dateAdded: "2024-08-17",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null,
            analysisData: null
        },
        {
            id: "track_122",
            title: "Synthwave (9-TET)",
            artist: "Nick Vuci",
            file: "music/NickVuci-20240817-9TET-Synthwave.mp3",
            year: 2024,
            genre: ["Synthwave", "Electronic"],
            tuning: "9-TET",
            mood: ["retro", "electronic", "nostalgic"],
            tags: ["microtonal", "9-TET", "synthwave", "retro", "electronic"],
            duration: null,
            album: "Electronic Experiments",
            bpm: 116,
            key: "9-TET",
            instruments: ["synthesizer", "drum machine"],
            description: "Retro synthwave exploring the unique sound of 9-TET",
            dateAdded: "2024-08-17",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null,
            analysisData: null
        },
        {
            id: "34tet-after-the-wildfires",
            title: "After the Wildfires",
            artist: "Nick Vuci",
            file: "music/NickVuci-20240822-34TET-Tetracot7_AfterTheWildfires.mp3",
            year: 2024,
            genre: ["Ambient", "Nature", "Tetracot Temperament"],
            tuning: "34-TET (Tetracot[7])",
            mood: ["reflective", "nature", "post-disaster"],
            tags: ["microtonal", "34-TET", "tetracot", "nature", "wildfires"],
            duration: 136,
            album: "Nature Works",
            bpm: 64,
            key: "Tetracot[7]",
            instruments: ["synthesizer", "piano"],
            description: "A reflective piece about renewal after wildfires in tetracot temperament",
            dateAdded: "2024-08-22",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null,
            analysisData: null
        },
        {
            id: "track_124",
            title: "Comma Pump 1 (22-TET)",
            artist: "Nick Vuci",
            file: "music/NickVuci-20240826-22TET-CommaPump1.mp3",
            year: 2024,
            genre: ["Experimental", "Comma Pump"],
            tuning: "22-TET",
            mood: ["hypnotic", "experimental", "mathematical"],
            tags: ["microtonal", "22-TET", "comma pump", "experimental", "mathematical"],
            duration: null,
            album: "Mathematical Works",
            bpm: 72,
            key: "22-TET",
            instruments: ["piano", "synthesizer"],
            description: "First in a series exploring comma pump techniques in 22-TET",
            dateAdded: "2024-08-26",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null,
            analysisData: null
        },        {
            id: "track_125",
            title: "Comma Pump Combination (22-TET)",
            artist: "Nick Vuci",
            file: "music/NickVuci-20240826-22TET-CommaPumpCombination.mp3",
            year: 2024,
            genre: ["Experimental", "Comma Pump"],
            tuning: "22-TET",
            mood: ["hypnotic", "experimental", "mathematical"],
            tags: ["microtonal", "22-TET", "comma pump", "experimental", "combination"],
            duration: null,
            album: "Mathematical Works",
            bpm: 76,
            key: "22-TET",
            instruments: ["piano", "synthesizer"],
            description: "A combination of comma pump techniques in 22-TET",
            dateAdded: "2024-08-26",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null,
            analysisData: null
        },
        {
            id: "track_132",
            file: "NickVuci-20210530-16NEJI128-AntiIonianDubstep.mp3",
            title: "Anti-Ionian Dubstep",
            artist: "Nick Vuci",
            year: 2021,
            tuning: "16-TET NEJI-128",
            mood: "energetic",
            tags: ["dubstep", "anti-ionian", "16TET", "neji", "2021"],
            album: "Anti-Modal EDM Series",
            description: "Dubstep track using anti-Ionian mode in 16-TET NEJI-128 tuning"
        },
        {
            id: "track_133",
            file: "NickVuci-20210601-16NEJI128-AntiDorianDubstepSketch.mp3",
            title: "Anti-Dorian Dubstep Sketch",
            artist: "Nick Vuci",
            year: 2021,
            tuning: "16-TET NEJI-128",
            mood: "dark",
            tags: ["dubstep", "anti-dorian", "sketch", "16TET", "2021"],
            album: "Anti-Modal EDM Series",
            description: "Sketch exploring anti-Dorian harmonies in dubstep format using 16-TET"
        },
        {
            id: "track_136",
            file: "NickVuci-20210623-MaqamHijaz-StringQuartet_mvmt2.mp3",
            title: "String Quartet in Maqam Hijaz - Movement 2",
            artist: "Nick Vuci",
            year: 2021,
            tuning: "Maqam Hijaz",
            mood: "contemplative",
            tags: ["maqam", "hijaz", "quartet", "arabic", "2021"],
            album: "Maqam Studies",
            description: "Second movement of a string quartet based on the Arabic Maqam Hijaz scale"
        },
    ],
    // Metadata schema for track validation
    trackSchema: {
        required: ['id', 'title', 'artist', 'file'],
        optional: ['year', 'genre', 'tuning', 'mood', 'tags', 'duration', 'album', 'bpm', 'key', 'instruments', 'description', 'dateAdded', 'playCount', 'lastPlayed', 'favorite', 'waveformData', 'analysisData'],
        types: {
            id: 'string',
            title: 'string',
            artist: 'string',
            file: 'string',
            year: 'number',
            genre: 'array',
            tuning: 'string',
            mood: 'array',
            tags: 'array',
            duration: ['number', 'null'],
            album: ['string', 'null'],
            bpm: ['number', 'null'],
            key: ['string', 'null'],
            instruments: 'array',
            description: 'string',
            dateAdded: 'string',
            playCount: 'number',
            lastPlayed: ['string', 'null'],
            favorite: 'boolean',
            waveformData: ['object', 'null'],
            analysisData: ['object', 'null']
        }
    },

    // Default settings
    defaultVolume: 0.7,
    defaultPlaybackRate: 1.0,
    rememberLastTrack: true,
    
    // Version for data migration
  version: "2.0"
}; */