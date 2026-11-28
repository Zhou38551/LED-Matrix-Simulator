// settings.js — self-contained v1.0.4 grouped settings panel
(() => {
    'use strict';

    const CONTROLLER_KEY = '__ledMatrixSettingsController';
    const STORAGE_KEY = 'ledMatrixSettingsV104';
    const REGION_KEY = 'ledMatrixRegion';
    const defaults = Object.freeze({ brightness: 100, grid: true, beadBorder: true, safeMargin: 0, exportFormat: 'png', frameRate: 30 });
    const regionLanguage = { 'china-mainland': 'zh-CN', 'china-hmt': 'zh-TW', uk: 'en', usa: 'en' };

    // matrix-enhancements.js still contains a legacy dynamic loader. Block only that
    // obsolete script so this file remains the single source of settings UI and state.
    if (document.head && !document.head.__settingsV104AppendGuard) {
        const originalAppendChild = document.head.appendChild;
        document.head.appendChild = function(node) {
            if (node && node.tagName === 'SCRIPT' && /(?:^|\/)settings-v104\.js(?:[?#].*)?$/.test(node.getAttribute('src') || '')) {
                console.info('[settings v1.0.4] Ignored legacy settings-v104.js loader.');
                return node;
            }
            return originalAppendChild.call(this, node);
        };
        document.head.__settingsV104AppendGuard = true;
    }

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
    const savePreferences = preferences => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)); }
        catch (error) { console.warn('[settings v1.0.4] Could not save preferences:', error); }
    };

    const initialize = () => {
        if (window[CONTROLLER_KEY]) window[CONTROLLER_KEY].destroy();

        const originalButton = document.getElementById('btnSettings') || document.getElementById('btnOpenSettings');
        const oldModal = document.getElementById('settingModal');
        if (!originalButton) {
            console.warn('[settings v1.0.4] Settings button #btnSettings/#btnOpenSettings was not found.');
            return;
        }

        // Replacing the trigger and modal removes legacy anonymous handlers as well as
        // stale popup markup. Keep #settingModal and #regionSelect for compatibility.
        const openButton = originalButton.cloneNode(true);
        openButton.removeAttribute('onclick');
        originalButton.replaceWith(openButton);
        const oldRegion = oldModal && oldModal.querySelector('#regionSelect');
        let regionSelect = oldRegion ? oldRegion.cloneNode(true) : null;
        if (oldModal) oldModal.remove();
        document.querySelectorAll('#regionModal,#regionModalOverlay,.region-modal,[data-region-modal]').forEach(node => node.remove());

        const modal = document.createElement('div');
        modal.id = 'settingModal';
        modal.className = 'v104-modal setting-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'settingTitle');
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = `<div class="v104-box setting-box"><div class="v104-heading"><h2 id="settingTitle">Settings · v1.0.4-beta</h2><button class="modal-close" id="btnCloseSettings" type="button" aria-label="Close settings">×</button></div><div class="v104-tabs" role="tablist" aria-label="Settings groups"></div><div class="v104-content"></div><div class="v104-actions"><button class="btn btn-outline" id="btnCancelSettings" type="button">Cancel</button><button class="btn btn-primary" id="btnApplySettings" type="button">Done</button></div></div>`;
        document.body.appendChild(modal);

        let style = document.getElementById('settings-v104-style');
        if (!style) { style = document.createElement('style'); style.id = 'settings-v104-style'; document.head.appendChild(style); }
        style.textContent = styleText;

        const controls = document.querySelector('.control-panel');
        const content = modal.querySelector('.v104-content');
        const tabs = modal.querySelector('.v104-tabs');
        if (controls) content.appendChild(controls);
        const sections = controls ? Array.from(controls.querySelectorAll(':scope > .control-section')) : [];
        const sectionFor = selector => sections.find(section => section.querySelector(selector));
        const groups = [
            { id: 'basic', label: '基础设置', selectors: ['#sectionPanel'], description: '地区与面板尺寸' },
            { id: 'display', label: '模拟器显示', selectors: ['#sectionDisplay', '#sectionColor'], description: '显示模式、亮度与灯珠样式' },
            { id: 'glyph', label: '字模渲染', selectors: ['#sectionFont', '#sectionStyle'], description: '文字、字体与字模采样' },
            { id: 'export', label: '导出与录制', selectors: ['#sectionExport'], description: '图片导出与视频录制' },
            { id: 'about', label: '关于', selectors: [], description: '项目与设置重置' }
        ];
        const groupedSections = {};
        groups.forEach(group => {
            groupedSections[group.id] = group.selectors.map(sectionFor).filter(Boolean);
            const tab = document.createElement('button');
            tab.type = 'button'; tab.className = 'v104-tab'; tab.id = `v104-tab-${group.id}`;
            tab.dataset.group = group.id; tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-controls', `v104-panel-${group.id}`);
            tab.setAttribute('aria-label', `${group.label}：${group.description}`);
            tab.textContent = group.label; tabs.appendChild(tab);
        });

        sections.forEach(section => {
            const group = groups.find(item => item.selectors.some(selector => section.querySelector(selector)));
            section.dataset.v104Group = group ? group.id : 'basic';
        });

        if (!regionSelect) {
            regionSelect = document.createElement('select');
            regionSelect.id = 'regionSelect';
            regionSelect.innerHTML = '<option value="china-mainland">中国大陆</option><option value="china-hmt">中国港澳台</option><option value="uk">United Kingdom</option><option value="usa">United States</option>';
        }
        regionSelect.id = 'regionSelect';
        regionSelect.setAttribute('aria-label', '地区 / Region');
        const regionWrap = document.createElement('div');
        regionWrap.className = 'control-group v104-region';
        regionWrap.innerHTML = '<label for="regionSelect">地区 / Region</label>';
        regionWrap.appendChild(regionSelect);
        const basicSection = sectionFor('#sectionPanel') || sections[0];
        if (basicSection) basicSection.appendChild(regionWrap);

        const about = document.createElement('section');
        about.className = 'control-section v104-about';
        about.innerHTML = '<div class="section-title">关于本项目</div><p>LED Matrix Simulator · v1.0.4-beta</p><p>开源 LED 点阵屏模拟器。</p><button class="btn btn-outline" id="v104-reset" type="button">重置全部设置</button>';
        if (controls) controls.appendChild(about);
        groupedSections.about = [about];

        const addControls = (section, markup) => {
            if (!section) return null;
            let row = section.querySelector('.v104-extra');
            if (!row) { row = document.createElement('div'); row.className = 'v104-extra'; section.appendChild(row); }
            row.insertAdjacentHTML('beforeend', markup);
            return row;
        };
        const displaySection = sectionFor('#sectionDisplay') || sectionFor('#sectionColor') || basicSection;
        const glyphSection = sectionFor('#sectionFont') || sectionFor('#sectionStyle') || basicSection;
        const exportSection = sectionFor('#sectionExport') || basicSection;
        addControls(displaySection, '<div class="control-group"><label for="v104-brightness">亮度 <output id="v104-brightness-value">100%</output></label><input id="v104-brightness" type="range" min="0" max="150" value="100"></div><div class="control-group"><label for="v104-grid">网格背景</label><input id="v104-grid" type="checkbox" checked></div><div class="control-group"><label for="v104-border">灯珠边框</label><input id="v104-border" type="checkbox" checked></div>');
        addControls(glyphSection, '<div class="control-group"><label for="v104-margin">安全边距 <output id="v104-margin-value">0%</output></label><input id="v104-margin" type="range" min="0" max="40" value="0"></div>');
        addControls(exportSection, '<div class="control-group"><label for="v104-format">默认导出格式</label><select id="v104-format"><option value="png">PNG</option><option value="jpeg">JPEG</option><option value="webp">WebP</option></select></div><div class="control-group"><label for="v104-fps">录制帧率</label><select id="v104-fps"><option value="15">15 fps</option><option value="24">24 fps</option><option value="30">30 fps</option><option value="60">60 fps</option></select></div>');

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
            try { localStorage.setItem(REGION_KEY, regionSelect.value); } catch (_) { /* storage may be disabled */ }
            applyLanguage(regionSelect.value);
        };
        try {
            const savedRegion = localStorage.getItem(REGION_KEY);
            regionSelect.value = savedRegion && regionLanguage[savedRegion] ? savedRegion : 'uk';
        } catch (_) { regionSelect.value = 'uk'; }
        persistRegion();
        applyPreferencesToForm();

        // Wrap renderer entry points without modifying AppState or main.js handlers.
        if (typeof Renderer !== 'undefined' && Renderer.draw && !Renderer.__settingsV104DrawWrapped) {
            const originalDraw = Renderer.draw;
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
            Renderer.__settingsV104DrawWrapped = true;
        }
        if (typeof Renderer !== 'undefined' && Renderer.buildBitmap && !Renderer.__settingsV104MarginWrapped) {
            const originalBuild = Renderer.buildBitmap;
            Renderer.buildBitmap = function(...args) {
                const scale = AppState.fontSizeScale;
                AppState.fontSizeScale = scale * (1 - Number(preferences.safeMargin) / 100);
                try { return originalBuild.apply(Renderer, args); }
                finally { AppState.fontSizeScale = scale; }
            };
            Renderer.__settingsV104MarginWrapped = true;
        }
        if (typeof Renderer !== 'undefined' && Renderer.canvas && Renderer.canvas.captureStream && !Renderer.canvas.__settingsV104CaptureWrapped) {
            const captureStream = Renderer.canvas.captureStream.bind(Renderer.canvas);
            Renderer.canvas.captureStream = () => captureStream(Number(preferences.frameRate) || 30);
            Renderer.canvas.__settingsV104CaptureWrapped = true;
        }
        if (typeof Exporter !== 'undefined' && Exporter.saveImage && !Exporter.__settingsV104ImageWrapped) {
            Exporter.saveImage = () => {
                const format = preferences.exportFormat;
                const mime = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
                const link = document.createElement('a');
                link.download = `led_matrix_${Date.now()}.${format === 'jpeg' ? 'jpg' : format}`;
                link.href = Renderer.canvas.toDataURL(mime, format === 'jpeg' ? 0.92 : undefined);
                link.click();
                if (typeof UI !== 'undefined') UI.showToast(`Image saved as ${format.toUpperCase()}`);
            };
            Exporter.__settingsV104ImageWrapped = true;
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
            input(id).addEventListener(id === 'v104-grid' || id === 'v104-border' || id === 'v104-format' || id === 'v104-fps' ? 'change' : 'input', onPreferenceChange);
        });

        const activateGroup = id => groups.forEach(group => {
            const active = group.id === id;
            const tab = tabs.querySelector(`[data-group="${group.id}"]`);
            tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
            groupedSections[group.id].forEach(section => { section.hidden = !active; });
        });
        const onTabClick = event => {
            const tab = event.target.closest('[data-group]');
            if (tab) activateGroup(tab.dataset.group);
        };
        const onTabKeydown = event => {
            if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
            event.preventDefault();
            const current = groups.findIndex(group => tabs.querySelector(`[data-group="${group.id}"]`) === document.activeElement);
            const next = (current + (event.key === 'ArrowRight' ? 1 : -1) + groups.length) % groups.length;
            const tab = tabs.querySelector(`[data-group="${groups[next].id}"]`);
            tab.focus(); activateGroup(groups[next].id);
        };
        tabs.addEventListener('click', onTabClick);
        tabs.addEventListener('keydown', onTabKeydown);
        activateGroup('basic');

        let isOpen = false;
        const close = () => {
            modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open'); isOpen = false; openButton.focus();
        };
        const open = () => {
            modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-open'); isOpen = true;
            tabs.querySelector('[data-group="basic"]').focus();
        };
        const onBackdrop = event => { if (event.target === modal) close(); };
        const onKey = event => { if (event.key === 'Escape' && isOpen) close(); };
        const onRegionChange = () => { persistRegion(); };
        const closeButton = modal.querySelector('#btnCloseSettings');
        const cancelButton = modal.querySelector('#btnCancelSettings');
        openButton.addEventListener('click', open);
        closeButton.addEventListener('click', close);
        cancelButton.addEventListener('click', close);
        modal.querySelector('#btnApplySettings').addEventListener('click', close);
        modal.addEventListener('click', onBackdrop);
        document.addEventListener('keydown', onKey);
        regionSelect.addEventListener('change', onRegionChange);

        const reset = () => {
            if (!window.confirm('重置全部设置为默认值？ / Reset all settings?')) return;
            preferences = { ...defaults }; savePreferences(preferences); applyPreferencesToForm();
            regionSelect.value = 'uk'; persistRegion();
            const sizes = document.querySelectorAll('.control-section:first-child .btn[data-cols]');
            const defaultSize = Array.from(sizes).find(button => button.dataset.cols === '320' && button.dataset.rows === '40');
            if (defaultSize) defaultSize.click();
            const mode = document.getElementById('displayMode');
            if (mode) { mode.value = 'scroll'; mode.dispatchEvent(new Event('change', { bubbles: true })); }
            const speed = document.getElementById('scrollSpeed');
            if (speed) { speed.value = '40'; speed.dispatchEvent(new Event('input', { bubbles: true })); }
            const scale = document.getElementById('fontSizeScale');
            if (scale) { scale.value = '100'; scale.dispatchEvent(new Event('input', { bubbles: true })); }
            const threshold = document.getElementById('threshold');
            if (threshold) { threshold.value = '0.5'; threshold.dispatchEvent(new Event('input', { bubbles: true })); }
            refresh();
        };
        const resetButton = about.querySelector('#v104-reset');
        resetButton.addEventListener('click', reset);

        window[CONTROLLER_KEY] = { destroy() {
            openButton.removeEventListener('click', open);
            closeButton.removeEventListener('click', close);
            cancelButton.removeEventListener('click', close);
            modal.removeEventListener('click', onBackdrop);
            document.removeEventListener('keydown', onKey);
            regionSelect.removeEventListener('change', onRegionChange);
            tabs.removeEventListener('click', onTabClick);
            tabs.removeEventListener('keydown', onTabKeydown);
        } };
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
    else initialize();
})();
