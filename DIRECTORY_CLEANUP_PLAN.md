# Directory Cleanup Plan

## 🧹 **CLEANUP STRATEGY**

### **Current Issues:**
1. **Root Directory Clutter:** Too many analysis/investigation files in root
2. **Redundant Documentation:** Multiple similar documentation files
3. **Test Files:** Development test files mixed with production code
4. **Inconsistent Organization:** Files not properly categorized

### **Cleanup Actions:**

#### **1. Consolidate Investigation/Analysis Files**
```
Move to: /dev-docs/investigations/
- CRITICAL_ISSUES_PRIORITIZATION.md
- MOBILE_INVESTIGATION_SUMMARY.md  
- MOBILE_PLAYER_BUG_ANALYSIS.md
- PRIORITY_4_COMPLETION_REPORT.md
```

#### **2. Organize Test Files**
```
Move to: /dev-docs/testing/
- test-expand-collapse.html
- test-mobile-issues.html
- test-touch-conflict-fix.html
```

#### **3. Consolidate Documentation**
```
Keep in root: README.md, WEBSITE-README.md
Move to dev-docs: Other development documentation
```

#### **4. Production Files (Keep in Root)**
```
✅ Keep:
- index.html, about.html, contact.html, music.html, tools.html
- styles.css, main.js, music-player-modular-v2.js, tracks.js
- js-modules/ (modular code)
- music/ (audio files)
- CNAME (GitHub Pages)
```

## 📁 **TARGET STRUCTURE**
```
/ (Root - Production Only)
├── *.html (pages)
├── *.css, *.js (core scripts)
├── README.md, WEBSITE-README.md
├── js-modules/ (modular code)
├── music/ (audio files)
├── CNAME
└── dev-docs/
    ├── investigations/ (analysis files)
    ├── testing/ (test files)
    ├── css-refactor/
    └── js-refactor/
```
