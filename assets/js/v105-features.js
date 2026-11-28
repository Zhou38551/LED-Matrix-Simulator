(() => {
    'use strict';

    const ACCEPT_KEY = 'ledMatrixEulaAccepted';
    const DECLINED_KEY = 'ledMatrixEulaDeclined';
    const HANGZHOU_TEMPLATES = [
        '下一站：龙翔桥',
        '本次列车开往 湘湖',
        '本次列车开往 临平',
        '欢迎乘坐杭州地铁1号线'
    ];
    const copy = {
        en: { view: 'View EULA', title: 'End-User License Agreement', accept: 'Accept', decline: 'Decline', panel: '128 × 16 · Hangzhou Metro', loading: 'Loading EULA…', error: 'Could not load EULA.md.', eulaText: 'End-User License Agreement' },
        zh: { view: '查看使用条款', title: '最终用户使用许可协议', accept: 'Accept', decline: 'Decline', panel: '128 × 16 · 杭州地铁', loading: '正在加载使用条款…', error: '无法加载 EULA.md。', eulaText: '最终用户使用许可协议' },
        tw: { view: '查看使用條款', title: '最終使用者使用授權協議', accept: 'Accept', decline: 'Decline', panel: '128 × 16 · 杭州地鐵', loading: '正在載入使用條款…', error: '無法載入 EULA.md。', eulaText: '最終使用者使用授權協議' }
    };
    const locale = () => document.documentElement.lang === 'zh-CN' ? 'zh' : document.documentElement.lang === 'zh-TW' ? 'tw' : 'en';
    const words = () => copy[locale()];

    const markdownToSafeHtml = markdown => {
        const escape = value => value.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
        return markdown.split(/\r?\n/).map(line => {
            const trimmed = line.trim();
            if (!trimmed) return '';
            if (trimmed.startsWith('### ')) return `<h3>${escape(trimmed.slice(4))}</h3>`;
            if (trimmed.startsWith('## ')) return `<h2>${escape(trimmed.slice(3))}</h2>`;
            if (trimmed.startsWith('# ')) return `<h1>${escape(trimmed.slice(2))}</h1>`;
            if (trimmed.startsWith('> ')) return `<blockquote>${escape(trimmed.slice(2))}</blockquote>`;
            if (trimmed.startsWith('- ')) return `<p>• ${escape(trimmed.slice(2))}</p>`;
            return `<p>${escape(trimmed)}</p>`;
        }).join('');
    };

    const init = () => {
        if (document.getElementById('v105-eula-modal')) return;
        const style = document.createElement('style');
        style.textContent = `
          #v105-eula-modal{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.92)}
          #v105-eula-modal.open{display:flex}#v105-eula-modal .eula-box{width:min(760px,100%);height:min(88vh,900px);display:flex;flex-direction:column;background:#15152a;color:#e8e8f0;border:1px solid #ff4a4a;border-radius:0}
          #v105-eula-modal .eula-heading{padding:14px 18px;border-bottom:1px solid #38384f}#v105-eula-modal .eula-heading h2{font-size:1rem}
          #v105-eula-modal .eula-content{overflow:auto;padding:18px;line-height:1.65}#v105-eula-modal .eula-content h1,#v105-eula-modal .eula-content h2,#v105-eula-modal .eula-content h3{margin:1em 0 .45em;color:#ffb36b}
          #v105-eula-modal .eula-content p{margin:.5em 0}#v105-eula-modal .eula-content blockquote{margin:.6em 0;padding:.5em .8em;border-left:3px solid #ff4a4a;background:#202038}
          #v105-eula-modal .eula-actions{display:flex;justify-content:flex-end;gap:10px;padding:14px 18px;border-top:1px solid #38384f}
          #v105-eula-modal .eula-actions button{border-radius:0;padding:8px 18px;cursor:pointer;font-weight:700}#v105-eula-modal #v105-accept{background:#ff3b3b;border:1px solid #ff3b3b;color:white}#v105-eula-modal #v105-decline{background:transparent;border:1px solid #777;color:#eee}
          #v105-lock{position:fixed;inset:0;z-index:2147483646;display:none;background:transparent}#v105-lock.active{display:block}.v105-panel-button{margin:4px 5px 4px 0}
        `;
        document.head.appendChild(style);
        const modal = document.createElement('section');
        modal.id = 'v105-eula-modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'v105-eula-title');
        modal.innerHTML = `<div class="eula-box"><header class="eula-heading"><h2 id="v105-eula-title"></h2></header><article class="eula-content" id="v105-eula-content"></article><footer class="eula-actions"><button id="v105-decline" type="button"></button><button id="v105-accept" type="button"></button></footer></div>`;
        document.body.appendChild(modal);
        const lock = document.createElement('div'); lock.id = 'v105-lock'; lock.setAttribute('aria-hidden', 'true'); document.body.appendChild(lock);
        let readingOnly = false;
        let declined = false;

        const refreshLabels = () => {
            const w = words();
            document.getElementById('v105-eula-title').textContent = w.title;
            document.getElementById('v105-accept').textContent = w.accept;
            document.getElementById('v105-decline').textContent = w.decline;
            const view = document.getElementById('v105-view-eula'); if (view) view.textContent = w.view;
            const panel = document.getElementById('v105-hangzhou-panel'); if (panel) panel.textContent = w.panel;
            const footer = document.getElementById('appVersion');
            if (footer) footer.textContent = locale() === 'en' ? 'LED Matrix Simulator · v1.0.5-beta · Open Source' : 'LED Matrix Simulator · v1.0.5-beta · 开源项目';
            const settingTitle = document.getElementById('settingTitle'); if (settingTitle) settingTitle.textContent = 'Settings · v1.0.5-beta';
        };
        const loadDocument = async () => {
            const content = document.getElementById('v105-eula-content');
            content.textContent = words().loading;
            try {
                const response = await fetch(new URL('EULA.md', document.baseURI));
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                content.innerHTML = markdownToSafeHtml(await response.text());
            } catch (error) {
                content.textContent = words().error;
                console.warn('[EULA] Could not load EULA.md:', error);
            }
        };
        const openEula = readOnly => {
            readingOnly = !!readOnly;
            refreshLabels();
            modal.classList.add('open');
            loadDocument();
        };
        document.getElementById('v105-accept').addEventListener('click', () => {
            if (readingOnly) { modal.classList.remove('open'); return; }
            try { localStorage.setItem(ACCEPT_KEY, 'true'); localStorage.removeItem(DECLINED_KEY); } catch (_) {}
            declined = false; lock.classList.remove('active'); modal.classList.remove('open');
        });
        document.getElementById('v105-decline').addEventListener('click', () => {
            if (readingOnly) { modal.classList.remove('open'); return; }
            declined = true;
            try { localStorage.setItem(DECLINED_KEY, 'true'); localStorage.removeItem(ACCEPT_KEY); } catch (_) {}
            lock.classList.add('active'); modal.classList.remove('open');
        });
        modal.addEventListener('click', event => { if (event.target === modal) event.preventDefault(); });

        const ensureAboutButton = () => {
            const about = document.querySelector('.v104-about');
            if (about && !document.getElementById('v105-view-eula')) {
                const button = document.createElement('button');
                button.id = 'v105-view-eula'; button.type = 'button'; button.className = 'btn btn-outline v105-panel-button';
                button.textContent = words().view;
                button.addEventListener('click', () => openEula(true));
                about.appendChild(button);
            }
        };
        ensureAboutButton();
        new MutationObserver(() => { ensureAboutButton(); refreshLabels(); }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['lang'] });

        const panelSection = Array.from(document.querySelectorAll('.control-section')).find(section => section.querySelector('#sectionPanel'));
        const panelRow = panelSection && panelSection.querySelector('.control-row');
        if (panelRow && !document.getElementById('v105-hangzhou-panel')) {
            const button = document.createElement('button');
            button.id = 'v105-hangzhou-panel'; button.type = 'button'; button.className = 'btn btn-outline v105-panel-button';
            button.dataset.cols = '128'; button.dataset.rows = '16'; button.dataset.scale = '4'; button.textContent = words().panel;
            panelRow.appendChild(button);
            button.addEventListener('click', () => {
                if (AppState.isRecording && window.Exporter) Exporter.stopRecording();
                document.querySelectorAll('.control-section:first-child .btn[data-cols], .control-section .v105-panel-button[data-cols]').forEach(item => item.classList.remove('active'));
                button.classList.add('active');
                AppState.GRID_COLS = 128; AppState.GRID_ROWS = 16; AppState.SCALE = 4;
                Renderer.resizeCanvas(); AppState.scrollOffset = -AppState.GRID_COLS; AppState.fontSizeScale = 1;
                const scale = document.getElementById('fontSizeScale'); if (scale) scale.value = 100;
                const scaleValue = document.getElementById('sizeScaleVal'); if (scaleValue) scaleValue.textContent = '100';
                Renderer.refresh();
                if (window.UI) UI.showToast('128 × 16 · Hangzhou Metro');
            });
        }

        const setHangzhouTemplates = () => {
            const region = document.getElementById('regionSelect');
            const isMainland = !region || region.value === 'china-mainland';
            document.querySelectorAll('.v105-hangzhou-templates').forEach(element => element.remove());
            if (!isMainland) return;
            const anchors = document.querySelectorAll('.preset-text');
            const container = anchors.length ? anchors[0].parentElement : null;
            if (!container) return;
            const group = document.createElement('span'); group.className = 'v105-hangzhou-templates';
            HANGZHOU_TEMPLATES.forEach(value => {
                const template = document.createElement('button'); template.type = 'button'; template.className = 'btn btn-outline preset-text v105-panel-button'; template.dataset.text = value; template.textContent = value;
                template.addEventListener('click', () => {
                    const input = document.getElementById('textInput'); if (input) input.value = value;
                    AppState.text = value; AppState.scrollOffset = -AppState.GRID_COLS; Renderer.refresh();
                });
                group.appendChild(template);
            });
            container.appendChild(group);
        };
        setHangzhouTemplates();
        document.addEventListener('change', event => { if (event.target.id === 'regionSelect') setHangzhouTemplates(); });

        let accepted = false;
        try { accepted = localStorage.getItem(ACCEPT_KEY) === 'true'; declined = localStorage.getItem(DECLINED_KEY) === 'true'; } catch (_) {}
        if (!accepted) {
            if (declined) lock.classList.add('active');
            else openEula(false);
        }
        refreshLabels();
        window.__ledMatrixV105 = { openEula: () => openEula(true), get declined() { return declined; } };
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
