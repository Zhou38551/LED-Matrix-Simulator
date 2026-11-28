(() => {
    const PATCH_KEY = '__ledMatrixGlyphSamplingPatch';

    try {
        if (localStorage.getItem('ledMatrixRegion') === null) {
            localStorage.setItem('ledMatrixRegion', 'uk');
            document.documentElement.lang = 'en';
        }
    } catch (error) {
        document.documentElement.lang = 'en';
    }

    const init = () => {
        if (window[PATCH_KEY]) return;
        if (typeof Renderer === 'undefined' || typeof AppState === 'undefined') return;
        const originalBuildBitmap = Renderer.buildBitmap;

        const buildStandardBitmap = () => {
            const cleanText = AppState.text.replace(/[\r\n]+/g, '  ').trim() || ' ';
            const fontString = Renderer.getActiveFont();
            const off = document.createElement('canvas');
            off.width = Math.max(800, AppState.GRID_COLS * 4);
            off.height = Math.max(100, AppState.GRID_ROWS * 4);
            const ctx = off.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, off.width, off.height);
            ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
            const maxHeight = off.height * 0.82, maxWidth = off.width * 0.95;
            let fontSize = maxHeight;
            ctx.font = `${fontSize}px ${fontString}`;
            let metrics = ctx.measureText(cleanText);
            if (metrics.width > maxWidth && metrics.width > 0) fontSize *= maxWidth / metrics.width;
            ctx.font = `${fontSize}px ${fontString}`; metrics = ctx.measureText(cleanText);
            const actualHeight = (metrics.actualBoundingBoxAscent || 0) + (metrics.actualBoundingBoxDescent || 0);
            if (actualHeight > maxHeight && actualHeight > 0) fontSize *= maxHeight / actualHeight;
            fontSize = Math.max(8, fontSize * AppState.fontSizeScale);
            ctx.font = `${fontSize}px ${fontString}`; ctx.fillText(cleanText, off.width / 2, off.height / 2);
            const rgba = ctx.getImageData(0, 0, off.width, off.height).data;
            const bitmap = Array.from({ length: AppState.GRID_ROWS }, () => new Array(AppState.GRID_COLS).fill(0));
            const blockW = off.width / AppState.GRID_COLS, blockH = off.height / AppState.GRID_ROWS;
            let minCol = AppState.GRID_COLS, maxCol = -1;
            for (let row = 0; row < AppState.GRID_ROWS; row++) {
                const sy = Math.floor(row * blockH), ey = Math.floor((row + 1) * blockH);
                for (let col = 0; col < AppState.GRID_COLS; col++) {
                    const sx = Math.floor(col * blockW), ex = Math.floor((col + 1) * blockW);
                    let hasInk = false;
                    for (let y = sy; y < ey && !hasInk; y++) for (let x = sx; x < ex; x++) {
                        const index = (y * off.width + x) * 4;
                        const brightness = (rgba[index] * .299 + rgba[index + 1] * .587 + rgba[index + 2] * .114) / 255;
                        if (brightness >= AppState.threshold) { hasInk = true; break; }
                    }
                    if (hasInk) { bitmap[row][col] = 1; minCol = Math.min(minCol, col); maxCol = Math.max(maxCol, col); }
                }
            }
            AppState.bitmap2D = bitmap;
            AppState.textLeftGrid = maxCol < 0 ? 0 : minCol;
            AppState.textWidthGrid = maxCol < 0 ? 1 : maxCol + 1;
            if (AppState.scrollOffset > AppState.textWidthGrid + AppState.GRID_COLS || AppState.scrollOffset < -AppState.GRID_COLS) AppState.scrollOffset = -AppState.GRID_COLS;
        };
        Renderer.buildBitmap = function() {
            return AppState.GRID_ROWS === 16 ? originalBuildBitmap.call(Renderer) : buildStandardBitmap();
        };
        window[PATCH_KEY] = { restore() { Renderer.buildBitmap = originalBuildBitmap; delete window[PATCH_KEY]; } };

        const releaseFooter = () => {
            const footer = document.getElementById('appVersion');
            if (!footer) return;
            const english = document.documentElement.lang === 'en';
            const text = english ? 'LED Matrix Simulator · v1.0.5-beta · Open Source' : 'LED Matrix Simulator · v1.0.5-beta · 开源项目';
            if (footer.textContent !== text) footer.textContent = text;
        };
        const footer = document.getElementById('appVersion');
        if (footer) new MutationObserver(releaseFooter).observe(footer, { childList: true, characterData: true, subtree: true });
        new MutationObserver(releaseFooter).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
        releaseFooter();

        const settingsScript = document.createElement('script');
        settingsScript.src = 'assets/js/settings.js';
        settingsScript.async = true;
        document.head.appendChild(settingsScript);
        const v105 = document.createElement('script');
        v105.src = 'assets/js/v105-features.js';
        v105.async = true;
        document.head.appendChild(v105);
        Renderer.refresh();
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
