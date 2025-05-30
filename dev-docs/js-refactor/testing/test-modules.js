/**
 * Module Test Script
 * 
 * This script tests the modular implementation to ensure all
 * components are working correctly before integration.
 */

// Test Utils module
import { Utils } from './js-modules/utils/Utils.js';
import { AudioEngine } from './js-modules/audio/AudioEngine.js';

console.log('🧪 Testing Modular Components...');

// Test 1: Utils.formatTime
console.log('Test 1: Utils.formatTime');
console.log('- formatTime(65):', Utils.formatTime(65)); // Should be "1:05"
console.log('- formatTime(0):', Utils.formatTime(0)); // Should be "0:00"
console.log('- formatTime(NaN):', Utils.formatTime(NaN)); // Should be "0:00"

// Test 2: Utils.isMobileDevice
console.log('Test 2: Utils.isMobileDevice');
console.log('- isMobileDevice():', Utils.isMobileDevice());

// Test 3: Utils.validateElement
console.log('Test 3: Utils.validateElement');
const testElement = document.createElement('div');
console.log('- validateElement(div):', Utils.validateElement(testElement, 'test-div'));
console.log('- validateElement(null):', Utils.validateElement(null, 'missing-element'));

// Test 4: Utils.clamp
console.log('Test 4: Utils.clamp');
console.log('- clamp(5, 0, 10):', Utils.clamp(5, 0, 10)); // Should be 5
console.log('- clamp(-5, 0, 10):', Utils.clamp(-5, 0, 10)); // Should be 0
console.log('- clamp(15, 0, 10):', Utils.clamp(15, 0, 10)); // Should be 10

// Test 5: AudioEngine (without actual audio element)
console.log('Test 5: AudioEngine');
const mockAudio = {
    paused: true,
    currentTime: 0,
    duration: 100,
    volume: 0.5,
    src: ''
};
const audioEngine = new AudioEngine(mockAudio);
console.log('- AudioEngine isReady():', audioEngine.isReady());
console.log('- AudioEngine getState():', audioEngine.getState());

console.log('✅ Module tests completed!');
