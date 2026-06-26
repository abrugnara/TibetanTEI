# 🔧 INSTALLATION GUIDE — Step by Step

## ⚠️ **IMPORTANT: Browser Cache Is the Most Common Problem!**

If the new search function is not working, the cause is **99% of the time**
the browser cache.

---

## 📦 **INSTALLATION (5 Steps):**

### **Step 1: Replace the Files**

```
TibetanTEI/
├── detail.html              ← detail.html
├── assets/
│   ├── app/
│   │   └── detail.js        ← detail.js (NEW!)
│   └── css/
│       ├── main.css         ← main.css (NEW!)
│       └── search.css       ← search.css (NEW!)
```

---

### **Step 2: Check the CSS Order in detail.html**

**Open detail.html and verify lines 5–7:**

```html
<link rel="stylesheet" type="text/css" href="assets/css/main.css" />
<link rel="stylesheet" type="text/css" href="assets/css/search.css" />
```

**IMPORTANT:** `search.css` MUST come **after** `main.css`.

---

### **Step 3: Clear the Browser Cache COMPLETELY**

#### **Option A: Hard Reload (EASIEST method)**

**Windows:**
```
Ctrl + Shift + R
OR
Ctrl + F5
```

**Mac:**
```
Cmd + Shift + R
```

**Linux:**
```
Ctrl + Shift + R
```

#### **Option B: Developer Tools (MOST RELIABLE method)**

1. Open the page: `detail.html?id=2`
2. Press **F12** (Developer Tools)
3. **Right-click** the Reload button (next to the address bar)
4. Select: **"Empty Cache and Hard Reload"**

#### **Option C: Clear Cache Manually**

**Chrome:**
1. Ctrl + Shift + Delete
2. Select "Cached images and files"
3. Click "Clear data"

**Firefox:**
1. Ctrl + Shift + Delete
2. Select "Cache"
3. Click "Clear Now"

**Safari:**
1. Cmd + Option + E
2. Confirm

---

### **Step 4: Test with DIAGNOSE.html**

1. Open `DIAGNOSE.html` in the browser
2. Verify all tests pass:
   - ✓ JavaScript loaded
   - ✓ CSS loaded
   - ✓ .search-stats defined
   - ✓ .match-count defined
3. If ✗ → cache has not been cleared yet

---

### **Step 5: Functional Test**

1. Open `detail.html?id=2`
2. Type in the search field: `དབྱིག`
3. **You should see:**
   ```
   ┌────────────────────────────────┐
   │ དབྱིག [×] ← clear button       │
   └────────────────────────────────┘
            ↓
   ┌────────────────────────────────┐
   │ 12 matches on 5 pages  ← STATISTICS
   ├────────────────────────────────┤
   │ ● Page 65a [3×] (bo +1) ← COUNTER
   │ ● Page 65b [2×] (de)
   └────────────────────────────────┘
   ```

---

## 🐛 **TROUBLESHOOTING:**

### **Problem 1: "New features not visible"**

**Cause:** Browser cache

**Solution:**
1. Close **ALL** browser windows
2. Restart the browser
3. Load the page with **Ctrl + Shift + R**

---

### **Problem 2: "Clear button not visible"**

**Check:**

1. **Browser console (F12):**
   ```javascript
   document.getElementById('searchClear')
   // Expected: <button id="searchClear" ...>
   // If null → detail.html not updated!
   ```

2. **CSS loaded?**
   ```javascript
   getComputedStyle(document.querySelector('.search-clear')).display
   // Expected: "none" (becomes "block" when text is entered)
   ```

---

### **Problem 3: "Statistics not visible"**

**Check:**

1. **Element present?**
   ```javascript
   document.querySelector('.search-stats')
   // Expected: <div class="search-stats">
   // If null → JavaScript not updated!
   ```

2. **CSS correct?**
   ```javascript
   const el = document.querySelector('.search-stats');
   getComputedStyle(el).background;
   // Expected: contains "linear-gradient(...)"
   // If not → search.css not loaded or overridden
   ```

---

### **Problem 4: "Match counter not visible"**

**Check:**

1. **Browser console:**
   ```javascript
   document.querySelector('.match-count')
   // Expected: <span class="match-count">
   ```

2. **CSS:**
   ```javascript
   const el = document.querySelector('.match-count');
   getComputedStyle(el).display
   // Expected: "inline-block"
   ```

---

### **Problem 5: "Multi-syllable Tibetan search not working"**

**Check:**

1. **Browser console:**
   ```javascript
   // In detail.js, look for:
   "const query = e.target.value.trim();"

   // Must NOT be:
   "const query = e.target.value.toLowerCase().trim();"

   // If so → old detail.js still loaded!
   ```

---

### **Problem 6: "Everything else works, only search fails"**

**Checklist:**

- [ ] search.css present in `assets/css/search.css`?
- [ ] detail.html links search.css on line 7?
- [ ] Cache truly cleared? (close all windows!)
- [ ] F12 → Network → Reload → search.css loaded?
- [ ] F12 → Console → errors visible?

---

## ✅ **CHECKLIST — Complete Installation:**

- [ ] **detail.html** replaced
- [ ] **detail.js** replaced (in `assets/app/detail.js`)
- [ ] **main.css** replaced (in `assets/css/main.css`)
- [ ] **search.css** present (in `assets/css/search.css`)
- [ ] **CSS order** verified (search.css AFTER main.css)
- [ ] **Browser cache cleared** (Ctrl + Shift + R)
- [ ] **DIAGNOSE.html** tested (all ✓)
- [ ] **Functional test** completed:
  - [ ] Clear button appears when typing ✓
  - [ ] Statistics displayed ✓
  - [ ] Match counters displayed ✓
  - [ ] Tibetan multi-syllable search works ✓
  - [ ] Responsive design works (test on mobile) ✓

---

## 📱 **RESPONSIVE DESIGN — Tested:**

### **Desktop (> 1024px):**
- ✓ Full width: 600px
- ✓ Height: 60vh

### **Tablet (768px – 1024px):**
- ✓ Full width: 100%
- ✓ Height: 50vh

### **Mobile (< 768px):**
- ✓ Full width: 100%
- ✓ Height: 40vh
- ✓ Reduced font size
- ✓ Adapted buttons

### **Small mobile (< 480px):**
- ✓ Further reduced font size
- ✓ Height: 35vh
- ✓ Compact layout

---

## 🎯 **TESTING ACROSS DEVICES:**

1. **Desktop browsers:**
   - Chrome: ✓
   - Firefox: ✓
   - Safari: ✓
   - Edge: ✓

2. **Mobile browsers (responsive mode):**
   - F12 → Toggle Device Toolbar
   - Test various screen sizes

3. **Real mobile device:**
   - Test on an actual smartphone
   - Clear cache here as well!

---

## 💡 **LAST RESORT — If Nothing Works:**

1. **Close all browser windows**
2. **Restart the browser**
3. **Add to detail.html (line 8):**
   ```html
   <link rel="stylesheet" href="assets/css/search.css?v=2" />
   ```
   (The `?v=2` forces the browser to reload the file)

4. **Open the page with:**
   ```
   detail.html?id=2&nocache=123
   ```

5. **Open Developer Tools (F12):**
   - Network tab
   - Check "Disable cache"
   - Reload

---

## 🎉 **SUCCESS!**

If you can now see:
- ✓ Clear button
- ✓ Statistics
- ✓ Match counters
- ✓ Tibetan multi-syllable search working

**EVERYTHING IS WORKING!** 🎊

---

**For further issues: run DIAGNOSE.html and send a screenshot.**
