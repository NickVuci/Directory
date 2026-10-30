/**
 * Light/dark toggle in the band header.
 *
 * The site follows the system theme until the visitor picks one; the choice is
 * kept in localStorage and applied as data-theme on <html> (an inline script in
 * index.html applies it before the CSS loads, so there is no flash).
 */
(function () {
  const root = document.documentElement;
  const button = document.querySelector('.theme-toggle');
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const BAND = { light: '#2e0f16', dark: '#331120' };

  function current() {
    const chosen = root.dataset.theme;
    if (chosen === 'light' || chosen === 'dark') return chosen;
    return system.matches ? 'dark' : 'light';
  }

  function sync() {
    if (!button) return;
    const dark = current() === 'dark';
    button.classList.toggle('is-dark', dark);
    const label = dark ? 'Switch to light theme' : 'Switch to dark theme';
    button.setAttribute('aria-label', label);
    button.title = label;
    button.setAttribute('aria-pressed', String(dark));
  }

  function choose(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch { /* storage unavailable */ }
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => { m.content = BAND[theme]; });
    sync();
  }

  // A remembered choice also sets the browser chrome colour
  if (root.dataset.theme === 'light' || root.dataset.theme === 'dark') {
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => { m.content = BAND[root.dataset.theme]; });
  }

  if (button) button.addEventListener('click', () => choose(current() === 'dark' ? 'light' : 'dark'));
  system.addEventListener('change', sync);
  sync();
})();
