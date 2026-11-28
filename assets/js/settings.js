// settings.js v1.0.4-beta
(() => {
    const initializeSettings = () => {
        const modal = document.getElementById('settingModal');
        const openButton = document.getElementById('btnOpenSettings')
            || document.getElementById('btnSettings');

        if (!modal) {
            console.warn('[settings.js v1.0.4-beta] 未找到弹窗元素 #settingModal，设置功能无法打开。');
        }
        if (!openButton) {
            console.warn('[settings.js v1.0.4-beta] 未找到设置按钮 #btnOpenSettings（或兼容按钮 #btnSettings）。');
        }
        if (!modal || !openButton) return;

        // 先移除旧监听，避免重复初始化或多次绑定导致弹窗异常。
        if (openButton.dataset.settingsListenerAttached === 'true') {
            openButton.removeEventListener('click', openButton.__settingsOpenHandler);
        }

        const openModal = () => {
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-open');

            const closeButton = document.getElementById('btnCloseSettings');
            if (closeButton) closeButton.setAttribute('aria-label', 'Close settings');

            const regionSelect = document.getElementById('regionSelect');
            if (regionSelect) regionSelect.focus();
        };

        openButton.__settingsOpenHandler = openModal;
        openButton.dataset.settingsListenerAttached = 'true';
        openButton.addEventListener('click', openModal);

        // 弹窗内部关闭逻辑：依赖 index.html 中已有的基础弹窗骨架。
        const closeModal = () => {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
            openButton.focus();
        };

        const closeButton = document.getElementById('btnCloseSettings');
        const cancelButton = document.getElementById('btnCancelSettings');

        [closeButton, cancelButton].forEach(button => {
            if (!button) return;
            if (button.__settingsCloseHandler) {
                button.removeEventListener('click', button.__settingsCloseHandler);
            }
            button.__settingsCloseHandler = closeModal;
            button.addEventListener('click', closeModal);
        });

        if (modal.__settingsBackdropHandler) {
            modal.removeEventListener('click', modal.__settingsBackdropHandler);
        }
        modal.__settingsBackdropHandler = event => {
            if (event.target === modal) closeModal();
        };
        modal.addEventListener('click', modal.__settingsBackdropHandler);

        if (document.__settingsEscapeHandler) {
            document.removeEventListener('keydown', document.__settingsEscapeHandler);
        }
        document.__settingsEscapeHandler = event => {
            if (event.key === 'Escape' && modal.classList.contains('open')) closeModal();
        };
        document.addEventListener('keydown', document.__settingsEscapeHandler);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSettings, { once: true });
    } else {
        initializeSettings();
    }
})();
