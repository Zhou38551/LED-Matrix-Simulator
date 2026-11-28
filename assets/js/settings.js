// settings.js — settings dialog and persistent controls for LED Matrix Simulator v1.0.4-beta
(() => {
    'use strict';

    const STORAGE_KEY = 'ledMatrixSettingsV104';
    const REGION_KEY = 'ledMatrixRegion';
    const CONTROLLER_KEY = '__ledMatrixSettingsV104Controller';
    const defaults = Object.freeze({ brightness: 100, grid: true, beadBorder: true, safeMargin: 0, exportFormat: 'png', frameRate: 30 });
    const regionLanguage = Object.freeze({ 'china-mainland': 'zh-CN', 'china-hmt': 'zh-TW', uk: 'en', usa: 'en' });
    const groups = [
        { id: 'basic', label: 'Basic settings' },
        { id: 'about', label: 'About' }
    ];

    const translations = {
        en: {
            title: 'LED Matrix Simulator', header: 'LED Matrix · Multi-size', subtitle: 'Adaptive long text · centered glyphs · seamless looping', settings: '⚙ Settings',
            live: 'Simulator controls', total: 'Total:', pixels: 'pixels', scrolling: '◀ Scrolling', static: '⏸ Static display',
            panel: '📏 Panel size', standard: '1280 × 160 (standard)', hzk: '1536 × 64 · HZK16', glyphText: '🔤 Glyph rendering & text',
            importFont: 'Import font (.ttf / .otf / .woff)', fontLoaded: 'Font loaded', placeholder: 'Enter text to display...', presetChinese: 'Next stop: Welcome aboard',
            display: '📺 Simulator display', mode: 'Display mode', staticMode: 'Static', scrollMode: 'Scrolling', speed: 'Scroll speed', glyph: '🔤 Glyph rendering',
            glyphSize: 'Glyph size', threshold: 'Brightness threshold', color: '🎨 LED color', customColor: 'Custom color', presets: 'Presets', export: '🎬 Export & recording',
            replay: '🔄 Replay', saveImage: '📷 Save image', record: '🔴 Record video', region: 'Region', close: 'Close', done: 'Done', about: 'About',
            aboutTitle: 'About this project', aboutText: 'Open-source LED dot-matrix sign simulator.', viewProject: 'View the project on GitHub', reset: 'Reset all settings',
            brightness: 'Brightness', grid: 'Grid background', bead: 'LED bead borders', safeMargin: 'Safe margin', imageFormat: 'Default image format', frameRate: 'Recording frame rate'
        },
        zh: {
            title: 'LED点阵 · 开源模块化版', header: 'LED 点阵 · 多比例', subtitle: '长文本自适应 · 物理级边界居中 · 完美循环', settings: '⚙ 设置',
            live: '模拟器控制', total: '总计:', pixels: '像素', scrolling: '◀ 自动滚动中', static: '⏸ 静态显示',
            panel: '📏 屏幕比例', standard: '1280 × 160（标准）', hzk: '1536 × 64 · HZK16', glyphText: '🔤 字体与文字',
            importFont: '导入字体（.ttf / .otf / .woff）', fontLoaded: '字体已加载', placeholder: '输入要显示的文字...', presetChinese: '下一站：欢迎乘坐',
            display: '📺 模拟器显示', mode: '显示模式', staticMode: '静态显示', scrollMode: '自动滚动', speed: '滚动速度', glyph: '🔤 字模渲染',
            glyphSize: '字形大小', threshold: '亮度阈值', color: '🎨 LED 颜色', customColor: '自定义颜色', presets: '预设颜色', export: '🎬 导出与录制',
            replay: '🔄 重新播放', saveImage: '📷 保存图片', record: '🔴 录制视频', region: '地区', close: '关闭', done: '完成', about: '关于',
            aboutTitle: '关于本项目', aboutText: '开源 LED 点阵屏模拟器。', viewProject: '在 GitHub 上查看项目', reset: '重置全部设置',
            brightness: '亮度', grid: '网格背景', bead: '灯珠边框', safeMargin: '安全边距', imageFormat: '默认图片格式', frameRate: '录制帧率'
        },
        tw: {
            title: 'LED 點陣 · 開源模組化版', header: 'LED 點陣 · 多比例', subtitle: '長文字自適應 · 邊界置中 · 完美循環', settings: '⚙ 設定',
            live: '模擬器控制', total: '總計:', pixels: '像素', scrolling: '◀ 自動滾動中', static: '⏸ 靜態顯示',
            panel: '📏 螢幕比例', standard: '1280 × 160（標準）', hzk: '1536 × 64 · HZK16', glyphText: '🔤 字體與文字',
            importFont: '匯入字體（.ttf / .otf / .woff）', fontLoaded: '字體已載入', placeholder: '輸入要顯示的文字...', presetChinese: '下一站：歡迎乘坐',
            display: '📺 模擬器顯示', mode: '顯示模式', staticMode: '靜態顯示', scrollMode: '自動滾動', speed: '滾動速度', glyph: '🔤 字模渲染',
            glyphSize: '字形大小', threshold: '亮度閾值', color: '🎨 LED 顏色', customColor: '自訂顏色', presets: '預設顏色', export: '🎬 匯出與錄製',
            replay: '🔄 重新播放', saveImage: '📷 儲存圖片', record: '🔴 錄製影片', region: '地區', close: '關閉', done: '完成', about: '關於',
            aboutTitle: '關於本專案', aboutText: '開源 LED 點陣屏模擬器。', viewProject: '在 GitHub 上查看專案', reset: '重設全部設定',
            brightness: '亮度', grid: '網格背景', bead: '燈珠邊框', safeMargin: '安全邊距', imageFormat: '預設圖片格式', frameRate: '錄影影格率'
        }
    };

    const styleText = `
      .v104-modal{display:none;position:fixed;inset:0;z-index:1100;padding:16px;background:rgba(0,0,0,.76);align-items:center;justify-content:center}
      .v104-modal.open{display:flex}.v104-box{width:min(720px,100%);max-height:min(90vh,900px);overflow:auto;background:var(--surface,#15152a);color:var(--text,#e8e8f0);border:1px solid var(--border,#2a2a44);box-shadow:0 18px 60px #000b;padding:20px}
      .v104-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid var(--border,#2a2a44);padding-bottom:12px;margin-bottom:12px}.v104-heading h2{font-size:1.05rem}
      .v104-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 14px}.v104-tab{border:1px solid var(--border,#2a2a44);background:transparent;color:var(--text,#e8e8f0);padding:8px 12px;cursor:pointer;font:inherit}.v104-tab[aria-selected="true"]{border-color:#ff4a4a;background:#ff4a4a22;color:#ff8c3a}
      .v104-modal .control-panel{padding:0;border:0;box-shadow:none;background:transparent;gap:0}.v104-modal .control-section{padding:12px 0;border-bottom:1px solid rgba(255,255,255,.09)}.v104-modal .control-section[hidden]{display:none!important}.v104-modal .section-title{font-size:.75rem;color:#d0d0e0}
      .v104-live-panel{gap:0}.v104-live-heading{font-size:.75rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9292a8;padding-bottom:10px}.v104-live-sections{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:0 18px}.v104-live-sections>.control-section{padding:12px 0;border-bottom:1px solid rgba(255,255,255,.08)}
      .v104-extra{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px}.v104-extra .control-group{min-width:150px}.v104-extra input[type=checkbox]{accent-color:#ff4a4a;width:16px;height:16px}.v104-extra select,.v104-extra input[type=range]{width:100%}
      .v104-region{max-width:320px;margin-top:12px}.v104-about{line-height:1.7;color:var(--text-secondary,#999)}.v104-about a{color:#ff8c3a}.v104-actions{display:flex;justify-content:flex-end;gap:8px;padding-top:14px}.v104-modal .setting-box>label{display:block;margin:10px 0 6px;color:var(--text-secondary);font-size:.72rem}.v104-modal select{width:100%}
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
        const originalButton = document.getElementById('btnSettings') || document.getElementById('btnOpenSettings');
        const oldModal = document.getElementById('settingModal');
        const originalControls = document.getElementById('legacyControlPanel');
        const permanentSections = document.getElementById('permanentControlSections');
        if (!originalButton || !oldModal || !originalControls || !permanentSections) return;

        // Drop any legacy anonymous handlers from the old settings trigger.
        const openButton = originalButton.cloneNode(true);
        originalButton.replaceWith(openButton);
        const regionSelect = oldModal.querySelector('#regionSelect');
        const modal = document.createElement('div');
        modal.id = 'settingModal';
        modal.className = 'v104-modal setting-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'settingTitle');
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = `<div class="v104-box setting-box"><div class="v104-heading"><h2 id="settingTitle">Settings · v1.0.4-beta</h2><button class="modal-close" id="btnCloseSettings" type="button" aria-label="Close settings">×</button></div><nav class="v104-tabs" role="tablist" aria-label="Settings groups"></nav><div class="v104-content"></div><div class="v104-actions"><button class="btn btn-outline" id="btnCancelSettings" type="button">Close</button></div></div>`;
        oldModal.replaceWith(modal);
        const style = document.createElement('style');
        style.id = 'settings-v104-style';
        style.textContent = styleText;
        document.head.appendChild(style);

        const sections = Array.from(originalControls.querySelectorAll(':scope > .control-section'));
        const sectionFor = selector => sections.find(section => section.querySelector(selector));
        const basicSection = sectionFor('#sectionPanel');
        const displaySection = sectionFor('#sectionDisplay');
        const styleSection = sectionFor('#sectionStyle');
        const colorSection = sectionFor('#sectionColor');
        const glyphSection = sectionFor('#sectionFont');
        const exportSection = sectionFor('#sectionExport');
        const liveSections = [displaySection, styleSection, colorSection, glyphSection, exportSection].filter(Boolean);
        const modalPanel = document.createElement('div');
        modalPanel.className = 'control-panel';
        const modalContent = modal.querySelector('.v104-content');
        modalContent.appendChild(modalPanel);
        if (basicSection) modalPanel.appendChild(basicSection);
        liveSections.forEach(section => permanentSections.appendChild(section));
        originalControls.remove();

        const tabs = modal.querySelector('.v104-tabs');
        const groupSections = { basic: basicSection ? [basicSection] : [], about: [] };
        groups.forEach(group => {
            const tab = document.createElement('button');
            tab.type = 'button'; tab.className = 'v104-tab'; tab.id = `v104-tab-${group.id}`;
            tab.dataset.group = group.id; tab.setAttribute('role', 'tab'); tab.textContent = group.label;
            tab.setAttribute('aria-controls', `v104-panel-${group.id}`);
            tabs.appendChild(tab);
        });
        const aboutSection = document.createElement('section');
        aboutSection.className = 'control-section v104-about';
        aboutSection.innerHTML = '<div class="section-title" id="aboutTitle">About this project</div><p>LED Matrix Simulator · v1.0.4-beta</p><p id="aboutText">Open-source LED dot-matrix sign simulator.</p><p><a id="aboutLink" href="https://github.com/Zhou38551/LED-Matrix-Simulator" target="_blank" rel="noopener noreferrer">View the project on GitHub</a></p><button class="btn btn-outline" id="v104-reset" type="button">Reset all settings</button>';
        modalPanel.appendChild(aboutSection);
        groupSections.about = [aboutSection];

        // Keep the region selector in Basic settings, inside the dialog.
        if (regionSelect && basicSection) {
            const regionWrap = document.createElement('div');
            regionWrap.className = 'control-group v104-region';
            regionWrap.innerHTML = '<label for="regionSelect" id="regionLabel">Region</label>';
            regionWrap.appendChild(regionSelect);
            basicSection.appendChild(regionWrap);
        }
        if (regionSelect) {
            Array.from(regionSelect.options).forEach(option => {
                if (option.value === 'uk') option.textContent = 'United Kingdom';
                if (option.value === 'usa') option.textContent = 'United States';
            });
            regionSelect.setAttribute('aria-label', 'Region');
        }

        const addControl = (section, markup) => {
            if (!section) return null;
            let row = section.querySelector('.v104-extra');
            if (!row) { row = document.createElement('div'); row.className = 'v104-extra'; section.appendChild(row); }
            row.insertAdjacentHTML('beforeend', markup);
            return row.lastElementChild;
        };
        addControl(displaySection, '<div class="control-group"><label for="v104-brightness"><span data-i18n="brightness">Brightness</span> <output id="v104-brightness-value">100%</output></label><input id="v104-brightness" type="range" min="0" max="150" step="5" value="100"></div>');
        addControl(displaySection, '<div class="control-group"><label for="v104-grid" data-i18n="grid">Grid background</label><input id="v104-grid" type="checkbox" checked></div>');
        addControl(displaySection, '<div class="control-group"><label for="v104-border" data-i18n="bead">LED bead borders</label><input id="v104-border" type="checkbox" checked></div>');
        addControl(glyphSection, '<div class="control-group"><label for="v104-margin"><span data-i18n="safeMargin">Safe margin</span> <output id="v104-margin-value">0%</output></label><input id="v104-margin" type="range" min="0" max="40" step="1" value="0"></div>');
        addControl(exportSection, '<div class="control-group"><label for="v104-format" data-i18n="imageFormat">Default image format</label><select id="v104-format"><option value="png">PNG</option><option value="jpeg">JPEG</option><option value="webp">WebP</option></select></div>');
        addControl(exportSection, '<div class="control-group"><label for="v104-fps" data-i18n="frameRate">Recording frame rate</label><select id="v104-fps"><option value="15">15 fps</option><option value="24">24 fps</option><option value="30">30 fps</option><option value="60">60 fps</option></select></div>');

        let preferences = { ...defaults, ...loadPreferences() };
        const input = id => document.getElementById(id);
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

        let currentLanguage = 'en';
        const applyLanguage = region => {
            const language = regionLanguage[region] || 'en';
            const locale = language === 'zh-TW' ? 'tw' : language === 'zh-CN' ? 'zh' : 'en';
            const words = translations[locale];
            currentLanguage = locale;
            document.documentElement.lang = language;
            document.title = words.title;
            const text = (selector, value) => { const element = document.querySelector(selector); if (element) element.textContent = value; };
            text('.header h1', words.header); text('.header .subtitle', words.subtitle); text('#btnSettings', words.settings);
            text('#liveControlsHeading', words.live); text('#totalLabel', words.total); text('#pixelsLabel', words.pixels);
            text('#sectionPanel', words.panel); text('#sectionFont', words.glyphText); text('#sectionDisplay', words.display);
            text('#sectionStyle', words.glyph); text('#sectionColor', words.color); text('#sectionExport', words.export);
            text('#fontStatus', words.fontLoaded); text('#presetsLabel', words.presets); text('#btnReplay', words.replay);
            text('#btnSaveImg', words.saveImage); text('#btnRecord', words.record); text('#regionLabel', words.region);
            text('#btnCancelSettings', words.close); text('#btnSaveSettings', words.done); text('#aboutTitle', words.aboutTitle);
            text('#aboutText', words.aboutText); text('#aboutLink', words.viewProject); text('#v104-reset', words.reset);
            text('#v104-tab-basic', words.basic || (locale === 'en' ? 'Basic settings' : '基础设置'));
            text('#v104-tab-about', words.about);
            text('.app-footer', `LED Matrix Simulator · v1.0.4-beta · ${locale === 'en' ? 'Open Source' : locale === 'tw' ? '開源專案' : '开源项目'}`);
            const mode = input('displayMode');
            if (mode) Array.from(mode.options).forEach(option => { option.textContent = option.value === 'static' ? words.staticMode : words.scrollMode; });
            const labels = {
                fontUpload: words.importFont, displayMode: words.mode, scrollSpeed: words.speed,
                fontSizeScale: words.glyphSize, threshold: words.threshold, ledColor: words.customColor
            };
            Object.entries(labels).forEach(([id, value]) => {
                const label = document.querySelector(`label[for="${id}"]`);
                if (label) { const strong = label.querySelector('strong'); label.textContent = value; if (strong) label.appendChild(strong); }
            });
            const speedLabel = document.querySelector('label[for="scrollSpeed"]');
            if (speedLabel) speedLabel.innerHTML = `${words.speed} <strong id="speedVal">${window.AppState ? AppState.scrollSpeed : 40}</strong>`;
            const sizeLabel = document.querySelector('label[for="fontSizeScale"]');
            if (sizeLabel) sizeLabel.innerHTML = `${words.glyphSize} <strong id="sizeScaleVal">${window.AppState ? Math.round(AppState.fontSizeScale * 100) : 100}</strong>%`;
            const thresholdLabel = document.querySelector('label[for="threshold"]');
            if (thresholdLabel) thresholdLabel.innerHTML = `${words.threshold} <strong id="thresholdVal">${window.AppState ? AppState.threshold.toFixed(2) : '0.50'}</strong>`;
            const inputText = input('textInput'); if (inputText) inputText.placeholder = words.placeholder;
            const presetButtons = document.querySelectorAll('.preset-text');
            if (presetButtons.length >= 3) presetButtons[2].textContent = words.presetChinese;
            text('#scrollStatus', input('displayMode') && input('displayMode').value === 'static' ? words.static : words.scrolling);
            document.querySelectorAll('[data-i18n]').forEach(element => { const key = element.dataset.i18n; if (words[key]) element.textContent = words[key]; });
            const regionLabel = modal.querySelector('#regionLabel'); if (regionLabel) regionLabel.textContent = words.region;
        };

        const persistRegion = () => {
            if (!regionSelect) return;
            const region = regionLanguage[regionSelect.value] ? regionSelect.value : 'uk';
            regionSelect.value = region;
            try { localStorage.setItem(REGION_KEY, region); } catch (_) { /* local storage may be disabled */ }
            applyLanguage(region);
        };
        try {
            const savedRegion = localStorage.getItem(REGION_KEY);
            regionSelect.value = savedRegion && regionLanguage[savedRegion] ? savedRegion : 'uk';
        } catch (_) { regionSelect.value = 'uk'; }
        persistRegion();
        applyPreferencesToForm();

        // Preserve the existing rendering, brightness, safe-margin, image and video pipelines.
        const originalDraw = window.Renderer && Renderer.draw;
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
        const originalBuild = window.Renderer && Renderer.buildBitmap;
        if (originalBuild && !Renderer.__v104MarginWrapped) {
            Renderer.buildBitmap = function(...args) {
                const scale = AppState.fontSizeScale;
                AppState.fontSizeScale = scale * (1 - Number(preferences.safeMargin) / 100);
                try { return originalBuild.apply(Renderer, args); }
                finally { AppState.fontSizeScale = scale; }
            };
            Renderer.__v104MarginWrapped = true;
        }
        if (window.Renderer && Renderer.canvas && typeof Renderer.canvas.captureStream === 'function' && !Renderer.canvas.__v104CaptureWrapped) {
            const captureStream = Renderer.canvas.captureStream.bind(Renderer.canvas);
            Renderer.canvas.captureStream = () => captureStream(Number(preferences.frameRate) || 30);
            Renderer.canvas.__v104CaptureWrapped = true;
        }
        if (window.Exporter && !Exporter.__v104ImageWrapped) {
            Exporter.saveImage = () => {
                const format = preferences.exportFormat;
                const mime = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
                const link = document.createElement('a');
                link.download = `led_matrix_${Date.now()}.${format === 'jpeg' ? 'jpg' : format}`;
                link.href = Renderer.canvas.toDataURL(mime, format === 'jpeg' ? 0.92 : undefined);
                link.click();
                if (window.UI) UI.showToast(`${currentLanguage === 'en' ? 'Image saved as' : '图片格式'} ${format.toUpperCase()}`);
            };
            Exporter.__v104ImageWrapped = true;
        }

        const refresh = () => { if (window.Renderer) Renderer.refresh(); };
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
            else if (window.Renderer) Renderer.draw();
        };
        ['v104-brightness', 'v104-grid', 'v104-border', 'v104-margin', 'v104-format', 'v104-fps'].forEach(id => {
            input(id).addEventListener(id.includes('grid') || id.includes('border') || id.includes('format') || id.includes('fps') ? 'change' : 'input', onPreferenceChange);
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
        const onKey = event => { if (event.key === 'Escape' && isOpen) close(); };
        openButton.addEventListener('click', open);
        modal.querySelector('#btnCloseSettings').addEventListener('click', close);
        modal.querySelector('#btnCancelSettings').addEventListener('click', close);
        modal.addEventListener('click', event => { if (event.target === modal) close(); });
        document.addEventListener('keydown', onKey);
        regionSelect.addEventListener('change', persistRegion);
        const modeSelect = document.getElementById('displayMode');
        if (modeSelect) modeSelect.addEventListener('change', () => applyLanguage(regionSelect.value));

        const reset = () => {
            const confirmed = window.confirm(currentLanguage === 'en' ? 'Reset all settings to their defaults?' : '确定要将所有设置重置为默认值吗？');
            if (!confirmed || !window.confirm(currentLanguage === 'en' ? 'This will reset region and display preferences. Continue?' : '地区和显示设置也会重置，是否继续？')) return;
            preferences = { ...defaults }; savePreferences(preferences); applyPreferencesToForm();
            regionSelect.value = 'uk'; persistRegion();
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
        window[CONTROLLER_KEY] = { destroy() { openButton.removeEventListener('click', open); document.removeEventListener('keydown', onKey); } };
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
