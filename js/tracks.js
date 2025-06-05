/**
 * Track data for the audio player
 * Enhanced with comprehensive metadata for playlist features
 * Version: 2.0 - Full playlist support with auto-generated filters
 */

window.tracksData = {
    // Track information with comprehensive metadata
    tracks: [
        {
            id: "track_001",
            title: "Softer for J",
            artist: "Nick Vuci",
            file: "music/NickVuci-20220211-16edo-Softer.mp3",
            year: 2022,
            genre: ["Modern Piano", "Experimental"],
            tuning: "16-tone equal temperament",
            mood: ["contemplative", "experimental"],
            tags: ["microtonal", "piano", "ambient"],
            duration: null, // Will be populated when loaded
            album: "Microtonal Explorations",
            bpm: 80,
            key: "C (16-EDO)",
            instruments: ["piano", "synthesizer"],
            description: "A softer piece composed in 16 equal divisions of the octave",
            dateAdded: "2022-02-11",
            playCount: 0,
            lastPlayed: null,
            favorite: false,
            waveformData: null, // For future waveform visualization
            analysisData: null  // For future music theory analysis
        },
        {
            id: "track_002",
            title: "Quarter-Tone Piano Miniature 1",
            artist: "Nick Vuci", 
            file: "music/NV-20201021-24EDO-SoloPianoMiniature1.flac",
            year: 2020,
            genre: ["Classical Piano", "Minimalist"],
            tuning: "24-tone equal temperament",
            mood: ["meditative", "peaceful"],
            tags: ["microtonal", "piano", "classical", "miniature"],
            duration: null, // Will be populated when loaded
            album: "Quarter-Tone Piano Miniatures",
            bpm: 72,
            key: "A minor (24-EDO)",
            instruments: ["piano"],
            description: "A solo piano miniature composed in 24 equal divisions of the octave",
            dateAdded: "2020-10-21",
            playCount: 0,            lastPlayed: null,
            favorite: false,
            waveformData: null,
            analysisData: null
        }
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
};
