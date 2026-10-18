document.addEventListener('DOMContentLoaded', () => {
    const hoverSfx = new Audio('sfx/hover.wav');
    const selectSfx = new Audio('sfx/select.wav');
    const exportSfx = new Audio('sfx/export.wav');

    hoverSfx.volume = 0.2;
    selectSfx.volume = 0.3;
    exportSfx.volume = 0.4;

    let lastHoverTime = 0;

    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('button, .btn-action, a');
        if (target) {
            const now = Date.now();
            if (now - lastHoverTime > 80) {
                hoverSfx.currentTime = 0;
                hoverSfx.play().catch(() => {});
                lastHoverTime = now;
            }
        }
    });

    // sfx/export.wav
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, .btn-action, a');
        if (target) {
            // check if it's an export button
            if (target.id && target.id.toLowerCase().includes('export')) {
                exportSfx.currentTime = 0;
                exportSfx.play().catch(() => {});
            } else {
                selectSfx.currentTime = 0;
                selectSfx.play().catch(() => {});
            }
        }
    });
});