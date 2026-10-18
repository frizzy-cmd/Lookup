const originalFetch = window.fetch;
window.fetch = async function(...args) {
    const res = await originalFetch.apply(this, args);
    
    if (typeof args[0] === 'string' && args[0].startsWith('/api/') && res.status === 429) {
        const container = document.getElementById('resultContainer');
        if (container) {
            container.innerHTML = `
                <div class="video-card" style="border: 2px solid #ff0000; padding: 15px; text-align: center;">
                    <h3 style="margin: 0; color: #ff0000;">You are being rate limited. (429)</h3>
                    <p style="font-size: 9.5pt; color: #aaa; margin-top: 8px;">Slow the hell down. I detected too many requests from your IP</p>
                </div>
            `;
        }
    }
    
    return res;
};

// replaced
// btw server still blocks you this is just to tell you that you fucked up