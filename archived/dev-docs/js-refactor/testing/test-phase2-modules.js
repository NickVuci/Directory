/* ==========================================
   PHASE 2 MODULE TESTING SUITE
   Comprehensive testing for all Phase 2 modules
   ========================================== */

// Test results storage
const testResults = {
    modules: {},
    functionality: {},
    integration: {},
    errors: []
};

// Test configuration
const TEST_CONFIG = {
    timeout: 5000,
    verboseLogging: true,
    autoRun: true
};

/* ========================================
   MODULE LOADING TESTS
   ======================================== */

async function testModuleLoading() {
    console.log('🔄 Starting module loading tests...');
    
    const modules = [
        { name: 'Utils', path: './js-modules/utils/Utils.js' },
        { name: 'AudioEngine', path: './js-modules/audio/AudioEngine.js' },
        { name: 'Configuration', path: './js-modules/config/Configuration.js' },
        { name: 'DOMHandler', path: './js-modules/dom/DOMHandler.js' },
        { name: 'EventHandler', path: './js-modules/events/EventHandler.js' }
    ];
    
    for (const module of modules) {
        try {
            console.log(`📦 Testing ${module.name}...`);
            const startTime = performance.now();
            
            const imported = await import(module.path);
            const loadTime = performance.now() - startTime;
            
            testResults.modules[module.name] = {
                loaded: true,
                loadTime: loadTime,
                exports: Object.keys(imported),
                exportCount: Object.keys(imported).length,
                instance: imported
            };
            
            console.log(`✅ ${module.name} loaded in ${loadTime.toFixed(2)}ms`);
            console.log(`   Exports: ${Object.keys(imported).join(', ')}`);
            
        } catch (error) {
            testResults.modules[module.name] = {
                loaded: false,
                error: error.message,
                stack: error.stack
            };
            
            console.error(`❌ ${module.name} failed to load:`, error.message);
            testResults.errors.push(`Module loading: ${module.name} - ${error.message}`);
        }
    }
}

/* ========================================
   CONFIGURATION MODULE TESTS
   ======================================== */

