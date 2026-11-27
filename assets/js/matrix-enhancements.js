(() => {
    const PATCH_KEY = '__ledMatrixGlyphSamplingPatch';

    const init = () => {
        if (window[PATCH_KEY]) return;
        if (typeof Renderer === 'undefined' || typeof AppState === 'undefined') return;

        const originalBuildBitmap = Renderer.buildBitmap;

        // HZK16 already samples each bitmap column directly. Keep that path unchanged and
        // replace only the 1280 × 160 standard-panel sampler, which previously inspected
        // only every other source pixel and averaged four samples per LED cell. Thin strokes
        // could therefore be omitted or become uneven.
        const buildStandardBitmap = () => {
            const cleanText = AppState.text.replace(/[\r\n]+/g, '  ').trim() || ' ';
            const fontString = Renderer.getActiveFont();
            const off = document.createElement('canvas');
            const pixelsPerCell = 4;
            off.width = Math.max(800, AppState.GRID_COLS * pixelsPerCell);
            off.height = Math.max(100, AppState.GRID_ROWS * pixelsPerCell);
            const ctx = off.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, off.width, off.height);
            ctx.fillStyle = '#fff';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';

            const maxHeight = off.height * 0.82;
            const maxWidth = off.width * 0.95;
            let fontSize = maxHeight;
            ctx.font = `${fontSize}px ${fontString}`;
            let metrics = ctx.measureText(cleanText);

            // Scale uniformly to fit. Never scale the x-axis independently, preserving the
            // native glyph aspect ratio and normal spacing for CJK characters.
            if (metrics.width > maxWidth && metrics.width > 0) {
                fontSize *= maxWidth / metrics.width;
            }
            ctx.font = `${fontSize}px ${fontString}`;
            metrics = ctx.measureText(cleanText);
            const actualHeight = (metrics.actualBoundingBoxAscent || 0) + (metrics.actualBoundingBoxDescent || 0);
            if (actualHeight > maxHeight && actualHeight > 0) fontSize *= maxHeight / actualHeight;

            fontSize = Math.max(8, fontSize * AppState.fontSizeScale);
            ctx.font = `${fontSize}px ${fontString}`;
            ctx.fillText(cleanText, off.width / 2, off.height / 2);

            const image = ctx.getImageData(0, 0, off.width, off.height);
            const rgba = image.data;
            const bitmap = Array.from({ length: AppState.GRID_ROWS }, () => new Array(AppState.GRID_COLS).fill(0));
            const blockW = off.width / AppState.GRID_COLS;
            const blockH = off.height / AppState.GRID_ROWS;
            let minCol = AppState.GRID_COLS;
            let maxCol = -1;

            for (let row = 0; row < AppState.GRID_ROWS; row++) {
                const sy = Math.floor(row * blockH);
                const ey = Math.floor((row + 1) * blockH);
                for (let col = 0; col < AppState.GRID_COLS; col++) {
                    const sx = Math.floor(col * blockW);
                    const ex = Math.floor((col + 1) * blockW);
                    let hasInk = false;

                    // Examine every source pixel in this LED cell. A single above-threshold
                    // coverage sample is sufficient: the raster is clean white text on black,
                    // so this retains anti-aliased thin strokes without dilating neighbouring cells.
                    for (let y = sy; y < ey && !hasInk; y++) {
                        for (let x = sx; x < ex; x++) {
                            const index = (y * off.width + x) * 4;
                            const brightness = (rgba[index] * 0.299 + rgba[index + 1] * 0.587 + rgba[index + 2] * 0.114) / 255;
                            if (brightness >= AppState.threshold) {
                                hasInk = true;
                                break;
                            }
                        }
                    }

                    if (hasInk) {
                        bitmap[row][col] = 1;
                        minCol = Math.min(minCol, col);
                        maxCol = Math.max(maxCol, col);
                    }
                }
            }

            AppState.bitmap2D = bitmap;
            AppState.textLeftGrid = maxCol < 0 ? 0 : minCol;
            AppState.textWidthGrid = maxCol < 0 ? 1 : maxCol + 1;
            if (AppState.scrollOffset > AppState.textWidthGrid + AppState.GRID_COLS || AppState.scrollOffset < -AppState.GRID_COLS) {
                AppState.scrollOffset = -AppState.GRID_COLS;
            }
        };

        Renderer.buildBitmap = function() {
            if (AppState.GRID_ROWS === 16) {
                return originalBuildBitmap.call(Renderer);
            }
            return buildStandardBitmap();
        };

        window[PATCH_KEY] = {
            restore() {
                Renderer.buildBitmap = originalBuildBitmap;
                delete window[PATCH_KEY];
            },
        };

        // Replace the former preview/safe-margin wrapper and rebuild with unmodified font scale.
        Renderer.refresh();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
