# Directory Cleanup Plan - May 30, 2025

## 🧹 Homepage Directory Cleanup

### **Files to Remove (Redundant/Temporary)**

#### **Test Files (Move to dev-docs/testing/)**
- `debug-ios-integration.html` → Move to testing folder
- `ios-integration-test.html` → Consolidate with existing test
- `test-ios-implementation.html` → Move to testing folder  
- `test-ios-integration.html` → Move to testing folder
- `orientation-test.html` → Move to testing folder

#### **Temporary Files**
- `tatus` → Remove (appears to be git diff output)

#### **Keep in Root (Production Files)**
- `ios-production-test.html` → Keep for production testing
- All core HTML files (index.html, about.html, etc.)
- All core JS files (ios-player.js, ios-bridge-main.js, etc.)
- All core CSS files

### **Directory Structure After Cleanup**

```
Homepage/
├── Core Website Files
│   ├── index.html, about.html, contact.html, music.html, tools.html
│   ├── styles.css, main.js, tracks.js
│   ├── music-player-modular-v2.js
│   └── ios-player.js, ios-bridge-main.js, ios-player.css
├── Production Testing
│   └── ios-production-test.html
├── Documentation
│   ├── README.md, WEBSITE-README.md, CNAME
├── Assets
│   └── music/ (audio files)
├── Modular Components
│   └── js-modules/ (organized modules)
└── Development
    └── dev-docs/ (all documentation and testing)
```

### **Actions to Take**
1. Move test files to appropriate dev-docs/testing/ location
2. Remove temporary files
3. Verify core functionality still works
4. Update documentation if needed

**Goal: Clean, organized root directory with only production files**
