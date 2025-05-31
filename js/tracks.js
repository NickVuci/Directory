/**
 * Track data for the audio player
 */

window.tracksData = {
    // Track information
    tracks: [
        {
            id: "01",
            title: "Softer (16-EDO)",
            artist: "Nick Vuci",
            tuning: "16-tone equal temperament",
            file: "music/NickVuci-20220211-16edo-Softer.mp3",
            year: "2022",
            description: "A composition in 16 tone equal temperament"
        },
        {
            id: "02",
            title: "Solo Piano Miniature 1",
            artist: "Nick Vuci",
            tuning: "24-tone equal temperament",
            file: "music/NV-20201021-24EDO-SoloPianoMiniature1.flac",
            year: "2020",
            description: "A piano piece composed in 24 tone equal temperament"
        }
    ],
    
    // Default settings
    defaultVolume: 0.7,
    defaultPlaybackRate: 1.0,
    rememberLastTrack: true
};
