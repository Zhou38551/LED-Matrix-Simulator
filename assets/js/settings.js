(() => {
    const STORAGE_KEY = 'ledMatrixRegion';
    const HANDLER_KEY = '__ledMatrixSettingsHandlers';
    const OBSERVER_KEY = '__ledMatrixSettingsObserver';
    const regionLanguages = Object.freeze({
        'china-mainland': 'zh-CN',
        'china-hmt': 'zh-TW',
        uk: 'en',
        usa: 'en',
    });

    const messages = {
        'zh-CN': {
            title: 'LED 点阵 · 多比例', subtitle: '长文本自适应 · 物理级边界居中 · 完美循环', settings: '⚙ 设置', total: '总计:', pixels: '像素', scroll: '◀ 自动滚动中', static: '⏸ 静态显示',
            panel: '📏 屏幕比例', standard: '1280 × 160 标准屏', wide: '384 × 16 超宽屏 (HZK16)', fontText: '🔤 字体与文字', upload: '导入自定义字体 (.ttf / .otf / .woff)', loaded: '已加载', placeholder: '输入文字...', presetHello: '你好 世界', presetNext: '下一站：科技园', presetLike: '点赞👍',
            display: '📺 显示设置', mode: '模式', staticMode: '静态居中', scrollMode: '公交滚动', speed: '滚动速度', style: '🔤 像素样式', scale: '缩放', threshold: '阈值', color: '🎨 LED 颜色', custom: '自定义', presets: '预设', export: '🎬 控制与导出', replay: '🔄 重新播放', saveImage: '📸 保存图片', record: '🔴 录制视频', stopRecord: '⏹ 停止录制',
            footer: 'LED Matrix Simulator · beta 1.0.1 · 开源项目', dialogTitle: '地区设置', region: '地区', cancel: '取消', save: '保存', close: '关闭设置',
            toastImage: '📸 图片已保存', toastReplay: '🔄 重新开始播放', toastFontOk: '字体导入成功！', toastFontFail: '字体导入失败，请检查格式', toastRecordEnd: '录制结束，视频下载中...', toastUnsupported: '您的浏览器不支持视频录制，请使用 Chrome 或 Edge', toastRecordFail: '无法创建视频录制器:', toastRecordStart: '开始录制，滚动完一次将自动保存...', toastSwitched: '已切换至',
        },
        'zh-TW': {
            title: 'LED 點陣 · 多比例', subtitle: '長文字自適應 · 物理級邊界置中 · 完美循環', settings: '⚙ 設定', total: '總計:', pixels: '像素', scroll: '◀ 自動捲動中', static: '⏸ 靜態顯示',
            panel: '📏 螢幕比例', standard: '1280 × 160 標準屏', wide: '384 × 16 超寬屏 (HZK16)', fontText: '🔤 字型與文字', upload: '匯入自訂字型 (.ttf / .otf / .woff)', loaded: '已載入', placeholder: '輸入文字...', presetHello: '你好 世界', presetNext: '下一站：科技園', presetLike: '按讚👍',
            display: '📺 顯示設定', mode: '模式', staticMode: '靜態置中', scrollMode: '公車捲動', speed: '捲動速度', style: '🔤 像素樣式', scale: '縮放', threshold: '閾值', color: '🎨 LED 顏色', custom: '自訂', presets: '預設', export: '🎬 控制與匯出', replay: '🔄 重新播放', saveImage: '📸 儲存圖片', record: '🔴 錄製影片', stopRecord: '⏹ 停止錄製',
            footer: 'LED Matrix Simulator · beta 1.0.1 · 開源專案', dialogTitle: '地區設定', region: '地區', cancel: '取消', save: '儲存', close: '關閉設定',
            toastImage: '📸 圖片已儲存', toastReplay: '🔄 重新開始播放', toastFontOk: '字型匯入成功！', toastFontFail: '字型匯入失敗，請檢查格式', toastRecordEnd: '錄製結束，影片下載中...', toastUnsupported: '您的瀏覽器不支援影片錄製，請使用 Chrome 或 Edge', toastRecordFail: '無法建立影片錄製器:', toastRecordStart: '開始錄製，捲動完一次將自動儲存...', toastSwitched: '已切換至',
        },
        en: {
            title: 'LED Matrix · Multi-Size', subtitle: 'Long-text fit · precise centering · seamless looping', settings: '⚙ Settings', total: 'Total:', pixels: 'pixels', scroll: '◀ Scrolling', static: '⏸ Static display',
            panel: '📏 Panel Size', standard: '1280 × 160 Standard', wide: '384 × 16 Ultra-wide (HZK16)', fontText: '🔤 Font & Text', upload: 'Import custom font (.ttf / .otf / .woff)', loaded: 'Loaded', placeholder: 'Enter text...', presetHello: 'Hello World', presetNext: 'Next stop: Tech Park', presetLike: 'Like 👍',
            display: '📺 Display Settings', mode: 'Mode', staticMode: 'Static center', scrollMode: 'Scrolling', speed: 'Scroll speed', style: '🔤 Pixel Style', scale: 'Scale', threshold: 'Threshold', color: '🎨 LED Color', custom: 'Custom', presets: 'Presets', export: '🎬 Controls & Export', replay: '🔄 Replay', saveImage: '📸 Save Image', record: '🔴 Record Video', stopRecord: '⏹ Stop Recording',
            footer: 'LED Matrix Simulator · beta 1.0.1 · Open Source', dialogTitle: 'Region Settings', region: 'Region', cancel: 'Cancel', save: 'Save', close: 'Close settings',
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

        // If initialization is ever invoked again, remove the old handlers/observer first.
        const previous = window[HANDLER_KEY];
        if (previous) previous.forEach(([element, type, handler]) => element.removeEventListener(type, handler));
        if (window[OBSERVER_KEY]) window[OBSERVER_KEY].disconnect();
        const handlers = [];
        const listen = (element, type, handler) => {
            element.addEventListener(type, handler);
            handlers.push([element, type, handler]);
        };

        let currentLanguage = 'zh-CN';
        const text = (selector, value) => {
            const element = document.querySelector(selector);
            if (element && element.textContent !== value) element.textContent = value;
        };
        const leadingLabel = (selector, value) => {
            const element = document.querySelector(selector);
            if (!element) return;
            const firstText = Array.from(element.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
            if (firstText) firstText.nodeValue = `${value} `;
            else element.insertBefore(document.createTextNode(`${value} `), element.firstChild);
        };

        const getDynamicToast = (source, t) => {
            const translations = new Map([
                ['📸 图片已保存', t.toastImage], ['🔄 重新开始播放', t.toastReplay],
                ['字体导入成功！', t.toastFontOk], ['字体导入失败，请检查格式', t.toastFontFail],
                ['录制结束，视频下载中...', t.toastRecordEnd],
                ['您的浏览器不支持视频录制，请使用 Chrome 或 Edge', t.toastUnsupported],
                ['开始录制，滚动完一次将自动保存...', t.toastRecordStart],
            ]);
            if (translations.has(source)) return translations.get(source);
            if (source.startsWith('已切换至 ')) return `${t.toastSwitched} ${source.slice('已切换至 '.length)}`;
            if (source.startsWith('无法创建视频录制器:')) return `${t.toastRecordFail} ${source.slice('无法创建视频录制器:'.length).trim()}`;
            return source;
        };

        const translateDynamicElements = () => {
            const t = messages[currentLanguage];
            const status = document.getElementById('scrollStatus');
            if (status) {
                const nextStatus = status.textContent.includes('⏸') ? t.static : t.scroll;
                if (status.textContent !== nextStatus) status.textContent = nextStatus;
            }
            const record = document.getElementById('btnRecord');
            if (record) {
                const nextRecord = record.classList.contains('recording') ? t.stopRecord : t.record;
                if (record.textContent !== nextRecord) record.textContent = nextRecord;
            }
            const toast = document.getElementById('toast');
            if (toast) {
                const translated = getDynamicToast(toast.textContent, t);
                if (toast.textContent !== translated) toast.textContent = translated;
            }
        };

        const applyLanguage = language => {
            currentLanguage = messages[language] ? language : 'zh-CN';
            const t = messages[currentLanguage];
            document.documentElement.lang = currentLanguage;
            document.title = currentLanguage === 'en' ? 'LED Matrix Simulator' : currentLanguage === 'zh-TW' ? 'LED 點陣 · 開源模組化版' : 'LED点阵 · 开源模块化版';
            text('.header h1', t.title);
            text('.header .subtitle', t.subtitle);
            text('#btnSettings', t.settings);
            text('#totalLabel', t.total);
            text('#pixelsLabel', t.pixels);

            const headings = [t.panel, t.fontText, t.display, t.style, t.color, t.export];
            document.querySelectorAll('.control-section .section-title').forEach((element, index) => {
                if (headings[index] && element.textContent !== headings[index]) element.textContent = headings[index];
            });
            const sizeButtons = document.querySelectorAll('.control-section:first-child .btn');
            if (sizeButtons[0]) text('.control-section:first-child .btn:nth-child(1)', t.standard);
            if (sizeButtons[1]) text('.control-section:first-child .btn:nth-child(2)', t.wide);
            leadingLabel('label[for="fontUpload"]', t.upload);
            text('#fontStatus', t.loaded);
            const input = document.getElementById('textInput');
            if (input) input.placeholder = t.placeholder;
            const presetButtons = document.querySelectorAll('.preset-text');
            const presetTexts = [t.presetHello, 'HELLO', t.presetNext, t.presetLike];
            const presetValues = [currentLanguage === 'en' ? 'Hello World' : '你好 世界', 'HELLO', currentLanguage === 'en' ? 'Next stop: Tech Park' : '下一站：科技园', currentLanguage === 'en' ? 'Like 👍' : '点赞👍'];
            presetButtons.forEach((button, index) => {
                if (presetTexts[index]) button.textContent = presetTexts[index];
                if (presetValues[index]) button.dataset.text = presetValues[index];
            });
            leadingLabel('label[for="displayMode"]', t.mode);
            const modes = document.querySelectorAll('#displayMode option');
            if (modes[0]) text('#displayMode option[value="static"]', t.staticMode);
            if (modes[1]) text('#displayMode option[value="scroll"]', t.scrollMode);
            leadingLabel('#scrollOpts label', t.speed);
            leadingLabel('label[for="fontSizeScale"]', t.scale);
            leadingLabel('label[for="threshold"]', t.threshold);
            leadingLabel('label[for="ledColor"]', t.custom);
            text('#presetsLabel', t.presets);
            text('#btnReplay', t.replay);
            text('#btnSaveImg', t.saveImage);
            text('.app-footer', t.footer);
            text('#settingTitle', t.dialogTitle);
            leadingLabel('label[for="regionSelect"]', t.region);
            text('#btnCancelSettings', t.cancel);
            text('#btnSaveSettings', t.save);
            closeButton.setAttribute('aria-label', t.close);
            translateDynamicElements();
        };

        const openModal = () => { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('modal-open'); regionSelect.focus(); };
        const closeModal = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.classList.remove('modal-open'); openButton.focus(); };
        const applySelectedRegion = () => {
            try { localStorage.setItem(STORAGE_KEY, regionSelect.value); } catch (error) { console.warn('Unable to save region preference:', error); }
            applyLanguage(regionLanguages[regionSelect.value] || 'zh-CN');
        };
        const onBackdropClick = event => { if (event.target === modal) closeModal(); };
        const onKeydown = event => { if (event.key === 'Escape' && modal.classList.contains('open')) closeModal(); };
        listen(openButton, 'click', openModal);
        listen(closeButton, 'click', closeModal);
        listen(cancelButton, 'click', closeModal);
        listen(saveButton, 'click', () => { applySelectedRegion(); closeModal(); });
        listen(regionSelect, 'change', applySelectedRegion);
        listen(modal, 'click', onBackdropClick);
        listen(document, 'keydown', onKeydown);
        window[HANDLER_KEY] = handlers;

        try {
            const savedRegion = localStorage.getItem(STORAGE_KEY);
            if (savedRegion && Object.prototype.hasOwnProperty.call(regionLanguages, savedRegion)) regionSelect.value = savedRegion;
        } catch (error) { console.warn('Unable to read region preference:', error); }
        applyLanguage(regionLanguages[regionSelect.value] || 'zh-CN');

        // main.js changes only these dynamic strings. Translate only when their text actually differs,
        // so our own DOM updates cannot create a MutationObserver feedback loop.
        const observer = new MutationObserver(translateDynamicElements);
        ['scrollStatus', 'btnRecord', 'toast'].forEach(id => {
            const element = document.getElementById(id);
            if (element) observer.observe(element, { childList: true, characterData: true, subtree: true });
        });
        window[OBSERVER_KEY] = observer;
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSettings, { once: true });
    else initSettings();
})();
