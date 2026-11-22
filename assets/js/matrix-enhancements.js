(() => {
    const CONTROLLER_KEY = '__ledMatrixPreviewControls';
    const translations = {
        'zh-CN': { previewTitle: '字模边界预览', margin: '安全边距', unit: '%', bounds: '字模边界', empty: '暂无字模', hint: '边框表示有效字模范围；虚线表示安全区域。', footer: 'LED Matrix Simulator · v1.0.2-beta · 开源项目' },
        'zh-TW': { previewTitle: '字模邊界預覽', margin: '安全邊距', unit: '%', bounds: '字模邊界', empty: '尚無字模', hint: '實線框表示有效字模範圍；虛線表示安全區域。', footer: 'LED Matrix Simulator · v1.0.2-beta · 開源專案' },
        en: { previewTitle: 'Glyph Bounds Preview', margin: 'Safe margin', unit: '%', bounds: 'Glyph bounds', empty: 'No glyph bitmap yet', hint: 'Solid outline shows glyph bounds; dashed outline shows the safe area.', footer: 'LED Matrix Simulator · v1.0.2-beta · Open Source' },
    };

    const init = () => {
        if (window[CONTROLLER_KEY]) window[CONTROLLER_KEY].abort();
        const controller = new AbortController();
        const signal = controller.signal;
        const panel = document.querySelector('.control-panel');
        if (!panel || typeof Renderer === 'undefined' || typeof AppState === 'undefined') return;

        const featureSection = document.createElement('section');
        featureSection.className = 'control-section matrix-tools';
        featureSection.innerHTML = `
            <div class="section-title" id="matrixToolsTitle"></div>
            <div class="control-row matrix-tools-row">
                <div class="control-group matrix-margin-control">
                    <label for="safeMargin"><span id="safeMarginLabel"></span> <strong id="safeMarginValue">5</strong><span id="safeMarginUnit">%</span></label>
                    <input type="range" id="safeMargin" min="0" max="20" value="5" step="1" aria-describedby="safeMarginHint">
                </div>
                <div class="matrix-preview" role="img" aria-labelledby="glyphPreviewTitle" aria-describedby="glyphPreviewHint">
                    <div class="matrix-preview-heading"><strong id="glyphPreviewTitle"></strong><span id="glyphBoundsText"></span></div>
                    <canvas id="glyphPreviewCanvas" width="384" height="64"></canvas>
                    <p id="glyphPreviewHint"></p>
                </div>
            </div>`;
        panel.appendChild(featureSection);

        const preview = document.getElementById('glyphPreviewCanvas');
        const previewCtx = preview.getContext('2d');
        const marginInput = document.getElementById('safeMargin');
        const marginValue = document.getElementById('safeMarginValue');
        const originalBuildBitmap = Renderer.buildBitmap;
        const originalDraw = Renderer.draw;
        const getLocale = () => translations[document.documentElement.lang] ? document.documentElement.lang : 'zh-CN';

        const applyFeatureLanguage = () => {
            const t = translations[getLocale()];
            document.getElementById('matrixToolsTitle').textContent = t.previewTitle;
            document.getElementById('glyphPreviewTitle').textContent = t.previewTitle;
            document.getElementById('safeMarginLabel').textContent = t.margin;
            document.getElementById('safeMarginUnit').textContent = t.unit;
            document.getElementById('safeMarginHint')?.replaceChildren(document.createTextNode(t.hint));
            document.getElementById('glyphPreviewHint').textContent = t.hint;
            document.getElementById('appVersion')?.replaceChildren(document.createTextNode(t.footer));
            drawPreview();
        };

        const repairOneCellGaps = () => {
            const bitmap = AppState.bitmap2D;
            if (!Array.isArray(bitmap) || !bitmap.length) return;
            const rows = bitmap.length;
            const cols = Math.min(...bitmap.map(row => Array.isArray(row) ? row.length : 0));
            if (!cols) return;
            const repaired = bitmap.map(row => row.slice());
            // Bridge only single-cell horizontal/vertical sampling gaps; avoid broad dilation,
            // which would noticeably thicken glyphs or merge adjacent characters.
            for (let r = 1; r < rows - 1; r++) {
                for (let c = 1; c < cols - 1; c++) {
                    if (bitmap[r][c]) continue;
                    if ((bitmap[r][c - 1] && bitmap[r][c + 1]) || (bitmap[r - 1][c] && bitmap[r + 1][c])) repaired[r][c] = 1;
                }
            }
            AppState.bitmap2D = repaired;
        };

        const drawPreview = () => {
            if (!previewCtx) return;
            const width = preview.width;
            const height = preview.height;
            previewCtx.clearRect(0, 0, width, height);
            previewCtx.fillStyle = '#05050a';
            previewCtx.fillRect(0, 0, width, height);
            const bitmap = AppState.bitmap2D;
            if (!Array.isArray(bitmap) || !bitmap.length) {
                document.getElementById('glyphBoundsText').textContent = translations[getLocale()].empty;
                return;
            }

            const rows = bitmap.length;
            const cols = Math.min(...bitmap.map(row => Array.isArray(row) ? row.length : 0));
            let minX = cols, minY = rows, maxX = -1, maxY = -1;
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    if (bitmap[y][x]) {
                        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
                        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
                    }
                }
            }
            if (maxX < minX || maxY < minY) {
                document.getElementById('glyphBoundsText').textContent = translations[getLocale()].empty;
                return;
            }

            const pad = 8;
            const scale = Math.min((width - pad * 2) / cols, (height - pad * 2) / rows);
            const renderedWidth = cols * scale;
            const renderedHeight = rows * scale;
            const offsetX = (width - renderedWidth) / 2;
            const offsetY = (height - renderedHeight) / 2;
            const marginRatio = Number(marginInput.value) / 100;
            const marginX = renderedWidth * marginRatio;
            const marginY = renderedHeight * marginRatio;

            previewCtx.strokeStyle = '#ffb347';
            previewCtx.setLineDash([4, 3]);
            previewCtx.strokeRect(offsetX + marginX, offsetY + marginY, Math.max(0, renderedWidth - marginX * 2), Math.max(0, renderedHeight - marginY * 2));
            previewCtx.setLineDash([]);
            previewCtx.fillStyle = '#ff4040';
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    if (bitmap[y][x]) previewCtx.fillRect(offsetX + x * scale, offsetY + y * scale, Math.max(1, scale - 0.35), Math.max(1, scale - 0.35));
                }
            }
            previewCtx.strokeStyle = '#48c8ff';
            previewCtx.lineWidth = 1;
            previewCtx.strokeRect(offsetX + minX * scale, offsetY + minY * scale, (maxX - minX + 1) * scale, (maxY - minY + 1) * scale);
            document.getElementById('glyphBoundsText').textContent = `${translations[getLocale()].bounds}: ${maxX - minX + 1} × ${maxY - minY + 1}`;
        };

        // Safe margin reduces the rasterized font size before sampling, leaving a deliberate
        // border on both panel types. Restore application state even if the original renderer throws.
        Renderer.buildBitmap = function() {
            const originalScale = AppState.fontSizeScale;
            try {
                AppState.fontSizeScale = originalScale * (1 - Number(marginInput.value) / 100);
                originalBuildBitmap.call(Renderer);
                repairOneCellGaps();
            } finally {
                AppState.fontSizeScale = originalScale;
            }
        };
        Renderer.draw = function() {
            const result = originalDraw.apply(Renderer, arguments);
            drawPreview();
            return result;
        };

        marginInput.addEventListener('input', () => {
            marginValue.textContent = marginInput.value;
            Renderer.refresh();
        }, { signal });
        const localeObserver = new MutationObserver(applyFeatureLanguage);
        localeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
        signal.addEventListener('abort', () => {
            localeObserver.disconnect();
            Renderer.buildBitmap = originalBuildBitmap;
            Renderer.draw = originalDraw;
            featureSection.remove();
        }, { once: true });
        window[CONTROLLER_KEY] = controller;

        applyFeatureLanguage();
        // Rebuild once with the default safe margin and refresh the preview, without re-binding main.js controls.
        Renderer.refresh();
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
