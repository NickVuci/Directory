/**
 * Module Index - Barrel Export
 * 
 * Central export point for all music player modules.
 * This allows for clean imports from a single location.
 * 
 * @author Nick Vuci
 * @version 1.0.0
 * @date May 29, 2025
 */

export { AudioEngine } from './AudioEngine.js';
export { Utils } from './Utils.js';

// Module metadata
export const MODULE_INFO = {
    version: '1.0.0',
    buildDate: '2025-05-29',
    modules: ['AudioEngine', 'Utils'],
    description: 'Nick Vuci Website Music Player Modules'
};