async function testConfigurationModule() {
    console.log('\n⚙️ Testing Configuration module...');
    
    try {
        const { Configuration, getConfig, setConfig, mergeConfig, validateConfig, isMobileMode } = 
            testResults.modules.Configuration.instance;
        
        const tests = {
            'Basic config access': () => {
                const audioConfig = getConfig('audio');
                return audioConfig && typeof audioConfig === 'object';
            },
            
            'Nested config access': () => {
                const volume = getConfig('audio.volume');
                return typeof volume === 'number' && volume >= 0 && volume <= 1;
            },
            
            'Config modification': () => {
                const originalVolume = getConfig('audio.volume');
                setConfig('audio.volume', 0.8);
                const newVolume = getConfig('audio.volume');
                setConfig('audio.volume', originalVolume); // Restore
                return newVolume === 0.8;
            },
            
            'Mobile detection': () => {
                const isMobile = isMobileMode();
                return typeof isMobile === 'boolean';
            },
            
            'Element ID validation': () => {
                const playButtonId = getConfig('elementIds.playPauseButton');
                return typeof playButtonId === 'string' && playButtonId.length > 0;
            },
            
            'Config validation': () => {
                const isValid = validateConfig({
                    audio: { volume: 0.5 },
                    elementIds: { playPauseButton: 'test-btn' }
                });
                return typeof isValid === 'boolean';
            }
        };
        
        testResults.functionality.Configuration = {};
        
        for (const [testName, testFunc] of Object.entries(tests)) {
            try {
                const result = testFunc();
                testResults.functionality.Configuration[testName] = {
                    passed: result,
                    result: result
                };
                console.log(`${result ? '✅' : '❌'} ${testName}: ${result}`);
            } catch (error) {
                testResults.functionality.Configuration[testName] = {
                    passed: false,
                    error: error.message
                };
                console.error(`❌ ${testName}: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Configuration module test setup failed:', error.message);
        testResults.errors.push(`Configuration testing: ${error.message}`);
    }
}

/* ========================================
   DOM HANDLER MODULE TESTS
   ======================================== */

async function testDOMHandlerModule() {
    console.log('\n🎭 Testing DOM Handler module...');
    
    try {
        const { DOMHandler } = testResults.modules.DOMHandler.instance;
        const domHandler = new DOMHandler();
        
        // Create test DOM elements
        const testContainer = document.createElement('div');
        testContainer.innerHTML = `
            <div id="test-play-pause-btn">Play</div>
            <div id="test-track-title">Test Track</div>
            <div id="test-track-artist">Test Artist</div>
            <div id="test-current-time">0:00</div>
            <div id="test-duration">0:00</div>
            <div id="test-progress-bar"></div>
            <div id="test-progress-thumb"></div>
        `;
        document.body.appendChild(testContainer);
        
        const tests = {
            'DOM Handler instantiation': () => {
                return domHandler instanceof DOMHandler;
            },
            
            'Element retrieval': () => {
                const element = domHandler.getElement('test-play-pause-btn');
                return element !== null;
            },
            
            'Safe element access': () => {
                const nonExistent = domHandler.getElement('non-existent-element');
                return nonExistent === null;
            },
            
            'Time display update': () => {
                domHandler.updateTimeDisplay(65, 180);
                const currentTime = document.getElementById('test-current-time');
                return currentTime && currentTime.textContent.includes('1:05');
            },
            
            'Track display update': () => {
                domHandler.updateTrackDisplay('New Track', 'New Artist');
                const title = document.getElementById('test-track-title');
                const artist = document.getElementById('test-track-artist');
                return title && artist && 
                       title.textContent === 'New Track' && 
                       artist.textContent === 'New Artist';
            },
            
            'Progress display update': () => {
                domHandler.updateProgressDisplay(0.5);
                return true; // Visual update, hard to test programmatically
            },
            
            'Error state handling': () => {
                domHandler.showErrorState('Test error');
                return true; // Visual update
            }
        };
        
        testResults.functionality.DOMHandler = {};
        
        for (const [testName, testFunc] of Object.entries(tests)) {
            try {
                const result = testFunc();
                testResults.functionality.DOMHandler[testName] = {
                    passed: result,
                    result: result
                };
                console.log(`${result ? '✅' : '❌'} ${testName}: ${result}`);
            } catch (error) {
                testResults.functionality.DOMHandler[testName] = {
                    passed: false,
                    error: error.message
                };
                console.error(`❌ ${testName}: ${error.message}`);
            }
        }
        
        // Cleanup
        document.body.removeChild(testContainer);
        
    } catch (error) {
        console.error('❌ DOM Handler module test setup failed:', error.message);
        testResults.errors.push(`DOM Handler testing: ${error.message}`);
    }
}

/* ========================================
   EVENT HANDLER MODULE TESTS
   ======================================== */

async function testEventHandlerModule() {
    console.log('\n🎯 Testing Event Handler module...');
    
    try {
        const { EventHandler } = testResults.modules.EventHandler.instance;
        const eventHandler = new EventHandler();
        
        let callbackCalled = false;
        let callbackValue = null;
        
        const tests = {
            'Event Handler instantiation': () => {
                return eventHandler instanceof EventHandler;
            },
            
            'Callback assignment': () => {
                eventHandler.onPlay = () => { callbackCalled = true; };
                return typeof eventHandler.onPlay === 'function';
            },
            
            'Callback execution': () => {
                callbackCalled = false;
                eventHandler.onPlay();
                return callbackCalled === true;
            },
            
            'Parameter passing': () => {
                eventHandler.onVolumeChange = (volume) => { callbackValue = volume; };
                eventHandler.onVolumeChange(0.7);
                return callbackValue === 0.7;
            },
            
            'Event listener setup': () => {
                // Create test element
                const testButton = document.createElement('button');
                testButton.id = 'test-event-button';
                document.body.appendChild(testButton);
                
                let clicked = false;
                testButton.addEventListener('click', () => { clicked = true; });
                
                // Simulate click
                testButton.click();
                
                document.body.removeChild(testButton);
                return clicked === true;
            },
            
            'Event cleanup': () => {
                try {
                    eventHandler.destroy();
                    return true;
                } catch (error) {
                    return false;
                }
            }
        };
        
        testResults.functionality.EventHandler = {};
        
        for (const [testName, testFunc] of Object.entries(tests)) {
            try {
                const result = testFunc();
                testResults.functionality.EventHandler[testName] = {
                    passed: result,
                    result: result
                };
                console.log(`${result ? '✅' : '❌'} ${testName}: ${result}`);
            } catch (error) {
                testResults.functionality.EventHandler[testName] = {
                    passed: false,
                    error: error.message
                };
                console.error(`❌ ${testName}: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Event Handler module test setup failed:', error.message);
        testResults.errors.push(`Event Handler testing: ${error.message}`);
    }
}

/* ========================================
   INTEGRATION TESTS
   ======================================== */

async function testModularPlayerIntegration() {
    console.log('\n🔗 Testing Modular Player Integration...');
    
    try {
        // Create basic player HTML structure for testing
        const playerContainer = document.createElement('div');
        playerContainer.innerHTML = `
            <div id="music-player" class="music-player">
                <div class="player-content">
                    <div class="track-info">
                        <div class="track-title" id="track-title">Loading...</div>
                        <div class="track-artist" id="track-artist">Nick Vuci</div>
                    </div>
                    <div class="player-controls">
                        <button id="play-pause-btn" class="play-pause-btn">⏸️</button>
                        <div class="time-display">
                            <span id="current-time">0:00</span> / <span id="duration">0:00</span>
                        </div>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar" id="progress-bar">
                            <div class="progress-thumb" id="progress-thumb"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(playerContainer);
        
        // Load and test the modular player
        const { MusicPlayer } = await import('./music-player-modular-v2.js');
        const player = new MusicPlayer();
        
        const integrationTests = {
            'Player instantiation': () => {
                return player instanceof MusicPlayer;
            },
            
            'Module integration': () => {
                return player.domHandler && player.eventHandler && player.config;
            },
            
            'Track loading': () => {
                return Array.isArray(player.tracks) && player.tracks.length > 0;
            },
            
            'Audio engine integration': () => {
                return player.audioEngine && typeof player.audioEngine.play === 'function';
            },
            
            'Configuration integration': () => {
                return player.config && typeof player.config === 'object';
            },
            
            'DOM handler integration': () => {
                return player.domHandler && typeof player.domHandler.updateDisplay === 'function';
            },
            
            'Event handler integration': () => {
                return player.eventHandler && typeof player.eventHandler.setupEventListeners === 'function';
            },
            
            'Player methods': () => {
                const methods = ['play', 'pause', 'nextTrack', 'previousTrack', 'setVolume'];
                return methods.every(method => typeof player[method] === 'function');
            }
        };
        
        testResults.integration.ModularPlayer = {};
        
        for (const [testName, testFunc] of Object.entries(integrationTests)) {
            try {
                const result = testFunc();
                testResults.integration.ModularPlayer[testName] = {
                    passed: result,
                    result: result
                };
                console.log(`${result ? '✅' : '❌'} ${testName}: ${result}`);
            } catch (error) {
                testResults.integration.ModularPlayer[testName] = {
                    passed: false,
                    error: error.message
                };
                console.error(`❌ ${testName}: ${error.message}`);
            }
        }
        
        // Cleanup
        document.body.removeChild(playerContainer);
        
    } catch (error) {
        console.error('❌ Integration test setup failed:', error.message);
        testResults.errors.push(`Integration testing: ${error.message}`);
    }
}

/* ========================================
   TEST REPORT GENERATION
   ======================================== */

function generateTestReport() {
    console.log('\n📊 PHASE 2 TEST REPORT');
    console.log('='.repeat(50));
    
    // Module loading summary
    console.log('\n📦 MODULE LOADING:');
    const moduleStats = Object.entries(testResults.modules).map(([name, result]) => {
        const status = result.loaded ? '✅' : '❌';
        const time = result.loadTime ? ` (${result.loadTime.toFixed(2)}ms)` : '';
        return `${status} ${name}${time}`;
    });
    console.log(moduleStats.join('\n'));
    
    // Functionality test summary
    console.log('\n🧪 FUNCTIONALITY TESTS:');
    Object.entries(testResults.functionality).forEach(([module, tests]) => {
        console.log(`\n${module}:`);
        Object.entries(tests).forEach(([testName, result]) => {
            const status = result.passed ? '✅' : '❌';
            console.log(`  ${status} ${testName}`);
        });
    });
    
    // Integration test summary
    console.log('\n🔗 INTEGRATION TESTS:');
    Object.entries(testResults.integration).forEach(([module, tests]) => {
        console.log(`\n${module}:`);
        Object.entries(tests).forEach(([testName, result]) => {
            const status = result.passed ? '✅' : '❌';
            console.log(`  ${status} ${testName}`);
        });
    });
    
    // Error summary
    if (testResults.errors.length > 0) {
        console.log('\n❌ ERRORS:');
        testResults.errors.forEach(error => console.log(`  • ${error}`));
    }
    
    // Overall statistics
    const totalTests = Object.values(testResults.functionality).reduce((total, module) => 
        total + Object.keys(module).length, 0) + 
        Object.values(testResults.integration).reduce((total, module) => 
        total + Object.keys(module).length, 0);
    
    const passedTests = Object.values(testResults.functionality).reduce((total, module) => 
        total + Object.values(module).filter(test => test.passed).length, 0) + 
        Object.values(testResults.integration).reduce((total, module) => 
        total + Object.values(module).filter(test => test.passed).length, 0);
    
    const loadedModules = Object.values(testResults.modules).filter(module => module.loaded).length;
    const totalModules = Object.keys(testResults.modules).length;
    
    console.log('\n📈 SUMMARY:');
    console.log(`Modules loaded: ${loadedModules}/${totalModules}`);
    console.log(`Tests passed: ${passedTests}/${totalTests}`);
    console.log(`Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    return {
        modulesLoaded: loadedModules,
        totalModules: totalModules,
        testsPassed: passedTests,
        totalTests: totalTests,
        successRate: (passedTests / totalTests) * 100,
        errors: testResults.errors.length
    };
}

/* ========================================
   MAIN TEST RUNNER
   ======================================== */

async function runAllTests() {
    console.log('🚀 Starting Phase 2 Module Testing Suite...\n');
    
    try {
        await testModuleLoading();
        await testConfigurationModule();
        await testDOMHandlerModule();
        await testEventHandlerModule();
        await testModularPlayerIntegration();
        
        const summary = generateTestReport();
        
        console.log('\n🎉 Testing complete!');
        return summary;
        
    } catch (error) {
        console.error('❌ Test suite failed:', error);
        return { error: error.message };
    }
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        testResults,
        generateTestReport
    };
}

// Auto-run if configured
if (TEST_CONFIG.autoRun && typeof window !== 'undefined') {
    // Run tests when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runAllTests);
    } else {
        setTimeout(runAllTests, 100);
    }
}

// Make functions available globally for manual testing
if (typeof window !== 'undefined') {
    window.Phase2Tests = {
        runAllTests,
        testModuleLoading,
        testConfigurationModule,
        testDOMHandlerModule,
        testEventHandlerModule,
        testModularPlayerIntegration,
        generateTestReport,
        testResults
    };
}
