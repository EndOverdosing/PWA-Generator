document.addEventListener('DOMContentLoaded', () => {
    const getEl = (selector) => document.querySelector(selector);
    const themeSwitcher = getEl('#theme-switcher');
    const settingsToggle = getEl('#settings-toggle');
    const settingsContent = getEl('#settings-content');
    const pwaForm = getEl('#pwa-form');
    const submitButton = getEl('#submit-button');
    const shareContainer = getEl('#share-container');
    const websiteUrlInput = getEl('#websiteUrl-input');
    const appNameInput = getEl('#appName');
    const shortNameInput = getEl('#shortName');
    const descriptionInput = getEl('#description');
    const themeColorInput = getEl('#themeColor');
    const backgroundColorInput = getEl('#backgroundColor');
    const displayModeInput = getEl('#displayMode');
    const iconUploadInput = getEl('#iconUpload');
    const themeColorPreview = getEl('#themeColorPreview');
    const backgroundColorPreview = getEl('#backgroundColorPreview');
    const themeColorValue = getEl('#themeColorValue');
    const backgroundColorValue = getEl('#backgroundColorValue');
    const fileUploadText = getEl('#file-upload-text');
    const savePreference = (key, value) => { try { localStorage.setItem(key, value); } catch (e) { console.error(e); } };
    const getPreference = (key) => { try { return localStorage.getItem(key); } catch (e) { return null; } };
    function applyTheme(theme) { document.body.classList.toggle('light-theme', theme === 'light'); }
    let currentTheme = getPreference('theme') || 'dark';
    applyTheme(currentTheme);
    themeSwitcher.onclick = () => { currentTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light'; savePreference('theme', currentTheme); applyTheme(currentTheme); };
    document.addEventListener('mousemove', e => { document.body.style.setProperty('--cursor-x', `${e.clientX}px`); document.body.style.setProperty('--cursor-y', `${e.clientY}px`); });
    document.querySelectorAll('.interactive-border').forEach(element => { element.addEventListener('mousemove', e => { const rect = element.getBoundingClientRect(); element.style.setProperty('--x', `${e.clientX - rect.left}px`); element.style.setProperty('--y', `${e.clientY - rect.top}px`); element.style.setProperty('--opacity', '1'); }); element.addEventListener('mouseleave', () => element.style.setProperty('--opacity', '0')); });
    settingsToggle.addEventListener('click', () => { settingsToggle.classList.toggle('open'); settingsContent.classList.toggle('hidden'); settingsContent.classList.toggle('visible'); });
    function updateColorUI(input, preview, valueSpan) { const color = input.value.toUpperCase(); preview.style.backgroundColor = color; valueSpan.textContent = color; }
    const colorPickerPopup = document.createElement('div');
    colorPickerPopup.className = 'color-picker-popup';
    colorPickerPopup.innerHTML = `<div class="color-picker-sv-panel"><div class="color-picker-thumb"></div></div><input type="range" min="0" max="360" value="0" class="color-picker-hue-slider">`;
    document.body.appendChild(colorPickerPopup);
    const svPanel = colorPickerPopup.querySelector('.color-picker-sv-panel'), thumb = colorPickerPopup.querySelector('.color-picker-thumb'), hueSlider = colorPickerPopup.querySelector('.color-picker-hue-slider');
    let activeColorTarget = null, pickerState = { h: 0, s: 1, v: 1 };
    function hsvToRgb(h, s, v) { let r, g, b, i, f, p, q, t; i = Math.floor(h * 6); f = h * 6 - i; p = v * (1 - s); q = v * (1 - f * s); t = v * (1 - (1 - f) * s); switch (i % 6) { case 0: r = v, g = t, b = p; break; case 1: r = q, g = v, b = p; break; case 2: r = p, g = v, b = t; break; case 3: r = p, g = q, b = v; break; case 4: r = t, g = p, b = v; break; case 5: r = v, g = p, b = q; break; } return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]; }
    function rgbToHex(r, g, b) { return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase(); }
    function updatePickerColor() { if (!activeColorTarget) return; const [r, g, b] = hsvToRgb(pickerState.h / 360, pickerState.s, pickerState.v); activeColorTarget.value = rgbToHex(r, g, b); activeColorTarget.dispatchEvent(new Event('input')); }
    function updateSvPanelBackground() { const [r, g, b] = hsvToRgb(pickerState.h / 360, 1, 1); svPanel.style.backgroundColor = `rgb(${r},${g},${b})`; }
    function openColorPicker(input) { activeColorTarget = input; const wrapper = input.closest('.color-picker-wrapper'), rect = wrapper.getBoundingClientRect(); colorPickerPopup.classList.add('visible'); colorPickerPopup.style.top = `${window.scrollY + rect.bottom + 8}px`; colorPickerPopup.style.left = `${window.scrollX + rect.left}px`; pickerState = { h: 0, s: 1, v: 1 }; hueSlider.value = pickerState.h; updateSvPanelBackground(); const svRect = svPanel.getBoundingClientRect(); thumb.style.left = `${pickerState.s * svRect.width}px`; thumb.style.top = `${(1 - pickerState.v) * svRect.height}px`; }
    svPanel.addEventListener('mousedown', (e) => { if (e.button !== 0) return; const onMouseMove = (moveEvent) => { const rect = svPanel.getBoundingClientRect(); let x = Math.max(0, Math.min(rect.width, moveEvent.clientX - rect.left)), y = Math.max(0, Math.min(rect.height, moveEvent.clientY - rect.top)); thumb.style.left = `${x}px`; thumb.style.top = `${y}px`; pickerState.s = x / rect.width; pickerState.v = 1 - (y / rect.height); updatePickerColor(); }; onMouseMove(e); window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', () => window.removeEventListener('mousemove', onMouseMove), { once: true }); });
    hueSlider.addEventListener('input', () => { pickerState.h = hueSlider.value; updateSvPanelBackground(); updatePickerColor(); });
    document.addEventListener('click', (e) => { if (colorPickerPopup.classList.contains('visible') && !colorPickerPopup.contains(e.target) && !e.target.closest('.color-picker-wrapper')) { colorPickerPopup.classList.remove('visible'); activeColorTarget = null; } });
    themeColorInput.addEventListener('input', () => updateColorUI(themeColorInput, themeColorPreview, themeColorValue));
    backgroundColorInput.addEventListener('input', () => updateColorUI(backgroundColorInput, backgroundColorPreview, backgroundColorValue));
    updateColorUI(themeColorInput, themeColorPreview, themeColorValue);
    updateColorUI(backgroundColorInput, backgroundColorPreview, backgroundColorValue);
    [themeColorInput, backgroundColorInput].forEach(input => { const wrapper = input.closest('.color-picker-wrapper'); wrapper.addEventListener('click', () => { if (colorPickerPopup.classList.contains('visible') && activeColorTarget === input) { colorPickerPopup.classList.remove('visible'); activeColorTarget = null; } else { openColorPicker(input); } }); });
    iconUploadInput.addEventListener('change', () => { if (iconUploadInput.files.length > 0) { fileUploadText.textContent = iconUploadInput.files[0].name; fileUploadText.style.color = 'var(--primary-text-color)'; } else { fileUploadText.textContent = 'No file chosen...'; fileUploadText.style.color = 'var(--muted-text-color)'; } });
    const alertContainer = getEl('#custom-alert-container');
    function showToast(message) { const toast = getEl('#toast-notification'); toast.innerHTML = `<i class="fa-solid fa-check-double"></i> ${message}`; toast.classList.remove('hidden'); setTimeout(() => toast.classList.add('visible'), 10); setTimeout(() => { toast.classList.remove('visible'); setTimeout(() => toast.classList.add('hidden'), 500); }, 4000); }
    function showCustomAlert(message) { alertContainer.innerHTML = `<div class="custom-alert-card interactive-border"><h3><i class="fa-solid fa-circle-exclamation"></i> Attention</h3><p>${message}</p><button class="custom-alert-close-btn">Okay</button></div>`; alertContainer.classList.remove('hidden'); setTimeout(() => alertContainer.classList.add('visible'), 10); const closeBtn = alertContainer.querySelector('.custom-alert-close-btn'), alertCard = alertContainer.querySelector('.custom-alert-card'); const closeAlert = () => { alertContainer.classList.remove('visible'); setTimeout(() => alertContainer.classList.add('hidden'), 300); }; closeBtn.onclick = closeAlert; alertContainer.onclick = (e) => { if (e.target === alertContainer) closeAlert(); }; alertCard.addEventListener('mousemove', e => { const rect = alertCard.getBoundingClientRect(); alertCard.style.setProperty('--x', `${e.clientX - rect.left}px`); alertCard.style.setProperty('--y', `${e.clientY - rect.top}px`); alertCard.style.setProperty('--opacity', '1'); }); alertCard.addEventListener('mouseleave', () => alertCard.style.setProperty('--opacity', '0')); }

    async function initializeFromUrlParams() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('url') && params.has('name') && params.has('icon')) {
            getEl('main').style.display = 'none';
            getEl('footer').style.display = 'none';
            document.title = params.get('name');
            const manifestUrl = `/api/manifest${window.location.search}`;
            const existingManifest = document.querySelector('link[rel="manifest"]');
            if (existingManifest) existingManifest.remove();
            const manifestLink = document.createElement('link');
            manifestLink.rel = 'manifest';
            manifestLink.href = manifestUrl;
            document.head.appendChild(manifestLink);
            if ('serviceWorker' in navigator) {
                try {
                    await navigator.serviceWorker.register('/sw.js');
                } catch (error) {
                    showCustomAlert('Could not initialize the PWA environment.');
                }
            }
            showToast("PWA is ready! This page is now installable.");
            setTimeout(() => launchPwaWrapper(params.get('url'), '#' + params.get('bg')), 500);
            return true;
        }
        return false;
    }

    pwaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!websiteUrlInput.value || !appNameInput.value || !iconUploadInput.files[0]) {
            showCustomAlert('Please fill out all required fields, including the URL, App Name, and Icon.');
            return;
        }
        shareContainer.classList.remove('hidden');
        shareContainer.innerHTML = `<div class="share-card interactive-border"><h3><i class="fa-solid fa-wand-magic-sparkles"></i> Share Your PWA</h3><p>Generate a permanent link to share this configured PWA with anyone.</p><button class="generate-link-btn" id="generate-link-btn"><i class="fa-solid fa-share-nodes"></i> Generate Link</button></div>`;
        getEl('#generate-link-btn').onclick = handleShareLinkGeneration;
    });

    async function handleShareLinkGeneration() {
        const genButton = getEl('#generate-link-btn');
        genButton.disabled = true;
        genButton.classList.add('loading');
        try {
            const iconFile = iconUploadInput.files[0];
            const uploadUrl = `/api/upload?filename=${encodeURIComponent(iconFile.name)}`;
            const response = await fetch(uploadUrl, { method: 'POST', body: iconFile });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || `HTTP error! Status: ${response.status}`);
            }
            const iconUrl = result.link;
            const params = new URLSearchParams();
            params.set('url', websiteUrlInput.value);
            params.set('name', appNameInput.value);
            params.set('s_name', shortNameInput.value);
            params.set('desc', descriptionInput.value);
            params.set('disp', displayModeInput.value);
            params.set('bg', backgroundColorInput.value.substring(1));
            params.set('th', themeColorInput.value.substring(1));
            params.set('icon', iconUrl);
            const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
            genButton.remove();
            getEl('.share-card p').textContent = 'Your shareable link is ready! Anyone visiting this URL will get your configured PWA.';
            getEl('.share-card').innerHTML += `<div class="share-link-result"><input type="text" readonly id="share-url-input" value="${shareUrl}"><button class="copy-link-btn" id="copy-link-btn">Copy</button></div>`;
            getEl('#copy-link-btn').onclick = () => { getEl('#share-url-input').select(); navigator.clipboard.writeText(shareUrl); showToast('Link copied to clipboard!'); };
        } catch (error) {
            console.error("Error generating share link:", error);
            const detailedMessage = `Could not generate the link.<br><br><em>"${error.message}"</em><br><br>Please try a different image file.`;
            showCustomAlert(detailedMessage);
            genButton.disabled = false;
            genButton.classList.remove('loading');
        }
    }

    function launchPwaWrapper(url, bgColor) {
        const pwaWrapperView = getEl('#pwa-wrapper-view');
        document.body.style.overflow = 'hidden';
        document.querySelectorAll('main, footer, .theme-switcher, .blurry-orbs').forEach(el => el.classList.add('hidden'));
        pwaWrapperView.style.backgroundColor = bgColor;
        pwaWrapperView.classList.remove('hidden');
        pwaWrapperView.innerHTML = `<iframe id="pwa-iframe" src="${url}" sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-top-navigation"></iframe><div id="draggable-back-btn" title="Exit PWA View"><i class="fa-solid fa-xmark"></i></div>`;
        const backBtn = pwaWrapperView.querySelector('#draggable-back-btn');
        const isTouchDevice = 'ontouchstart' in window;
        const startEvent = isTouchDevice ? 'touchstart' : 'mousedown', moveEvent = isTouchDevice ? 'touchmove' : 'mousemove', endEvent = isTouchDevice ? 'touchend' : 'mouseup';
        let isDragging = false, wasDragged = false, offset = { x: 0, y: 0 };
        backBtn.addEventListener('click', (e) => { if (wasDragged) { e.preventDefault(); e.stopPropagation(); } else { window.location.href = window.location.origin + window.location.pathname; } }, true);
        backBtn.addEventListener(startEvent, (e) => { isDragging = true; wasDragged = false; const event = isTouchDevice ? e.touches[0] : e; const rect = backBtn.getBoundingClientRect(); offset.x = event.clientX - rect.left; offset.y = event.clientY - rect.top; backBtn.style.cursor = 'grabbing'; });
        document.addEventListener(moveEvent, (e) => { if (!isDragging) return; wasDragged = true; e.preventDefault(); const event = isTouchDevice ? e.touches[0] : e; let newX = event.clientX - offset.x, newY = event.clientY - offset.y; const maxX = window.innerWidth - backBtn.offsetWidth, maxY = window.innerHeight - backBtn.offsetHeight; newX = Math.max(0, Math.min(newX, maxX)); newY = Math.max(0, Math.min(newY, maxY)); backBtn.style.left = `${newX}px`; backBtn.style.top = `${newY}px`; }, { passive: false });
        document.addEventListener(endEvent, () => { if (isDragging) { isDragging = false; backBtn.style.cursor = 'grab'; } });
    }
    
    document.querySelectorAll('.select-wrapper').forEach(setupCustomSelect);
    function setupCustomSelect(wrapper) { const nativeSelect = wrapper.querySelector('select'); nativeSelect.style.display = 'none'; const customSelect = document.createElement('div'); customSelect.className = 'custom-select'; wrapper.appendChild(customSelect); const trigger = document.createElement('div'); trigger.className = 'custom-select__trigger'; const triggerSpan = document.createElement('span'); trigger.appendChild(triggerSpan); customSelect.appendChild(trigger); const options = document.createElement('div'); options.className = 'custom-options'; customSelect.appendChild(options); const updateSelection = () => { const selectedOption = Array.from(nativeSelect.options).find(opt => opt.selected); triggerSpan.textContent = selectedOption.textContent; Array.from(options.children).forEach(optEl => { optEl.classList.toggle('selected', optEl.dataset.value === selectedOption.value); }); }; Array.from(nativeSelect.options).forEach(option => { const customOption = document.createElement('div'); customOption.className = 'custom-option'; customOption.textContent = option.textContent; customOption.dataset.value = option.value; options.appendChild(customOption); customOption.addEventListener('click', () => { nativeSelect.value = option.value; nativeSelect.dispatchEvent(new Event('change')); customSelect.classList.remove('open'); updateSelection(); }); }); trigger.addEventListener('click', () => customSelect.classList.toggle('open')); document.addEventListener('click', (e) => { if (!customSelect.contains(e.target)) customSelect.classList.remove('open'); }); nativeSelect.addEventListener('change', updateSelection); updateSelection(); }
    initializeFromUrlParams();
});