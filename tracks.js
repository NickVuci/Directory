// Track Database
// This file contains all available tracks with their metadata

const TRACKS = [
    {
        id: 1,
        title: "Softer for J",
        artist: "Nick Vuci",
        src: "music/NickVuci-20220211-16edo-Softer.mp3",
        album: null,
        year: 2022,
        genre: "Xenharmonic",
        tuning: "16-EDO",
        duration: null, // Will be populated when loaded
        description: "A softer piece composed in 16 equal divisions of the octave"
    },
    {
        id: 2,
        title: "Quarter-Tone Piano Miniature 1",
        artist: "Nick Vuci", 
        src: "music/NV-20201021-24EDO-SoloPianoMiniature1.flac",
        album: null,
        year: 2020,
        genre: "Xenharmonic",        tuning: "24-EDO",
        duration: null, // Will be populated when loaded
        description: "A solo piano miniature composed in 24 equal divisions of the octave"
    },
    // Future tracks will be added here with more metadata:
    // tags: ["experimental", "ambient", "classical"],
    // bpm: 120,
    // key: "C major (in 24-EDO)",
    // instruments: ["piano", "synthesizer"],
    // mood: "contemplative",
    // etc.
];

// Export the tracks array
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = TRACKS;
} else {
    // Browser environment - make available globally
    window.TRACKS = TRACKS;
}
