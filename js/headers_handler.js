const headerSearchBtn = document.getElementById('headerSearchBtn');
const headerSearchInput = document.getElementById('headerSearchInput');
const container = document.getElementById('resultContainer');

let lastFetchedHeaders = null;

if (headerSearchBtn) {
    headerSearchBtn.addEventListener('click', async () => {
        if (typeof checkRateLimit === 'function' && checkRateLimit()) {
            return;
        }

        const query = headerSearchInput.value.trim();
        if (!query) return;

        container.innerHTML = '<p>Examining headers...</p>';

        try {
            const res = await fetch(`/api/headers?url=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error('Failed to fetch headers');

            const data = await res.json();
            lastFetchedHeaders = data;

            const statusColor = data.status >= 200 && data.status < 300 ? '#00ff00' : '#ff0000';

            let headersListHtml = '';
            for (const [key, value] of Object.entries(data.headers)) {
                headersListHtml += `<div style="font-size: 9pt; padding: 4px 0; border-bottom: 1px solid #333; word-break: break-all;"><span style="color: #ffe700;">${key}:</span> ${value}</div>`;
            }

            container.innerHTML = `
                <div class="video-card" style="display: flex; flex-direction: column; gap: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <h3 style="margin: 0; color: ${statusColor};">${data.status} ${data.statusText}</h3>
                            <p style="margin: 2px 0 0 0; font-size: 9pt; color: #aaa;">target: ${data.url}</p>
                        </div>
                        <button id="exportHeadersTxtBtn" class="btn-action" style="font-size: 8pt; padding: 6px 12px;">Export as .txt</button>
                    </div>

                    <div style="border: 1px solid #fff; padding: 10px; max-height: 300px; overflow-y: auto; background: #111;">
                        ${headersListHtml || '<span style="color: #888;">No headers returned</span>'}
                    </div>
                </div>
            `;

            document.getElementById('exportHeadersTxtBtn').addEventListener('click', () => {
                if (!lastFetchedHeaders) return;

                let headersDump = '';
                for (const [k, v] of Object.entries(lastFetchedHeaders.headers)) {
                    headersDump += `${k}: ${v}\n`;
                }

                const txtContent = `--- Lookup [HTTP headers] | Made by nightregion @ lookup.teaa.workers.dev ---
URL: ${lastFetchedHeaders.url}
Status: ${lastFetchedHeaders.status} ${lastFetchedHeaders.statusText}

Headers:
${headersDump}
---------------------------------------------------`;

                const blob = new Blob([txtContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${query.replace(/[^a-z0-9]/gi, '_')}_headers.txt`;
                a.click();
                URL.revokeObjectURL(url);
            });

        } catch (err) {
            container.innerHTML = `<p style="color: #ff0000;">err: failed to fetch headers or invalid url</p>`;
        }
    });
}