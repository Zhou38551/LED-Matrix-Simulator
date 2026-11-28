(() => {
    const STORAGE_KEY = 'ledMatrixPreferences';
    const defaults = { brightness: 100, grid: true, beadBorder: true, safeMargin: 0, exportFormat: 'image/png', recordingFps: 30 };
    const repositoryUrl = 'https://github.com/Zhou38551/LED-Matrix-Simulator';

    const readPreferences = () => {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            return { ...defaults, ...parsed };
        } catch (error) {
            return { ...defaults };
        }
    };
    const preferences = readPreferences();
    const savePreferences = () => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)); }
        catch (error) { console.warn('Unable to save simulator settings:', error); }
    };

    const addStyles = () => {
        const style = document.createElement('style');
        style.id = 'settings-v104-styles';
        style.textContent = `
            .setting-box.settings-v104 { width:min(760px,100%); max-height:min(88vh,780px); overflow:auto; padding:0; border-radius:0!important; }
            .settings-v104 .v104-header { position:sticky; top:0; z-index:2; display:flex; align-items:center; justify-content:space-between; gap:16px; padding:18px 22px; background:var(--surface); border-bottom:1px solid var(--border); }
            .settings-v104 .v104-header h2 { color:var(--text); font-size:1rem; }
            .settings-v104 .v104-body { padding:18px 22px 22px; }
            .settings-v104 .v104-section { margin:0 0 18px; padding:0 0 16px; border-bottom:1px solid var(--border); }
            .settings-v104 .v104-section:last-of-type { margin-bottom:0; border-bottom:0; }
            .settings-v104 .v104-section h3 { margin:0 0 12px; color:#ff8c3a; font-size:.75rem; letter-spacing:.08em; text-transform:uppercase; }
            .settings-v104 .v104-control { display:flex; align-items:center; justify-content:space-between; gap:18px; margin:10px 0; color:var(--text); font-size:.82rem; }
            .settings-v104 .v104-control > label:first-child { color:var(--text-secondary); }
            .settings-v104 .v104-control input[type=range] { width:min(280px,52%); }
            .settings-v104 .v104-control select { min-width:190px; }
            .settings-v104 .v104-inline { display:flex; align-items:center; gap:8px; }
            .settings-v104 .v104-switch { accent-color:#ff5f57; width:16px; height:16px; }
            .settings-v104 .v104-value { min-width:42px; color:var(--text); text-align:right; font-variant-numeric:tabular-nums; }
            .settings-v104 .v104-panel-options { display:flex; flex-wrap:wrap; gap:8px; }
            .settings-v104 .v104-panel-options .btn { border-radius:0; }
            .settings-v104 .v104-about-link { color:#ff8c3a; text-decoration:none; }
            .settings-v104 .v104-about-link:hover { text-decoration:underline; }
            .settings-v104 .v104-footer { display:flex; justify-content:flex-end; gap:8px; padding-top:16px; border-top:1px solid var(--border); }
            .setting-box.settings-v104, .setting-box.settings-v104 *:not(#btnCloseSettings) { border-radius:0!important; }
            @media(max-width:560px) { .setting-box.settings-v104 .v104-body { padding:14px; } .settings-v104 .v104-control { align-items:flex-start; flex-direction:column; gap:6px; } .settings-v104 .v104-control input[type=range] { width:100%; } .settings-v104 .v104-control select { width:100%; } }
        `;
        document.head.appendChild(style);
    };

    const init = () => {
        const modal = document.getElementById('settingModal');
        const box = modal && modal.querySelector('.setting-box');
        if (!modal || !box || box.classList.contains('settings-v104')) return;

        addStyles();
        const oldHeading = box.querySelector('.modal-heading');
        const closeButton = document.getElementById('btnCloseSettings');
        const regionLabel = box.querySelector('label[for="regionSelect"]');
        const regionSelect = document.getElementById('regionSelect');
        const actions = box.querySelector('.modal-actions');
        const cancelButton = document.getElementById('btnCancelSettings');
        const saveButton = document.getElementById('btnSaveSettings');
        if (!closeButton || !regionLabel || !regionSelect || !actions || !cancelButton || !saveButton) return;

        box.classList.add('settings-v104');
        const header = document.createElement('div');
        header.className = 'v104-header';
        const title = oldHeading && oldHeading.querySelector('h2') ? oldHeading.querySelector('h2') : document.createElement('h2');
        title.id = 'settingTitle';
        title.textContent = 'Settings / 设置';
        header.append(title, closeButton);

        const body = document.createElement('div');
        body.className = 'v104-body';
        const section = (heading) => {
            const node = document.createElement('section');
            node.className = 'v104-section';
            const h = document.createElement('h3');
            h.textContent = heading;
            node.appendChild(h);
            body.appendChild(node);
            return node;
        };
        const control = (parent, labelText, element) => {
            const row = document.createElement('div');
            row.className = 'v104-control';
            const label = document.createElement('label');
            label.textContent = labelText;
            if (element.id) label.htmlFor = element.id;
            row.append(label, element);
            parent.appendChild(row);
            return row;
        };
        const makeRange = (id, min, max, value, suffix = '%') => {
            const wrap = document.createElement('div');
            wrap.className = 'v104-inline';
            const range = document.createElement('input');
            range.type = 'range'; range.id = id; range.min = min; range.max = max; range.value = value;
            const output = document.createElement('output'); output.className = 'v104-value'; output.htmlFor = id; output.textContent = `${value}${suffix}`;
            wrap.append(range, output);
            range.addEventListener('input', () => { output.textContent = `${range.value}${suffix}`; });
            return { wrap, range, output };
        };

        const basic = section('Basic Settings / 基础设置');
        const regionRow = document.createElement('div'); regionRow.className = 'v104-control';
        regionRow.append(regionLabel, regionSelect); basic.appendChild(regionRow);
        const resetButton = document.createElement('button');
        resetButton.type = 'button'; resetButton.className = 'btn btn-outline';
        resetButton.textContent = 'Reset all settings / 重置全部设置';
        const resetRow = document.createElement('div'); resetRow.className = 'v104-control'; resetRow.append(resetButton); basic.appendChild(resetRow);
        resetButton.addEventListener('click', () => {
            if (!window.confirm('Reset all simulator settings? / 确定要重置全部设置吗？')) return;
            if (!window.confirm('This will clear saved region and display preferences. Continue? / 此操作将清除已保存的地区和显示偏好，是否继续？')) return;
            ['ledMatrixRegion', 'ledSimRegion', STORAGE_KEY].forEach(key => { try { localStorage.removeItem(key); } catch (error) {} });
            window.location.reload();
        });

        const display = section('Simulator Display / 模拟器显示');
        const brightness = makeRange('v104Brightness', 0, 100, preferences.brightness);
        control(display, 'LED Brightness / LED 亮度', brightness.wrap);
        const grid = document.createElement('input'); grid.type = 'checkbox'; grid.id = 'v104Grid'; grid.className = 'v104-switch'; grid.checked = !!preferences.grid;
        const gridRow = control(display, 'Grid background / 网格背景', grid); gridRow.querySelector('label').className = 'v104-control-label';
        const beadBorder = document.createElement('input'); beadBorder.type = 'checkbox'; beadBorder.id = 'v104BeadBorder'; beadBorder.className = 'v104-switch'; beadBorder.checked = !!preferences.beadBorder;
        control(display, 'LED bead borders / 点阵灯珠边框', beadBorder);

        const glyph = section('Glyph Rendering / 字模渲染');
        const modeRow = document.createElement('div'); modeRow.className = 'v104-control';
        const modeLabel = document.createElement('span'); modeLabel.textContent = 'Sampling mode / 字模采样模式';
        const modeOptions = document.createElement('div'); modeOptions.className = 'v104-panel-options';
        const sourcePanel = document.querySelector('.control-panel > .control-section:first-child');
        const sourceButtons = sourcePanel ? Array.from(sourcePanel.querySelectorAll('button[data-rows]')) : [];
        sourceButtons.forEach((source, index) => {
            const button = document.createElement('button'); button.type = 'button'; button.className = 'btn btn-outline';
            button.textContent = index === 0 ? 'Standard sampling / 标准采样' : 'HZK16 mode / HZK16 模式';
            button.addEventListener('click', () => source.click());
            modeOptions.appendChild(button);
        });
        modeRow.append(modeLabel, modeOptions); glyph.appendChild(modeRow);
        if (sourcePanel) sourcePanel.style.display = 'none';
        const safeMargin = makeRange('v104SafeMargin', 0, 20, preferences.safeMargin);
        control(glyph, 'Safe margin / 安全边距', safeMargin.wrap);

        const exportSection = section('Export & Recording / 导出与录制');
        const format = document.createElement('select'); format.id = 'v104ExportFormat';
        [['image/png', 'PNG'], ['image/webp', 'WebP']].forEach(([value, name]) => { const option = document.createElement('option'); option.value = value; option.textContent = name; format.appendChild(option); });
        format.value = preferences.exportFormat;
        control(exportSection, 'Default export format / 导出默认格式', format);
        const fps = document.createElement('select'); fps.id = 'v104Fps';
        [[10, '10 FPS'], [15, '15 FPS'], [24, '24 FPS'], [30, '30 FPS']].forEach(([value, name]) => { const option = document.createElement('option'); option.value = value; option.textContent = name; fps.appendChild(option); });
        fps.value = String(preferences.recordingFps);
        const fpsRow = control(exportSection, 'GIF frame-rate preset / GIF 录制帧率预设', fps);
        const note = document.createElement('small'); note.textContent = 'The built-in recorder currently exports WebM; this preset controls its capture frame rate.';
        note.style.cssText = 'display:block;color:var(--text-secondary);font-size:.68rem;margin-top:8px'; exportSection.appendChild(note);

        const about = section('About / 关于');
        const version = document.createElement('div'); version.className = 'v104-control'; version.textContent = 'Current version / 当前版本: v1.0.4-beta'; about.appendChild(version);
        const repo = document.createElement('div'); repo.className = 'v104-control';
        const repoLabel = document.createElement('span'); repoLabel.textContent = 'Project repository / 项目仓库';
        const repoLink = document.createElement('a'); repoLink.className = 'v104-about-link'; repoLink.href = repositoryUrl; repoLink.target = '_blank'; repoLink.rel = 'noopener noreferrer'; repoLink.textContent = 'Zhou38551/LED-Matrix-Simulator';
        repo.append(repoLabel, repoLink); about.appendChild(repo);

        const footer = document.createElement('div'); footer.className = 'v104-footer'; footer.append(cancelButton, saveButton);
        box.replaceChildren(header, body, footer);

        const commit = () => {
            preferences.brightness = Number(brightness.range.value);
            preferences.grid = grid.checked;
            preferences.beadBorder = beadBorder.checked;
            preferences.safeMargin = Number(safeMargin.range.value);
            preferences.exportFormat = format.value;
            preferences.recordingFps = Number(fps.value);
            savePreferences();
            applyRendererSettings();
        };
        [brightness.range, safeMargin.range].forEach(input => input.addEventListener('input', commit));
        [grid, beadBorder, format, fps].forEach(input => input.addEventListener('change', commit));
        saveButton.addEventListener('click', commit);

        const applyRendererSettings = () => {
            if (!window.Renderer || !Renderer.ctx) return;
            Renderer.settingsV104 = { ...preferences };
            if (Renderer.__v104DrawPatched) return;
            Renderer.__v104DrawPatched = true;
            const originalDraw = Renderer.draw;
            Renderer.draw = function(...args) {
                const ctx = this.ctx;
                const originalFillRect = ctx.fillRect;
                const settings = this.settingsV104 || defaults;
                ctx.fillRect = function(x, y, width, height) {
                    const isGridDot = this.fillStyle === '#111111' && width === AppState.SCALE - 1 && height === AppState.SCALE - 1;
                    if (isGridDot && !settings.grid) return;
                    if (!isGridDot && !settings.beadBorder && width === AppState.SCALE - 1 && height === AppState.SCALE - 1) width = height = AppState.SCALE;
                    return originalFillRect.call(this, x, y, width, height);
                };
                originalDraw.apply(this, args);
                ctx.fillRect = originalFillRect;
                const dim = 1 - Math.max(0, Math.min(100, Number(settings.brightness))) / 100;
                if (dim > 0) {
                    ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(0,0,0,${dim})`;
                    ctx.fillRect(0, 0, AppState.CANVAS_W, AppState.CANVAS_H); ctx.restore();
                }
            };
            const originalBitmap = Renderer.buildBitmap;
            Renderer.buildBitmap = function(...args) {
                const originalScale = AppState.fontSizeScale;
                AppState.fontSizeScale = originalScale * (1 - Math.max(0, Math.min(20, Number(this.settingsV104.safeMargin))) / 100);
                try { return originalBitmap.apply(this, args); }
                finally { AppState.fontSizeScale = originalScale; }
            };
            const canvas = Renderer.canvas;
            if (!canvas.__v104ExportPatched) {
                canvas.__v104ExportPatched = true;
                const originalToDataURL = canvas.toDataURL.bind(canvas);
                canvas.toDataURL = (type, quality) => originalToDataURL(preferences.exportFormat || type || 'image/png', quality);
                const originalCaptureStream = canvas.captureStream.bind(canvas);
                canvas.captureStream = () => originalCaptureStream(Number(preferences.recordingFps) || 30);
            }
            Renderer.refresh();
        };
        applyRendererSettings();
        const existingSettings = document.getElementById('btnSettings');
        closeButton.setAttribute('aria-label', 'Close settings');
        void existingSettings; void fpsRow;
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
