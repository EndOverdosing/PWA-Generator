document.addEventListener('DOMContentLoaded', () => {
    const getEl = (selector) => document.querySelector(selector); const themeSwitcher = getEl('#theme-switcher'); const savePreference = (key, value) => { try { localStorage.setItem(key, value); } catch (e) { console.error(e) } };
    const getPreference = (key) => { try { return localStorage.getItem(key); } catch (e) { return null; } };

    function applyTheme(theme) {
        document.body.classList.toggle('light-theme', theme === 'light');
    }

    let currentTheme = getPreference('theme') || 'dark';
    applyTheme(currentTheme);

    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            currentTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
            savePreference('theme', currentTheme);
            applyTheme(currentTheme);
        });
    }

    document.addEventListener('mousemove', e => {
        document.body.style.setProperty('--cursor-x', `${e.clientX}px`);
        document.body.style.setProperty('--cursor-y', `${e.clientY}px`);
    });

    document.querySelectorAll('.interactive-border').forEach(element => {
        element.addEventListener('mousemove', e => {
            const rect = element.getBoundingClientRect();
            element.style.setProperty('--x', `${e.clientX - rect.left}px`);
            element.style.setProperty('--y', `${e.clientY - rect.top}px`);
            element.style.setProperty('--opacity', '1');
        });
        element.addEventListener('mouseleave', () => element.style.setProperty('--opacity', '0'));
    });
});