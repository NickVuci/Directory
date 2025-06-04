/**
 * Track data for the audio player
 * Enhanced with additional metadata fields
 */

window.tracksData = {
    // Track information with extended metadata
    tracks: [
        {
            id: "01",
            title: "Softer for J",
            artist: "Nick Vuci",
            file: "music/NickVuci-20220211-16edo-Softer.mp3",
            year: "2022",
            genre: "Modern Piano",
            tuning: "16-tone equal temperament",
            album: null,
            duration: null, // Will be populated when loaded
            description: "A softer piece composed in 16 equal divisions of the octave"
        },
        {
            id: "02",
            title: "Quarter-Tone Piano Miniature 1",
            artist: "Nick Vuci", 
            file: "music/NV-20201021-24EDO-SoloPianoMiniature1.flac",
            year: "2020",
            genre: "Classical Piano",
            tuning: "24-tone equal temperament",
            album: "Quarter-Tone Piano Miniatures",
            duration: null, // Will be populated when loaded
            description: "A solo piano miniature composed in 24 equal divisions of the octave"
        }
        // Future tracks can be added here with additional metadata:
        // tags: ["experimental", "ambient", "classical"],
        // bpm: 120,
        // key: "C major (in 24-EDO)",
        // instruments: ["piano", "synthesizer"],
        // mood: "contemplative",
    ],
    
    // Default settings
    defaultVolume: 0.7,
    defaultPlaybackRate: 1.0,
    rememberLastTrack: true
};
