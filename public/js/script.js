document.addEventListener('DOMContentLoaded', () => {
    const getEl = (selector) => document.querySelector(selector);

    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(err => {
                console.error('ServiceWorker registration failed: ', err);
            });
        }
    }

    function launchPwaMode(pwaId) {
        document.body.classList.add('pwa-mode');

        const initialize = async () => {
            try {
                const manifestUrl = `/api/manifest?id=${pwaId}`;
                const response = await fetch(manifestUrl);
                if (!response.ok) throw new Error('PWA configuration not found.');
                
                const manifest = await response.json();
                if (!manifest || !manifest.target_url) {
                    throw new Error('PWA configuration is invalid or missing a target URL.');
                }

                document.title = manifest.name;
                document.body.style.backgroundColor = manifest.background_color;

                const existingManifest = document.querySelector('link[rel="manifest"]');
                if (existingManifest) existingManifest.remove();
                
                const manifestLink = document.createElement('link');
                manifestLink.rel = 'manifest';
                manifestLink.href = manifestUrl;
                document.head.appendChild(manifestLink);
                
                const pwaWrapperView = getEl('#pwa-wrapper-view');
                if (pwaWrapperView) {
                    pwaWrapperView.classList.remove('hidden');
                    const iframe = document.createElement('iframe');
                    iframe.id = 'pwa-iframe';
                    iframe.src = manifest.target_url;
                    iframe.sandbox = "allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-top-navigation";
                    pwaWrapperView.innerHTML = '';
                    pwaWrapperView.appendChild(iframe);
                }
            } catch (error) {
                console.error('PWA Initialization Error:', error.message);
                document.body.innerHTML = `<h1>Error Loading PWA</h1><p>The configuration for this PWA could not be loaded. It may be invalid or expired.</p>`;
            }
        };
        
        initialize();
    }

    function launchGeneratorMode() {
        // --- START: Interactive Effects ---
        function initializeInteractiveEffects() {
            // Grid background spotlight effect
            document.body.addEventListener('mousemove', e => {
                document.body.style.setProperty('--cursor-x', e.clientX + 'px');
                document.body.style.setProperty('--cursor-y', e.clientY + 'px');
            });
            document.body.addEventListener('mouseenter', () => {
                document.body.style.setProperty('--cursor-opacity', '1');
            });
            document.body.addEventListener('mouseleave', () => {
                document.body.style.setProperty('--cursor-opacity', '0');
            });

            // Interactive border effect for cards
            const interactiveElements = document.querySelectorAll('.interactive-border');
            interactiveElements.forEach(el => {
                el.addEventListener('mousemove', e => {
                    const rect = el.getBoundingClientRect();
                    el.style.setProperty('--x', e.clientX - rect.left + 'px');
                    el.style.setProperty('--y', e.clientY - rect.top + 'px');
                });
                el.addEventListener('mouseenter', () => {
                    el.style.setProperty('--opacity', '1');
                });
                el.addEventListener('mouseleave', () => {
                    el.style.setProperty('--opacity', '0');
                });
            });
        }
        initializeInteractiveEffects();
        // --- END: Interactive Effects ---

        const pwaForm = getEl('#pwa-form');
        const appNameInput = getEl('#appName');
        const iconColorInput = getEl('#iconColor');
        const iconPreview = getEl('#iconPreview');
        const websiteUrlInput = getEl('#websiteUrl-input');
        const shortNameInput = getEl('#shortName');
        const descriptionInput = getEl('#description');
        const themeColorInput = getEl('#themeColor');
        const backgroundColorInput = getEl('#backgroundColor');
        const displayModeInput = getEl('#displayMode');
        const shareContainer = getEl('#share-container');
        const themeSwitcher = getEl('#theme-switcher');
        const settingsToggle = getEl('#settings-toggle');
        const settingsContent = getEl('#settings-content');

        const savePreference = (key, value) => { try { localStorage.setItem(key, value); } catch (e) { console.error(e); } };
        const getPreference = (key) => { try { return localStorage.getItem(key); } catch (e) { return null; } };

        function applyTheme(theme) {
            document.body.classList.toggle('light-theme', theme === 'light');
        }

        let currentTheme = getPreference('theme') || 'dark';
        applyTheme(currentTheme);

        if (themeSwitcher) {
            themeSwitcher.onclick = () => {
                currentTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
                savePreference('theme', currentTheme);
                applyTheme(currentTheme);
            };
        }

        if (settingsToggle) {
            settingsToggle.addEventListener('click', () => {
                settingsToggle.classList.toggle('open');
                if (settingsContent) {
                    settingsContent.classList.toggle('hidden');
                    settingsContent.classList.toggle('visible');
                }
            });
        }
        
        function generateIcon(letter, bgColor) {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, 512, 512);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 280px "Helvetica Neue", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(letter.toUpperCase(), 256, 256);
            return canvas.toDataURL('image/png');
        }

        function generateAndDisplayIcon() {
            if (!appNameInput || !iconColorInput || !iconPreview) return;
            const appName = appNameInput.value || 'A';
            const firstLetter = appName.trim().charAt(0) || 'A';
            const iconBgColor = iconColorInput.value;
            const iconDataUrl = generateIcon(firstLetter, iconBgColor);
            iconPreview.src = iconDataUrl;
        }

        async function handleShareLinkGeneration() {
            const genButton = getEl('#generate-link-btn');
            if (genButton) {
                genButton.disabled = true;
                genButton.classList.add('loading');
            }
            try {
                const config = {
                    url: websiteUrlInput.value,
                    name: appNameInput.value,
                    s_name: shortNameInput.value || appNameInput.value,
                    desc: descriptionInput.value,
                    disp: displayModeInput.value,
                    bg: backgroundColorInput.value,
                    th: themeColorInput.value,
                    iconColor: iconColorInput.value
                };
                const response = await fetch('/api/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(config)
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Failed to create PWA link.');
                const shareUrl = `${window.location.origin}/?id=${result.id}`;
                if (genButton) genButton.remove();
                const shareCardP = shareContainer.querySelector('p');
                if (shareCardP) shareCardP.textContent = 'Your shareable link is ready! Anyone visiting this URL will get your configured PWA.';
                shareContainer.querySelector('.share-card').innerHTML += `<div class="share-link-result"><input type="text" readonly id="share-url-input" value="${shareUrl}"><button class="copy-link-btn" id="copy-link-btn">Copy</button></div>`;
                const copyBtn = getEl('#copy-link-btn');
                if (copyBtn) copyBtn.onclick = () => {
                    const shareInput = getEl('#share-url-input');
                    if (shareInput) shareInput.select();
                    navigator.clipboard.writeText(shareUrl);
                };
            } catch (error) {
                console.error("Error generating share link:", error);
                if (genButton) {
                    genButton.disabled = false;
                    genButton.classList.remove('loading');
                }
            }
        }

        if (pwaForm) {
            pwaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!websiteUrlInput.value || !appNameInput.value) return;
                if (shareContainer) {
                    shareContainer.classList.remove('hidden');
                    shareContainer.innerHTML = `<div class="share-card interactive-border"><h3><i class="fa-solid fa-wand-magic-sparkles"></i> Share Your PWA</h3><p>Generate a permanent link to share this configured PWA with anyone.</p><button class="generate-link-btn" id="generate-link-btn"><i class="fa-solid fa-share-nodes"></i> Generate Link</button></div>`;
                    const genButton = getEl('#generate-link-btn');
                    if (genButton) genButton.onclick = handleShareLinkGeneration;
                    // Re-initialize interactive border for the newly created share card
                    initializeInteractiveEffects();
                }
            });
        }
        
        if (appNameInput) appNameInput.addEventListener('input', generateAndDisplayIcon);
        if (iconColorInput) iconColorInput.addEventListener('input', generateAndDisplayIcon);
        generateAndDisplayIcon();

        function updateColorUI(input, preview, valueSpan) {
            if (!input || !preview || !valueSpan) return;
            const color = input.value.toUpperCase();
            preview.style.backgroundColor = color;
            valueSpan.textContent = color;
        }

        const colorPickerPopup = document.createElement('div');
        colorPickerPopup.className = 'color-picker-popup';
        colorPickerPopup.innerHTML = `<div class="color-picker-sv-panel"><div class="color-picker-thumb"></div></div><input type="range" min="0" max="360" value="0" class="color-picker-hue-slider">`;
        document.body.appendChild(colorPickerPopup);

        const svPanel = colorPickerPopup.querySelector('.color-picker-sv-panel');
        const thumb = colorPickerPopup.querySelector('.color-picker-thumb');
        const hueSlider = colorPickerPopup.querySelector('.color-picker-hue-slider');

        let activeColorTarget = null;
        let pickerState = { h: 0, s: 1, v: 1 };

        const hsvToRgb = (h, s, v) => { let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0); return [f(5) * 255, f(3) * 255, f(1) * 255]; };
        const rgbToHex = (r, g, b) => "#" + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('').toUpperCase();
        const hexToRgb = (hex) => { let r = 0, g = 0, b = 0; if (hex.length == 4) { r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16); } else if (hex.length == 7) { r = parseInt(hex[1] + hex[2], 16); g = parseInt(hex[3] + hex[4], 16); b = parseInt(hex[5] + hex[6], 16); } return [r, g, b]; };
        const rgbToHsv = (r, g, b) => { r /= 255; g /= 255; b /= 255; let max = Math.max(r, g, b), min = Math.min(r, g, b), h, s, v = max, d = max - min; s = max == 0 ? 0 : d / max; if (max == min) { h = 0; } else { switch (max) { case r: h = (g - b) / d + (g < b ? 6 : 0); break; case g: h = (b - r) / d + 2; break; case b: h = (r - g) / d + 4; break; } h /= 6; } return [h * 360, s, v]; };

        function updatePickerColor() {
            if (!activeColorTarget) return;
            const [r, g, b] = hsvToRgb(pickerState.h, pickerState.s, pickerState.v);
            activeColorTarget.value = rgbToHex(r, g, b);
            activeColorTarget.dispatchEvent(new Event('input'));
        }

        function updateSvPanelBackground() {
            const [r, g, b] = hsvToRgb(pickerState.h, 1, 1);
            svPanel.style.backgroundColor = `rgb(${r},${g},${b})`;
        }
        
        // --- START: MODIFIED/FIXED FUNCTION ---
        function openColorPicker(input) {
            activeColorTarget = input;
            const wrapper = input.closest('.color-picker-wrapper');
            const rect = wrapper.getBoundingClientRect();
            
            const [r, g, b] = hexToRgb(input.value);
            const [h, s, v] = rgbToHsv(r, g, b);
            pickerState = { h, s, v };
            
            hueSlider.value = pickerState.h;
            updateSvPanelBackground();

            // Make popup visible off-screen to calculate its dimensions
            colorPickerPopup.style.visibility = 'hidden';
            colorPickerPopup.classList.add('visible');
            const popupRect = colorPickerPopup.getBoundingClientRect();
            
            // Now calculate the correct position relative to the viewport
            let top = rect.bottom + 8;
            let left = rect.left;

            // Adjust if it overflows the viewport
            if (top + popupRect.height > window.innerHeight) {
                top = rect.top - popupRect.height - 8;
            }
            if (left + popupRect.width > window.innerWidth) {
                left = rect.right - popupRect.width;
            }
            // Ensure it's not off-screen
            if (top < 8) top = 8;
            if (left < 8) left = 8;
            
            // Apply position and make it visible
            colorPickerPopup.style.top = `${top}px`;
            colorPickerPopup.style.left = `${left}px`;
            colorPickerPopup.style.visibility = 'visible';
            
            const svRect = svPanel.getBoundingClientRect();
            thumb.style.left = `${pickerState.s * svRect.width}px`;
            thumb.style.top = `${(1 - pickerState.v) * svRect.height}px`;
        }
        // --- END: MODIFIED/FIXED FUNCTION ---

        svPanel.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            const onMouseMove = (moveEvent) => {
                const rect = svPanel.getBoundingClientRect();
                let x = Math.max(0, Math.min(rect.width, moveEvent.clientX - rect.left));
                let y = Math.max(0, Math.min(rect.height, moveEvent.clientY - rect.top));
                thumb.style.left = `${x}px`;
                thumb.style.top = `${y}px`;
                pickerState.s = x / rect.width;
                pickerState.v = 1 - (y / rect.height);
                updatePickerColor();
            };
            onMouseMove(e);
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', () => window.removeEventListener('mousemove', onMouseMove), { once: true });
        });

        hueSlider.addEventListener('input', () => {
            pickerState.h = hueSlider.value;
            updateSvPanelBackground();
            updatePickerColor();
        });

        document.addEventListener('click', (e) => {
            if (colorPickerPopup.classList.contains('visible') && !colorPickerPopup.contains(e.target) && !e.target.closest('.color-picker-wrapper')) {
                colorPickerPopup.classList.remove('visible');
                activeColorTarget = null;
            }
        });

        [themeColorInput, backgroundColorInput, iconColorInput].forEach(input => {
            if (!input) return;
            const wrapper = input.closest('.color-picker-wrapper');
            const preview = wrapper.querySelector('.color-preview-swatch');
            const valueSpan = wrapper.querySelector('.color-value');
            
            updateColorUI(input, preview, valueSpan);
            input.addEventListener('input', () => updateColorUI(input, preview, valueSpan));
            
            if (input === iconColorInput) {
                input.addEventListener('input', generateAndDisplayIcon);
            }

            if (wrapper) wrapper.addEventListener('click', (e) => {
                if (colorPickerPopup.classList.contains('visible') && activeColorTarget === input) {
                    colorPickerPopup.classList.remove('visible');
                    activeColorTarget = null;
                } else {
                    openColorPicker(input);
                }
            });
        });
    }

    const params = new URLSearchParams(window.location.search);
    const pwaId = params.get('id');
    
    registerServiceWorker();

    if (pwaId) {
        launchPwaMode(pwaId);
    } else {
        launchGeneratorMode();
    }
});