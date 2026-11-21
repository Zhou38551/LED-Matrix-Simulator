// ==========================================
// 模块 1: 状态管理 (State)
// ==========================================
const AppState = {
    GRID_COLS: 320,
    GRID_ROWS: 40,
    SCALE: 4,
    CANVAS_W: 320 * 4,
    CANVAS_H: 40 * 4,

    text: '你好 世界',
    mode: 'scroll',
    scrollSpeed: 40,
    scrollOffset: -320, 
    fontSizeScale: 1.0,
    threshold: 0.50, 
    ledColor: '#ff3333',
    customFontFamily: null,

    // 运行时数据
    bitmap2D: null,
    textWidthGrid: 0,
    textLeftGrid: 0,
    animFrame: null,
    lastTime: 0,

    // 视频录制状态
    isRecording: false,
    mediaRecorder: null,
    recordedChunks: [],
    staticRecordTimer: null,
};

// ==========================================
// 模块 2: 渲染引擎 (Renderer)
// ==========================================
const Renderer = {
    canvas: document.getElementById('ledCanvas'),
    ctx: document.getElementById('ledCanvas').getContext('2d'),

    resizeCanvas: () => {
        AppState.CANVAS_W = AppState.GRID_COLS * AppState.SCALE;
        AppState.CANVAS_H = AppState.GRID_ROWS * AppState.SCALE;
        Renderer.canvas.width = AppState.CANVAS_W;
        Renderer.canvas.height = AppState.CANVAS_H;
    },

    getActiveFont: () => {
        if (AppState.customFontFamily) {
            return `"${AppState.customFontFamily}", "Courier New", monospace`;
        }
        return '"Courier New", "Lucida Console", "Consolas", monospace';
    },

    buildBitmap: () => {
        const cleanText = AppState.text.replace(/[\r\n]+/g, '  ').trim() || ' ';
        const isHZK16 = (AppState.GRID_ROWS === 16);
        const fontString = Renderer.getActiveFont();

        if (isHZK16) {
            const measureCanvas = document.createElement('canvas');
            const mCtx = measureCanvas.getContext('2d');
            let targetSize = Math.round(16 * AppState.fontSizeScale);
            
            mCtx.font = `${targetSize}px ${fontString}`;
            let measureWidth = mCtx.measureText(cleanText).width;

            const MAX_CANVAS_WIDTH = 12000;
            if (measureWidth > MAX_CANVAS_WIDTH) {
                targetSize = Math.max(8, targetSize * (MAX_CANVAS_WIDTH / measureWidth));
                mCtx.font = `${targetSize}px ${fontString}`;
                measureWidth = mCtx.measureText(cleanText).width;
            }

            const tempCanvas = document.createElement('canvas');
            const tCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
            
            tempCanvas.width = Math.ceil(measureWidth) + 40;
            tempCanvas.height = 64;
            
            tCtx.fillStyle = '#000';
            tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            tCtx.fillStyle = '#fff';
            tCtx.font = `${targetSize}px ${fontString}`;
            tCtx.textBaseline = 'top';
            tCtx.textAlign = 'left';
            
            const startX = 20;
            const startY = 20;
            tCtx.fillText(cleanText, startX, startY);
            
            const img = tCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const px = img.data;
            
            let minY = tempCanvas.height, maxY = 0;
            let minX = tempCanvas.width, maxX = 0;
            
            for (let y = 0; y < tempCanvas.height; y++) {
                for (let x = 0; x < tempCanvas.width; x++) {
                    const idx = (y * tempCanvas.width + x) * 4;
                    const bright = (px[idx]*0.299 + px[idx+1]*0.587 + px[idx+2]*0.114) / 255;
                    if (bright > AppState.threshold) {
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                    }
                }
            }
            
            if (maxY < minY) {
                AppState.bitmap2D = Array.from({ length: 16 }, () => new Array(AppState.GRID_COLS).fill(0));
                AppState.textWidthGrid = 0;
                AppState.textLeftGrid = 0;
                return;
            }
            
            const actualH = maxY - minY + 1;
            const actualW = maxX - minX + 1;
            const offsetY = Math.floor((16 - actualH) / 2) - minY; 
            
            const offWidth = Math.max(AppState.GRID_COLS, actualW + 40);
            AppState.bitmap2D = Array.from({ length: 16 }, () => new Array(offWidth).fill(0));
            
            const centerOffsetX = Math.floor((offWidth - actualW) / 2) - minX;
            
            for (let r = 0; r < 16; r++) {
                for (let c = 0; c < offWidth; c++) {
                    const srcY = r - offsetY;
                    const srcX = c - centerOffsetX;
                    
                    if (srcY >= 0 && srcY < tempCanvas.height && srcX >= 0 && srcX < tempCanvas.width) {
                        const idx = (srcY * tempCanvas.width + srcX) * 4;
                        const bright = (px[idx]*0.299 + px[idx+1]*0.587 + px[idx+2]*0.114) / 255;
                        if (bright > AppState.threshold) {
                            AppState.bitmap2D[r][c] = 1;
                        }
                    }
                }
            }
            
            let maxCol = 0, minCol = offWidth;
            for (let r = 0; r < 16; r++) {
                for (let c = 0; c < offWidth; c++) {
                    if (AppState.bitmap2D[r][c] === 1 && c < minCol) minCol = c;
                }
                for (let c = offWidth - 1; c >= 0; c--) {
                    if (AppState.bitmap2D[r][c] === 1) {
                        maxCol = Math.max(maxCol, c);
                        break;
                    }
                }
            }
            AppState.textLeftGrid = minCol === offWidth ? 0 : minCol;
            AppState.textWidthGrid = Math.max(1, maxCol + 1);

} else {
                    // 标准屏：离屏画布宽高比 = 点阵网格比，k×k 正方形块采样，字形不压扁
                    const k = 4;
                    const off = document.createElement('canvas');
                    off.width = Math.max(800, AppState.GRID_COLS * k);
                    off.height = Math.max(100, AppState.GRID_ROWS * k);
                    const oc = off.getContext('2d', { willReadFrequently: true });

                    oc.fillStyle = '#000';
                    oc.fillRect(0, 0, off.width, off.height);
                    oc.fillStyle = '#fff';
                    oc.textBaseline = 'middle';
                    oc.textAlign = 'center';

                    const maxHeight = off.height * 0.82;
                    const maxWidth = off.width * 0.95;

                    let size = maxHeight;
                    oc.font = `${size}px ${fontString}`;

                    let metrics = oc.measureText(cleanText);
                    if (metrics.width > maxWidth) {
                        size = size * (maxWidth / metrics.width);
                    }

                    oc.font = `${size}px ${fontString}`;
                    metrics = oc.measureText(cleanText);
                    const ascent = metrics.actualBoundingBoxAscent || 0;
                    const descent = metrics.actualBoundingBoxDescent || 0;
                    const actualH = ascent + descent;
                    if (actualH > 0 && isFinite(actualH) && actualH > maxHeight) {
                        size = size * (maxHeight / actualH);
                    }

                    size = size * AppState.fontSizeScale;
                    size = Math.max(8, size);

                    oc.font = `${size}px ${fontString}`;
                    oc.fillText(cleanText, off.width / 2, off.height / 2);

                    const img = oc.getImageData(0, 0, off.width, off.height);
                    const px = img.data;

                    AppState.bitmap2D = Array.from({ length: AppState.GRID_ROWS }, () => new Array(AppState.GRID_COLS).fill(0));
                    let maxX = 0, minCol = AppState.GRID_COLS;

                    const blockW = off.width / AppState.GRID_COLS;
                    const blockH = off.height / AppState.GRID_ROWS;

                    for (let r = 0; r < AppState.GRID_ROWS; r++) {
                        for (let c = 0; c < AppState.GRID_COLS; c++) {
                            const sx = Math.floor(c * blockW);
                            const ex = Math.floor((c + 1) * blockW);
                            const sy = Math.floor(r * blockH);
                            const ey = Math.floor((r + 1) * blockH);

                            let sumBrightness = 0, count = 0;
                            for (let y = sy; y < ey; y += 2) {
                                for (let x = sx; x < ex; x += 2) {
                                    const idx = (y * off.width + x) * 4;
                                    sumBrightness += (px[idx]*0.299 + px[idx+1]*0.587 + px[idx+2]*0.114) / 255;
                                    count++;
                                }
                            }

                            const avgBright = count > 0 ? (sumBrightness / count) : 0;
                            if (avgBright > AppState.threshold) {
                                AppState.bitmap2D[r][c] = 1;
                                maxX = Math.max(maxX, c);
                                if (c < minCol) minCol = c;
                            }
                        }
                    }

                    AppState.textLeftGrid = minCol === AppState.GRID_COLS ? 0 : minCol;
                    AppState.textWidthGrid = Math.max(1, maxX + 1);
                }

                if (AppState.scrollOffset > AppState.textWidthGrid + AppState.GRID_COLS || AppState.scrollOffset < -AppState.GRID_COLS) {
                    AppState.scrollOffset = -AppState.GRID_COLS;
                }
            },

            hexToRgb: (h) => {
                const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
                return r ? { r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16) } : { r:255, g:51, b:51 };
            },

            draw: () => {
                const ctx = Renderer.ctx;
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, AppState.CANVAS_W, AppState.CANVAS_H);

                if (!AppState.bitmap2D) return;

                const rgb = Renderer.hexToRgb(AppState.ledColor);
                const litColor = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
                const dimColor = '#111111'; 

                ctx.fillStyle = dimColor;
                if (AppState.GRID_COLS <= 400) {
                    for (let r = 0; r < AppState.GRID_ROWS; r++) {
                        for (let c = 0; c < AppState.GRID_COLS; c++) {
                            ctx.fillRect(c * AppState.SCALE, r * AppState.SCALE, AppState.SCALE - 1, AppState.SCALE - 1);
                        }
                    }
                }

                ctx.fillStyle = litColor;
                const leftPad = AppState.textLeftGrid || 0;
                const textW = Math.max(1, AppState.textWidthGrid - leftPad);
                const centerOffset = Math.floor((AppState.GRID_COLS - textW) / 2) - leftPad;
                
                for (let r = 0; r < AppState.GRID_ROWS; r++) {
                    for (let c = 0; c < AppState.GRID_COLS; c++) {
                        const srcCol = c - (AppState.mode === 'static' ? centerOffset : -Math.round(AppState.scrollOffset));
                        
                        let isLit = false;
                        if (srcCol >= 0 && srcCol < AppState.textWidthGrid && AppState.bitmap2D[r] && AppState.bitmap2D[r][srcCol] !== undefined) {
                            isLit = AppState.bitmap2D[r][srcCol] === 1;
                        }

                        if (isLit) {
                            ctx.fillRect(c * AppState.SCALE, r * AppState.SCALE, AppState.SCALE - 1, AppState.SCALE - 1);
                        }
                    }
                }
                
                document.getElementById('totalCount').textContent = (AppState.GRID_COLS * AppState.GRID_ROWS).toLocaleString();
                document.getElementById('sizeBadge').textContent = `${AppState.GRID_COLS * AppState.SCALE} × ${AppState.GRID_ROWS * AppState.SCALE}`;
            },

            animate: (timestamp) => {
                if (!timestamp) timestamp = performance.now();
                const dt = Math.min((timestamp - AppState.lastTime) / 1000, 0.1);
                AppState.lastTime = timestamp;

                if (AppState.mode === 'scroll' && AppState.bitmap2D) {
                    AppState.scrollOffset += AppState.scrollSpeed * dt;
                    
                    if (AppState.isRecording && AppState.scrollOffset >= AppState.textWidthGrid) {
                        Exporter.stopRecording();
                    }

                    if (AppState.scrollOffset > AppState.textWidthGrid) {
                        AppState.scrollOffset = -AppState.GRID_COLS;
                    }
                }

                Renderer.draw();
                AppState.animFrame = requestAnimationFrame(Renderer.animate);
            },

            start: () => {
                if (AppState.animFrame) cancelAnimationFrame(AppState.animFrame);
                AppState.lastTime = performance.now();
                AppState.animFrame = requestAnimationFrame(Renderer.animate);
            },

            refresh: () => {
                Renderer.buildBitmap();
                if (AppState.mode === 'static') {
                    if (AppState.animFrame) {
                        cancelAnimationFrame(AppState.animFrame);
                        AppState.animFrame = null;
                    }
                    Renderer.draw();
                } else {
                    Renderer.start();
                }
            }
        };

        // ==========================================
        // 模块 3: 导出功能 (Exporter)
        // ==========================================
        const Exporter = {
            saveImage: () => {
                const link = document.createElement('a');
                link.download = 'led_matrix_' + Date.now() + '.png';
                link.href = Renderer.canvas.toDataURL('image/png');
                link.click();
                UI.showToast('📸 图片已保存');
            },

            stopRecording: () => {
                if (!AppState.isRecording) return;
                AppState.isRecording = false;
                
                if (AppState.mediaRecorder && AppState.mediaRecorder.state !== 'inactive') {
                    AppState.mediaRecorder.stop();
                }
                
                const btn = document.getElementById('btnRecord');
                btn.textContent = '🔴 录制视频';
                btn.classList.remove('recording');
                
                if (AppState.staticRecordTimer) {
                    clearTimeout(AppState.staticRecordTimer);
                    AppState.staticRecordTimer = null;
                }
                
                UI.showToast('录制结束，视频下载中...');
            },

            startRecording: () => {
                if (AppState.isRecording) {
                    Exporter.stopRecording();
                    return;
                }

                if (!window.MediaRecorder) {
                    UI.showToast('您的浏览器不支持视频录制，请使用 Chrome 或 Edge');
                    return;
                }

                AppState.isRecording = true;
                AppState.recordedChunks = [];
                
                if (AppState.mode === 'scroll') {
                    AppState.scrollOffset = -AppState.GRID_COLS;
                }

                const stream = Renderer.canvas.captureStream(30); 
                let options = { mimeType: 'video/webm;codecs=vp9' };
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    options = { mimeType: 'video/webm;codecs=vp8' };
                    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                        options = { mimeType: 'video/webm' };
                    }
                }

                try {
                    AppState.mediaRecorder = new MediaRecorder(stream, options);
                } catch (e) {
                    UI.showToast('无法创建视频录制器: ' + e.message);
                    AppState.isRecording = false;
                    return;
                }

                AppState.mediaRecorder.ondataavailable = e => {
                    if (e.data && e.data.size > 0) {
                        AppState.recordedChunks.push(e.data);
                    }
                };

                AppState.mediaRecorder.onstop = () => {
                    const blob = new Blob(AppState.recordedChunks, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = 'led_matrix_' + Date.now() + '.webm';
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                    }, 100);
                };

                AppState.mediaRecorder.start();
                
                const btn = document.getElementById('btnRecord');
                btn.textContent = '⏹ 停止录制';
                btn.classList.add('recording');
                UI.showToast('开始录制，滚动完一次将自动保存...');

                if (AppState.mode === 'static') {
                    AppState.staticRecordTimer = setTimeout(() => {
                        Exporter.stopRecording();
                    }, 3000);
                }
            }
        };

        // ==========================================
        // 模块 4: UI 与事件绑定 (UI)
        // ==========================================
        const UI = {
            toastTimer: null,
            showToast: (m) => {
                const toast = document.getElementById('toast');
                clearTimeout(UI.toastTimer); 
                toast.textContent = m; 
                toast.classList.add('show'); 
                UI.toastTimer = setTimeout(() => toast.classList.remove('show'), 2000); 
            },

            updateUI: () => {
                document.getElementById('speedVal').textContent = AppState.scrollSpeed;
                document.getElementById('sizeScaleVal').textContent = Math.round(AppState.fontSizeScale * 100);
                document.getElementById('thresholdVal').textContent = AppState.threshold.toFixed(2);
                document.getElementById('scrollOpts').style.display = AppState.mode === 'scroll' ? '' : 'none';
                document.getElementById('scrollStatus').textContent = AppState.mode === 'scroll' ? '◀ 自动滚动中' : '⏸ 静态显示';
                document.querySelectorAll('.color-preset').forEach(p => {
                    p.classList.toggle('active', p.dataset.color === AppState.ledColor);
                });
            },

            init: () => {
                Renderer.resizeCanvas();

                document.getElementById('fontUpload').addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        const fontData = evt.target.result;
                        const fontName = 'CustomFont_' + Date.now();
                        const fontFace = new FontFace(fontName, fontData);
                        
                        fontFace.load().then(function(loadedFace) {
                            document.fonts.add(loadedFace);
                            AppState.customFontFamily = fontName;
                            document.getElementById('fontStatus').style.display = 'inline';
                            UI.showToast('字体导入成功！');
                            setTimeout(Renderer.refresh, 100); 
                        }).catch(function(err) {
                            console.error(err);
                            UI.showToast('字体导入失败，请检查格式');
                        });
                    };
                    reader.readAsArrayBuffer(file);
                });

                document.querySelectorAll('.control-section:first-child .btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        if (AppState.isRecording) Exporter.stopRecording();
                        document.querySelectorAll('.control-section:first-child .btn').forEach(b => b.classList.remove('active'));
                        this.classList.add('active');
                        
                        AppState.GRID_COLS = parseInt(this.dataset.cols);
                        AppState.GRID_ROWS = parseInt(this.dataset.rows);
                        AppState.SCALE = parseInt(this.dataset.scale);
                        
                        Renderer.resizeCanvas();
                        AppState.scrollOffset = -AppState.GRID_COLS; 
                        AppState.fontSizeScale = 1.0;
                        document.getElementById('fontSizeScale').value = 100;
                        document.getElementById('sizeScaleVal').textContent = 100;
                        
                        Renderer.refresh();
                        UI.showToast(`已切换至 ${AppState.GRID_COLS * AppState.SCALE} × ${AppState.GRID_ROWS * AppState.SCALE}`);
                    });
                });

                document.getElementById('textInput').addEventListener('input', e => {
                    AppState.text = e.target.value || ' ';
                    AppState.scrollOffset = -AppState.GRID_COLS; 
                    Renderer.refresh();
                });
                
                document.querySelectorAll('.preset-text').forEach(b => b.addEventListener('click', () => {
                    document.getElementById('textInput').value = b.dataset.text;
                    AppState.text = b.dataset.text;
                    AppState.scrollOffset = -AppState.GRID_COLS;
                    Renderer.refresh();
                }));

                document.getElementById('displayMode').addEventListener('change', e => {
                    if (AppState.staticRecordTimer) {
                        clearTimeout(AppState.staticRecordTimer);
                        AppState.staticRecordTimer = null;
                    }
                    if (AppState.isRecording) Exporter.stopRecording();
                    AppState.mode = e.target.value;
                    AppState.scrollOffset = -AppState.GRID_COLS;
                    UI.updateUI();
                    Renderer.refresh();
                });

                document.getElementById('scrollSpeed').addEventListener('input', e => {
                    AppState.scrollSpeed = +e.target.value;
                    document.getElementById('speedVal').textContent = AppState.scrollSpeed;
                });

                document.getElementById('fontSizeScale').addEventListener('input', e => {
                    AppState.fontSizeScale = +e.target.value / 100;
                    document.getElementById('sizeScaleVal').textContent = Math.round(AppState.fontSizeScale * 100);
                    Renderer.refresh();
                });

                document.getElementById('threshold').addEventListener('input', e => {
                    AppState.threshold = +e.target.value;
                    document.getElementById('thresholdVal').textContent = AppState.threshold.toFixed(2);
                    Renderer.refresh();
                });

                document.getElementById('ledColor').addEventListener('input', e => {
                    AppState.ledColor = e.target.value;
                    UI.updateUI();
                    Renderer.draw();
                });
                
                document.querySelectorAll('.color-preset').forEach(p => {
                    p.addEventListener('click', () => {
                        AppState.ledColor = p.dataset.color;
                        document.getElementById('ledColor').value = AppState.ledColor;
                        UI.updateUI();
                        Renderer.draw();
                    });
                });

                // 重新播放
                document.getElementById('btnReplay').addEventListener('click', () => {
                    AppState.scrollOffset = -AppState.GRID_COLS;
                    if (AppState.mode === 'static') Renderer.draw();
                    else Renderer.start();
                    UI.showToast('🔄 重新开始播放');
                });

                document.getElementById('btnSaveImg').addEventListener('click', Exporter.saveImage);
                document.getElementById('btnRecord').addEventListener('click', Exporter.startRecording);

                UI.updateUI();
                Renderer.refresh();
            }
        };

        // 启动应用
        UI.init();
