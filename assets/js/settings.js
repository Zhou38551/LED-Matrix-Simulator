// settings-v104.js — grouped settings panel for LED Matrix Simulator v1.0.4-beta
(() => {
    const STORAGE_KEY = 'ledMatrixSettingsV104';
    const REGION_KEY = 'ledMatrixRegion';
    const CONTROLLER_KEY = '__ledMatrixSettingsV104Controller';
    const defaults = Object.freeze({ brightness: 100, grid: true, beadBorder: true, safeMargin: 0, exportFormat: 'png', frameRate: 30 });
    const regionLanguage = { 'china-mainland': 'zh-CN', 'china-hmt': 'zh-TW', uk: 'en', usa: 'en' };
    const styleText = `
      .v104-modal{display:none;position:fixed;inset:0;z-index:1100;padding:16px;background:rgba(0,0,0,.76);align-items:center;justify-content:center}
      .v104-modal.open{display:flex}.v104-box{width:min(920px,100%);max-height:min(90vh,900px);overflow:auto;background:var(--surface,#15152a);color:var(--text,#e8e8f0);border:1px solid var(--border,#2a2a44);box-shadow:0 18px 60px #000b;padding:20px}
      .v104-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid var(--border,#2a2a44);padding-bottom:12px;margin-bottom:12px}.v104-heading h2{font-size:1.05rem}
      .v104-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 14px}.v104-tab{border:1px solid var(--border,#2a2a44);background:transparent;color:var(--text,#e8e8f0);padding:8px 12px;cursor:pointer;font:inherit}.v104-tab[aria-selected="true"]{border-color:#ff4a4a;background:#ff4a4a22;color:#ff8c3a}
      .v104-modal .control-panel{padding:0;border:0;box-shadow:none;background:transparent;gap:0}.v104-modal .control-section{padding:12px 0;border-bottom:1px solid rgba(255,255,255,.09)}.v104-modal .control-section[hidden]{display:none!important}
      .v104-modal .section-title{font-size:.75rem;color:#d0d0e0}.v104-extra{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px}.v104-extra .control-group{min-width:150px}.v104-extra input[type=checkbox]{accent-color:#ff4a4a;width:16px;height:16px}.v104-extra select,.v104-extra input[type=range]{width:100%}
      .v104-region{max-width:320px;margin-top:12px}.v104-about{line-height:1.7;color:var(--text-secondary,#999)}.v104-about a{color:#ff8c3a}.v104-actions{display:flex;justify-content:flex-end;gap:8px;padding-top:14px}.v104-modal .template-item{padding:6px 8px;cursor:pointer;background:var(--input-bg);margin:4px 0}
      body.modal-open{overflow:hidden}@media(max-width:520px){.v104-box{padding:14px}.v104-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.v104-tab{padding:8px 5px}}
    `;

    const loadPreferences = () => {
        try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
        catch (_) { return { ...defaults }; }
    };
    const savePreferences = state => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
        catch (error) { console.warn('[settings v1.0.4-beta] Could not save preferences:', error); }
    };
    const init = () => {
        if (window[CONTROLLER_KEY]) window[CONTROLLER_KEY].destroy();
        const openButtonOriginal = document.getElementById('btnSettings') || document.getElementById('btnOpenSettings');
        const oldModal = document.getElementById('settingModal');
        if (!openButtonOriginal) return;

        // Replacing nodes drops legacy anonymous click listeners that cannot be removed by name.
        const openButton = openButtonOriginal.cloneNode(true);
        openButtonOriginal.replaceWith(openButton);
        let regionSelect = oldModal && oldModal.querySelector('#regionSelect');
        const oldModalParent = oldModal && oldModal.parentNode;
        const modal = document.createElement('div');
        modal.id = 'settingModal';
        modal.className = 'v104-modal setting-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'settingTitle');
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = `<div class="v104-box setting-box"><div class="v104-heading"><h2 id="settingTitle">Settings · v1.0.4-beta</h2><button class="modal-close" id="btnCloseSettings" type="button" aria-label="Close settings">×</button></div><nav class="v104-tabs" role="tablist" aria-label="Settings groups"></nav><div class="v104-content"></div><div class="v104-actions"><button class="btn btn-outline" id="btnCancelSettings" type="button">Close</button></div></div>`;
        if (oldModalParent) oldModal.replaceWith(modal);
        else document.body.appendChild(modal);

        const style = document.createElement('style'); style.id = 'settings-v104-style'; style.textContent = styleText;
        document.head.appendChild(style);
        const controls = document.querySelector('.control-panel');
        const content = modal.querySelector('.v104-content');
        const tabs = modal.querySelector('.v104-tabs');
        const closeButton = modal.querySelector('#btnCloseSettings');
        if (controls) content.appendChild(controls);

        const allSections = controls ? Array.from(controls.querySelectorAll(':scope > .control-section')) : [];
        const sectionFor = selector => allSections.find(section => section.querySelector(selector));
        const groups = [
            { id: 'basic', label: 'Basic settings', selectors: ['#sectionPanel'], description: 'Region and panel size' },
            { id: 'display', label: 'Simulator display', selectors: ['#sectionDisplay', '#sectionStyle', '#sectionColor'], description: 'Display mode, pixel style and color' },
            { id: 'glyph', label: 'Glyph rendering', selectors: ['#sectionFont'], description: 'Text, font and glyph sampling' },
            { id: 'export', label: 'Export & recording', selectors: ['#sectionExport'], description: 'Image export and video recording' },
            { id: 'about', label: 'About', selectors: [], description: 'Project information' },
        ];
        const groupSections = {};
        for (const group of groups) {
            groupSections[group.id] = group.selectors.map(sectionFor).filter(Boolean);
            const tab = document.createElement('button');
            tab.type = 'button'; tab.className = 'v104-tab'; tab.role = 'tab';
            tab.id = `v104-tab-${group.id}`; tab.dataset.group = group.id; tab.textContent = group.label;
            tab.setAttribute('aria-controls', `v104-panel-${group.id}`);
            tabs.appendChild(tab);
        }
        const aboutSection = document.createElement('section');
        aboutSection.className = 'control-section v104-about'; aboutSection.dataset.v104Group = 'about';
        aboutSection.innerHTML = `<div class="section-title">About this project</div><p>LED Matrix Simulator · v1.0.4-beta</p><p>Open-source LED dot-matrix sign simulator.</p><p><a href="https://github.com/Zhou38551/LED-Matrix-Simulator" target="_blank" rel="noopener noreferrer">View the project on GitHub</a></p><button class="btn btn-outline" id="v104-reset" type="button">Reset all settings</button>`;
        if (controls) controls.appendChild(aboutSection);
        groupSections.about = [aboutSection];

        // Keep the original .control-panel and its first .control-section intact for main.js selectors.
        allSections.forEach(section => {
            const group = groups.find(item => item.selectors.some(selector => section.querySelector(selector)));
            section.dataset.v104Group = group ? group.id : 'basic';
            const title = section.querySelector('.section-title');
            if (title) title.dataset.originalTitle = title.textContent;
        });
        if (regionSelect) {
            const label = oldModal.querySelector('label[for="regionSelect"]');
            const regionWrap = document.createElement('div'); regionWrap.className = 'control-group v104-region';
            regionWrap.innerHTML = '<label for="regionSelect">Region</label>';
            regionWrap.appendChild(regionSelect);
            const basic = sectionFor('#sectionPanel');
            if (basic) basic.appendChild(regionWrap);
            if (label) label.remove();
        } else {
            const basic = sectionFor('#sectionPanel');
            if (basic) {
                const regionWrap = document.createElement('div'); regionWrap.className = 'control-group v104-region';
                regionWrap.innerHTML = '<label for="v104-region">Region</label><select id="v104-region"><option value="china-mainland">China (Mainland)</option><option value="china-hmt">China (Hong Kong, Macao, Taiwan)</option><option value="uk">United Kingdom</option><option value="usa">United States</option></select>';
                basic.appendChild(regionWrap); regionSelect = regionWrap.querySelector('select');
            }
        }
        if (regionSelect) {
            Array.from(regionSelect.options).forEach(option => { if (option.value === 'uk') option.textContent = 'United Kingdom'; if (option.value === 'usa') option.textContent = 'United States'; });
            regionSelect.setAttribute('aria-label', 'Region');
        }

        const addControl = (section, markup) => {
            if (!section) return null;
            let row = section.querySelector('.v104-extra');
            if (!row) { row = document.createElement('div'); row.className = 'v104-extra'; section.appendChild(row); }
            row.insertAdjacentHTML('beforeend', markup);
            return row.lastElementChild;
        };
        const displaySection = sectionFor('#sectionDisplay') || sectionFor('#sectionStyle');
        const glyphSection = sectionFor('#sectionFont');
        const exportSection = sectionFor('#sectionExport');
        const brightnessGroup = addControl(displaySection, '<div class="control-group"><label for="v104-brightness">Brightness <output id="v104-brightness-value">100%</output></label><input id="v104-brightness" type="range" min="25" max="150" step="5" value="100"></div>');
        const gridGroup = addControl(displaySection, '<div class="control-group"><label for="v104-grid">Grid background</label><input id="v104-grid" type="checkbox" checked></div>');
        const borderGroup = addControl(displaySection, '<div class="control-group"><label for="v104-border">LED bead borders</label><input id="v104-border" type="checkbox" checked></div>');
        const marginGroup = addControl(glyphSection, '<div class="control-group"><label for="v104-margin">Safe margin <output id="v104-margin-value">0%</output></label><input id="v104-margin" type="range" min="0" max="20" step="1" value="0"></div>');
        const formatGroup = addControl(exportSection, '<div class="control-group"><label for="v104-format">Default image format</label><select id="v104-format"><option value="png">PNG</option><option value="jpeg">JPEG</option><option value="webp">WebP</option></select></div>');
        const fpsGroup = addControl(exportSection, '<div class="control-group"><label for="v104-fps">Recording frame rate</label><select id="v104-fps"><option value="15">15 fps</option><option value="24">24 fps</option><option value="30">30 fps</option><option value="60">60 fps</option></select></div>');
        void brightnessGroup; void gridGroup; void borderGroup; void marginGroup; void formatGroup; void fpsGroup;

        let preferences = { ...defaults, ...loadPreferences() };
        const input = id => modal.querySelector(`#${id}`);
        const applyPreferencesToForm = () => {
            input('v104-brightness').value = preferences.brightness;
            input('v104-brightness-value').textContent = `${preferences.brightness}%`;
            input('v104-grid').checked = !!preferences.grid;
            input('v104-border').checked = !!preferences.beadBorder;
            input('v104-margin').value = preferences.safeMargin;
            input('v104-margin-value').textContent = `${preferences.safeMargin}%`;
            input('v104-format').value = preferences.exportFormat;
            input('v104-fps').value = String(preferences.frameRate);
        };
        const applyLanguage = region => {
            const language = regionLanguage[region] || 'en';
            document.documentElement.lang = language;
            document.title = language === 'en' ? 'LED Matrix Simulator' : language === 'zh-TW' ? 'LED 點陣 · 開源模組化版' : 'LED点阵 · 开源模块化版';
            const button = document.getElementById('btnSettings');
            if (button) button.textContent = language === 'en' ? '⚙ Settings' : language === 'zh-TW' ? '⚙ 設定' : '⚙ 设置';
        };
        const persistRegion = () => {
            if (!regionSelect) return;
            try { localStorage.setItem(REGION_KEY, regionSelect.value); } catch (_) { /* storage may be disabled */ }
            applyLanguage(regionSelect.value);
        };
        try {
            const savedRegion = localStorage.getItem(REGION_KEY);
            if (savedRegion && regionSelect && regionLanguage[savedRegion]) regionSelect.value = savedRegion;
            else if (regionSelect) regionSelect.value = 'uk';
        } catch (_) { if (regionSelect) regionSelect.value = 'uk'; }
        persistRegion();
        applyPreferencesToForm();

        // Settings state is isolated from main.js; only wrap the rendering/export entry points.
        const originalDraw = typeof Renderer !== 'undefined' ? Renderer.draw : null;
        if (originalDraw && !Renderer.__v104DrawWrapped) {
            Renderer.draw = function(...args) {
                const ctx = Renderer.ctx;
                const originalFillRect = ctx.fillRect;
                ctx.fillRect = function(x, y, width, height) {
                    const color = String(ctx.fillStyle).toLowerCase().replace(/\s/g, '');
                    if (!preferences.grid && (color === '#111111' || color === 'rgb(17,17,17)')) return;
                    if (!preferences.beadBorder && width === AppState.SCALE - 1 && height === AppState.SCALE - 1) { width++; height++; }
                    if (color.startsWith('rgb(') && color !== 'rgb(17,17,17)' && preferences.brightness !== 100) {
                        const channels = color.match(/[\d.]+/g);
                        if (channels && channels.length >= 3) {
                            const factor = Number(preferences.brightness) / 100;
                            ctx.fillStyle = `rgb(${Math.min(255, Math.round(+channels[0] * factor))}, ${Math.min(255, Math.round(+channels[1] * factor))}, ${Math.min(255, Math.round(+channels[2] * factor))})`;
                        }
                    }
                    return originalFillRect.call(ctx, x, y, width, height);
                };
                try { return originalDraw.apply(Renderer, args); }
                finally { ctx.fillRect = originalFillRect; }
            };
            Renderer.__v104DrawWrapped = true;
        }
        const originalBuild = typeof Renderer !== 'undefined' ? Renderer.buildBitmap : null;
        if (originalBuild && !Renderer.__v104MarginWrapped) {
            Renderer.buildBitmap = function(...args) {
                const scale = AppState.fontSizeScale;
                AppState.fontSizeScale = scale * (1 - Number(preferences.safeMargin) / 100);
                try { return originalBuild.apply(Renderer, args); }
                finally { AppState.fontSizeScale = scale; }
            };
            Renderer.__v104MarginWrapped = true;
        }
        if (typeof Renderer !== 'undefined' && Renderer.canvas && !Renderer.canvas.__v104CaptureWrapped) {
            const captureStream = Renderer.canvas.captureStream.bind(Renderer.canvas);
            Renderer.canvas.captureStream = () => captureStream(Number(preferences.frameRate) || 30);
            Renderer.canvas.__v104CaptureWrapped = true;
        }
        if (typeof Exporter !== 'undefined' && !Exporter.__v104ImageWrapped) {
            const saveImage = Exporter.saveImage;
            Exporter.saveImage = () => {
                const format = preferences.exportFormat;
                const mime = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
                const link = document.createElement('a');
                link.download = `led_matrix_${Date.now()}.${format === 'jpeg' ? 'jpg' : format}`;
                link.href = Renderer.canvas.toDataURL(mime, format === 'jpeg' ? 0.92 : undefined);
                link.click();
                if (typeof UI !== 'undefined') UI.showToast(`Image saved as ${format.toUpperCase()}`);
            };
            Exporter.__v104ImageWrapped = true;
            void saveImage;
        }

        const refresh = () => { if (typeof Renderer !== 'undefined') Renderer.refresh(); };
        const onPreferenceChange = event => {
            const target = event.currentTarget;
            if (target.id === 'v104-brightness') preferences.brightness = Number(target.value);
            if (target.id === 'v104-grid') preferences.grid = target.checked;
            if (target.id === 'v104-border') preferences.beadBorder = target.checked;
            if (target.id === 'v104-margin') preferences.safeMargin = Number(target.value);
            if (target.id === 'v104-format') preferences.exportFormat = target.value;
            if (target.id === 'v104-fps') preferences.frameRate = Number(target.value);
            input('v104-brightness-value').textContent = `${preferences.brightness}%`;
            input('v104-margin-value').textContent = `${preferences.safeMargin}%`;
            savePreferences(preferences);
            if (target.id === 'v104-margin') refresh();
            else if (typeof Renderer !== 'undefined') Renderer.draw();
        };
        ['v104-brightness', 'v104-grid', 'v104-border', 'v104-margin', 'v104-format', 'v104-fps'].forEach(id => {
            input(id).addEventListener(id.includes('grid') || id.includes('border') ? 'change' : id.includes('format') || id.includes('fps') ? 'change' : 'input', onPreferenceChange);
        });

        const activateGroup = id => {
            groups.forEach(group => {
                const active = group.id === id;
                const tab = tabs.querySelector(`[data-group="${group.id}"]`);
                tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
                groupSections[group.id].forEach(section => { section.hidden = !active; });
            });
        };
        tabs.addEventListener('click', event => {
            const tab = event.target.closest('[data-group]');
            if (tab) activateGroup(tab.dataset.group);
        });
        tabs.addEventListener('keydown', event => {
            if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
            event.preventDefault();
            const current = groups.findIndex(group => tabs.querySelector(`[data-group="${group.id}"]`) === document.activeElement);
            const next = (current + (event.key === 'ArrowRight' ? 1 : -1) + groups.length) % groups.length;
            const tab = tabs.querySelector(`[data-group="${groups[next].id}"]`); tab.focus(); activateGroup(groups[next].id);
        });
        activateGroup('basic');

        let isOpen = false;
        const open = () => { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('modal-open'); isOpen = true; tabs.querySelector('[data-group="basic"]').focus(); };
        const close = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.classList.remove('modal-open'); isOpen = false; openButton.focus(); };
        openButton.addEventListener('click', open);
        closeButton.addEventListener('click', close);
        modal.querySelector('#btnCancelSettings').addEventListener('click', close);
        modal.addEventListener('click', event => { if (event.target === modal) close(); });
        const onKey = event => { if (event.key === 'Escape' && isOpen) close(); };
        document.addEventListener('keydown', onKey);
        if (regionSelect) regionSelect.addEventListener('change', persistRegion);

        const reset = () => {
            const confirmed = window.confirm('Reset all settings to their defaults?');
            if (!confirmed || !window.confirm('This will reset region and display preferences. Continue?')) return;
            preferences = { ...defaults }; savePreferences(preferences); applyPreferencesToForm();
            if (regionSelect) { regionSelect.value = 'uk'; persistRegion(); }
            const sizes = document.querySelectorAll('.control-section:first-child .btn[data-cols]');
            const defaultSize = Array.from(sizes).find(button => button.dataset.cols === '320' && button.dataset.rows === '40');
            if (defaultSize) defaultSize.click();
            const mode = document.getElementById('displayMode'); if (mode) { mode.value = 'scroll'; mode.dispatchEvent(new Event('change', { bubbles: true })); }
            const speed = document.getElementById('scrollSpeed'); if (speed) { speed.value = '40'; speed.dispatchEvent(new Event('input', { bubbles: true })); }
            const scale = document.getElementById('fontSizeScale'); if (scale) { scale.value = '100'; scale.dispatchEvent(new Event('input', { bubbles: true })); }
            const threshold = document.getElementById('threshold'); if (threshold) { threshold.value = '0.5'; threshold.dispatchEvent(new Event('input', { bubbles: true })); }
            refresh();
        };
        aboutSection.querySelector('#v104-reset').addEventListener('click', reset);
        window[CONTROLLER_KEY] = { destroy() { openButton.removeEventListener('click', open); closeButton.removeEventListener('click', close); document.removeEventListener('keydown', onKey); } };
        // If another old initializer set a first-visit fallback, make UK the persisted initial region.
        try { if (!localStorage.getItem(REGION_KEY)) localStorage.setItem(REGION_KEY, 'uk'); } catch (_) { /* ignore */ }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
