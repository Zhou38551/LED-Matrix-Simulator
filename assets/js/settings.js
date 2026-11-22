(() => {
    const initSettings = () => {
        const modal = document.getElementById('settingModal');
        const openButton = document.getElementById('btnSettings');
        const closeButton = document.getElementById('btnCloseSettings');
        const cancelButton = document.getElementById('btnCancelSettings');
        const saveButton = document.getElementById('btnSaveSettings');
        const regionSelect = document.getElementById('regionSelect');

        if (!modal || !openButton || !closeButton || !cancelButton || !saveButton || !regionSelect) return;

        const openModal = () => {
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-open');
            regionSelect.focus();
        };
        const closeModal = () => {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
            openButton.focus();
        };

        openButton.addEventListener('click', openModal);
        closeButton.addEventListener('click', closeModal);
        cancelButton.addEventListener('click', closeModal);
        saveButton.addEventListener('click', () => {
            try {
                localStorage.setItem('ledMatrixRegion', regionSelect.value);
            } catch (error) {
                console.warn('Unable to save region preference:', error);
            }
            closeModal();
        });
        modal.addEventListener('click', event => {
            if (event.target === modal) closeModal();
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && modal.classList.contains('open')) closeModal();
        });

        try {
            const savedRegion = localStorage.getItem('ledMatrixRegion');
            if (savedRegion && regionSelect.querySelector(`option[value="${savedRegion}"]`)) {
                regionSelect.value = savedRegion;
            }
        } catch (error) {
            console.warn('Unable to read region preference:', error);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSettings, { once: true });
    } else {
        initSettings();
    }
})();
