(function () {
  const themes = [
    { id: 'default', label: 'Default' },
    { id: 'perjamuan', label: 'Perjamuan' },
    { id: 'tahun-baru', label: 'Tahun Baru' },
    { id: 'fajar-sabat', label: 'Fajar Sabat' }
  ];

  const storageKey = 'gmahkTheme';

  const applyTheme = (themeId) => {
    const selectedTheme = themes.some((theme) => theme.id === themeId) ? themeId : 'default';
    document.body.dataset.theme = selectedTheme;
    localStorage.setItem(storageKey, selectedTheme);

    const select = document.getElementById('theme-select');
    if (select) select.value = selectedTheme;
  };

  const createThemeSwitcher = () => {
    const navInner = document.querySelector('.nav-inner');
    const hamburger = document.querySelector('.hamburger');
    if (!navInner || document.getElementById('theme-select')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'theme-switcher';
    wrapper.innerHTML = `
      <label for="theme-select">Tema</label>
      <select id="theme-select" aria-label="Pilih tema halaman">
        ${themes.map((theme) => `<option value="${theme.id}">${theme.label}</option>`).join('')}
      </select>
    `;

    navInner.insertBefore(wrapper, hamburger);
    wrapper.querySelector('select').addEventListener('change', (event) => {
      applyTheme(event.target.value);
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    createThemeSwitcher();
    applyTheme(localStorage.getItem(storageKey) || 'default');
  });
})();
