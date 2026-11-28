(() => {
    const STORAGE_KEY = 'ledMatrixRegion';
    const CONTROLLER_KEY = '__ledMatrixLocaleController';
    const regionLanguages = Object.freeze({
        'china-mainland': 'zh-CN',
        'china-hmt': 'zh-TW',
        uk: 'en',
        usa: 'en',
    });
    const translations = {
        'zh-CN': {
            title: 'LED 点阵 · 多比例', subtitle: '长文本自适应 · 物理级边界居中 · 完美循环', settings: '⚙ 设置', total: '总计:', pixels: '像素', scroll: '◀ 自动滚动中', static: '⏸ 静态显示',
            panel: '📏 屏幕比例', standard: '1280 × 160 标准屏', wide: '384 × 16 超宽屏 (HZK16)', fontText: '🔤 字体与文字', upload: '导入自定义字体 (.ttf / .otf / .woff)', loaded: '已加载', placeholder: '输入文字...', presetHello: '你好 世界', presetNext: '下一站：科技园', presetLike: '点赞👍',
            display: '📺 显示设置', mode: '模式', staticMode: '静态居中', scrollMode: '公交滚动', speed: '滚动速度', style: '🔤 像素样式', scale: '缩放', threshold: '阈值', color: '🎨 LED 颜色', custom: '自定义', presets: '预设', export: '🎬 控制与导出', replay: '🔄 重新播放', saveImage: '📸 保存图片', record: '🔴 录制视频', stopRecord: '⏹ 停止录制',
            footer: 'LED Matrix Simulator · beta 1.0.3 · 开源项目', dialogTitle: '地区设置', region: '地区', cancel: '取消', save: '保存', close: '关闭设置',
            toastImage: '📸 图片已保存', toastReplay: '🔄 重新开始播放', toastFontOk: '字体导入成功！', toastFontFail: '字体导入失败，请检查格式', toastRecordEnd: '录制结束，视频下载中...', toastUnsupported: '您的浏览器不支持视频录制，请使用 Chrome 或 Edge', toastRecordFail: '无法创建视频录制器:', toastRecordStart: '开始录制，滚动完一次将自动保存...', toastSwitched: '已切换至',
        },
        'zh-TW': {
            title: 'LED 點陣 · 多比例', subtitle: '長文字自適應 · 物理級邊界置中 · 完美循環', settings: '⚙ 設定', total: '總計:', pixels: '像素', scroll: '◀ 自動捲動中', static: '⏸ 靜態顯示',
            panel: '📏 螢幕比例', standard: '1280 × 160 標準屏', wide: '384 × 16 超寬屏 (HZK16)', fontText: '🔤 字型與文字', upload: '匯入自訂字型 (.ttf / .otf / .woff)', loaded: '已載入', placeholder: '輸入文字...', presetHello: '你好 世界', presetNext: '下一站：科技園', presetLike: '按讚👍',
            display: '📺 顯示設定', mode: '模式', staticMode: '靜態置中', scrollMode: '公車捲動', speed: '捲動速度', style: '🔤 像素樣式', scale: '縮放', threshold: '閾值', color: '🎨 LED 顏色', custom: '自訂', presets: '預設', export: '🎬 控制與匯出', replay: '🔄 重新播放', saveImage: '📸 儲存圖片', record: '🔴 錄製影片', stopRecord: '⏹ 停止錄製',
            footer: 'LED Matrix Simulator · beta 1.0.3 · 開源專案', dialogTitle: '地區設定', region: '地區', cancel: '取消', save: '儲存', close: '關閉設定',
            toastImage: '📸 圖片已儲存', toastReplay: '🔄 重新開始播放', toastFontOk: '字型匯入成功！', toastFontFail: '字型匯入失敗，請檢查格式', toastRecordEnd: '錄製結束，影片下載中...', toastUnsupported: '您的瀏覽器不支援影片錄製，請使用 Chrome 或 Edge', toastRecordFail: '無法建立影片錄製器:', toastRecordStart: '開始錄製，捲動完一次將自動儲存...', toastSwitched: '已切換至',
        },
        en: {
            title: 'LED Matrix · Multi-Size', subtitle: 'Long-text fit · precise centering · seamless looping', settings: '⚙ Settings', total: 'Total:', pixels: 'pixels', scroll: '◀ Scrolling', static: '⏸ Static display',
            panel: '📏 Panel Size', standard: '1280 × 160 Standard', wide: '384 × 16 Ultra-wide (HZK16)', fontText: '🔤 Font & Text', upload: 'Import custom font (.ttf / .otf / .woff)', loaded: 'Loaded', placeholder: 'Enter text...', presetHello: 'Hello World', presetNext: 'Next stop: Tech Park', presetLike: 'Like 👍',
            display: '📺 Display Settings', mode: 'Mode', staticMode: 'Static center', scrollMode: 'Scrolling', speed: 'Scroll speed', style: '🔤 Pixel Style', scale: 'Scale', threshold: 'Threshold', color: '🎨 LED Color', custom: 'Custom', presets: 'Presets', export: '🎬 Controls & Export', replay: '🔄 Replay', saveImage: '📸 Save Image', record: '🔴 Record Video', stopRecord: '⏹ Stop Recording',
            footer: 'LED Matrix Simulator · beta 1.0.3 · Open Source', dialogTitle: 'Region Settings', region: 'Region', cancel: 'Cancel', save: 'Save', close: 'Close settings',
            toastImage: '📸 Image saved', toastReplay: '🔄 Playback restarted', toastFontOk: 'Font imported successfully!', toastFontFail: 'Font import failed. Check the file format.', toastRecordEnd: 'Recording finished. Downloading video...', toastUnsupported: 'Video recording is not supported. Please use Chrome or Edge.', toastRecordFail: 'Unable to create video recorder:', toastRecordStart: 'Recording started. It will save after one full scroll...', toastSwitched: 'Switched to',
        },
    };

    const initSettings = () => {
        const modal = document.getElementById('settingModal');
        const openButton = document.getElementById('btnSettings');
        const closeButton = document.getElementById('btnCloseSettings');
        const cancelButton = document.getElementById('btnCancelSettings');
        const saveButton = document.getElementById('btnSaveSettings');
        const regionSelect = document.getElementById('regionSelect');
        if (!modal || !openButton || !closeButton || !cancelButton || !saveButton || !regionSelect) return;

        // Initialization is idempotent: release a prior controller before adding listeners.
        const previous = window[CONTROLLER_KEY];
        if (previous) previous.destroy();
        const controller = new AbortController();
        let currentLanguage = 'zh-CN';
        let translatingDynamicText = false;

        const setText = (selector, value) => {
            const element = document.querySelector(selector);
            if (element && element.textContent !== value) element.textContent = value;
        };
        const setLabelPrefix = (selector, value) => {
            const element = document.querySelector(selector);
            if (!element) return;
            const node = Array.from(element.childNodes).find(child => child.nodeType === Node.TEXT_NODE);
            if (node) {
                const next = `${value} `;
                if (node.nodeValue !== next) node.nodeValue = next;
            }
        };
        const translateToast = (source, t) => {
            const exact = new Map([
                ['📸 图片已保存', t.toastImage], ['🔄 重新开始播放', t.toastReplay],
                ['字体导入成功！', t.toastFontOk], ['字体导入失败，请检查格式', t.toastFontFail],
                ['录制结束，视频下载中...', t.toastRecordEnd],
                ['您的浏览器不支持视频录制，请使用 Chrome 或 Edge', t.toastUnsupported],
                ['开始录制，滚动完一次将自动保存...', t.toastRecordStart],
            ]);
            if (exact.has(source)) return exact.get(source);
            if (source.startsWith('已切换至 ')) return `${t.toastSwitched} ${source.slice('已切换至 '.length)}`;
            if (source.startsWith('无法创建视频录制器:')) return `${t.toastRecordFail} ${source.slice('无法创建视频录制器:'.length).trim()}`;
            return source;
        };
        const updateDynamicText = () => {
            if (translatingDynamicText) return;
            translatingDynamicText = true;
            const t = translations[currentLanguage];
            const status = document.getElementById('scrollStatus');
            if (status) {
                const next = status.textContent.includes('⏸') ? t.static : t.scroll;
                if (status.textContent !== next) status.textContent = next;
            }
            const record = document.getElementById('btnRecord');
            if (record) {
                const next = record.classList.contains('recording') ? t.stopRecord : t.record;
                if (record.textContent !== next) record.textContent = next;
            }
            const toast = document.getElementById('toast');
            if (toast) {
                const next = translateToast(toast.textContent, t);
                if (toast.textContent !== next) toast.textContent = next;
            }
            translatingDynamicText = false;
        };
        const applyLanguage = language => {
            currentLanguage = translations[language] ? language : 'zh-CN';
            const t = translations[currentLanguage];
            document.documentElement.lang = currentLanguage;
            document.title = currentLanguage === 'en' ? 'LED Matrix Simulator' : currentLanguage === 'zh-TW' ? 'LED 點陣 · 開源模組化版' : 'LED点阵 · 开源模块化版';
            setText('.header h1', t.title);
            setText('.header .subtitle', t.subtitle);
            setText('#btnSettings', t.settings);
            setText('#totalLabel', t.total);
            setText('#pixelsLabel', t.pixels);
            const headingTexts = [t.panel, t.fontText, t.display, t.style, t.color, t.export];
            document.querySelectorAll('.control-section .section-title').forEach((heading, index) => {
                if (headingTexts[index] && heading.textContent !== headingTexts[index]) heading.textContent = headingTexts[index];
            });
            const sizeButtons = document.querySelectorAll('.control-section:first-child .btn');
            if (sizeButtons[0] && sizeButtons[0].textContent !== t.standard) sizeButtons[0].textContent = t.standard;
            if (sizeButtons[1] && sizeButtons[1].textContent !== t.wide) sizeButtons[1].textContent = t.wide;
            setLabelPrefix('label[for="fontUpload"]', t.upload);
            setText('#fontStatus', t.loaded);
            const input = document.getElementById('textInput');
            if (input) input.placeholder = t.placeholder;
            const presets = document.querySelectorAll('.preset-text');
            const presetNames = [t.presetHello, 'HELLO', t.presetNext, t.presetLike];
            const presetPayloads = [currentLanguage === 'en' ? 'Hello World' : '你好 世界', 'HELLO', currentLanguage === 'en' ? 'Next stop: Tech Park' : '下一站：科技园', currentLanguage === 'en' ? 'Like 👍' : '点赞👍'];
            presets.forEach((button, index) => {
                if (presetNames[index] && button.textContent !== presetNames[index]) button.textContent = presetNames[index];
                if (presetPayloads[index]) button.dataset.text = presetPayloads[index];
            });
            setLabelPrefix('label[for="displayMode"]', t.mode);
            setText('#displayMode option[value="static"]', t.staticMode);
            setText('#displayMode option[value="scroll"]', t.scrollMode);
            setLabelPrefix('#scrollOpts label', t.speed);
            setLabelPrefix('label[for="fontSizeScale"]', t.scale);
            setLabelPrefix('label[for="threshold"]', t.threshold);
            setLabelPrefix('label[for="ledColor"]', t.custom);
            setText('#presetsLabel', t.presets);
            setText('#btnReplay', t.replay);
            setText('#btnSaveImg', t.saveImage);
            setText('.app-footer', t.footer);
            setText('#settingTitle', t.dialogTitle);
            setLabelPrefix('label[for="regionSelect"]', t.region);
            setText('#btnCancelSettings', t.cancel);
            setText('#btnSaveSettings', t.save);
            closeButton.setAttribute('aria-label', t.close);
            updateDynamicText();
        };

        const closeModal = () => {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
            openButton.focus();
        };
        openButton.addEventListener('click', () => {
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-open');
            regionSelect.focus();
        }, { signal: controller.signal });
        closeButton.addEventListener('click', closeModal, { signal: controller.signal });
        cancelButton.addEventListener('click', closeModal, { signal: controller.signal });
        saveButton.addEventListener('click', () => {
            try { localStorage.setItem(STORAGE_KEY, regionSelect.value); }
            catch (error) { console.warn('Unable to save region preference:', error); }
            applyLanguage(regionLanguages[regionSelect.value] || 'zh-CN');
            closeModal();
        }, { signal: controller.signal });
        regionSelect.addEventListener('change', () => {
            try { localStorage.setItem(STORAGE_KEY, regionSelect.value); }
            catch (error) { console.warn('Unable to save region preference:', error); }
            applyLanguage(regionLanguages[regionSelect.value] || 'zh-CN');
        }, { signal: controller.signal });
        modal.addEventListener('click', event => { if (event.target === modal) closeModal(); }, { signal: controller.signal });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && modal.classList.contains('open')) closeModal();
        }, { signal: controller.signal });

        try {
            const savedRegion = localStorage.getItem(STORAGE_KEY);
            if (savedRegion && Object.prototype.hasOwnProperty.call(regionLanguages, savedRegion)) regionSelect.value = savedRegion;
        } catch (error) { console.warn('Unable to read region preference:', error); }
        applyLanguage(regionLanguages[regionSelect.value] || 'zh-CN');

        // Watch only strings that main.js changes dynamically. The update function is guarded and
        // writes only when needed, preventing observer feedback loops and repeated rendering.
        const observer = new MutationObserver(updateDynamicText);
        ['scrollStatus', 'btnRecord', 'toast'].forEach(id => {
            const element = document.getElementById(id);
            if (element) observer.observe(element, { childList: true, characterData: true, subtree: true });
        });
        controller.signal.addEventListener('abort', () => observer.disconnect(), { once: true });
        window[CONTROLLER_KEY] = { destroy() { controller.abort(); observer.disconnect(); } };
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSettings, { once: true });
    else initSettings();
})();
