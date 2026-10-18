const mcSearchBtn = document.getElementById('mcSearchBtn');
const mcSearchInput = document.getElementById('mcSearchInput');
const container = document.getElementById('resultContainer');

let lastFetchedMcData = null;

if (mcSearchBtn) {
    mcSearchBtn.addEventListener('click', async () => {
        if (typeof checkRateLimit === 'function' && checkRateLimit()) {
            return;
        }

        const query = mcSearchInput.value.trim();
        if (!query) return;

        container.innerHTML = '<p>Pinging server...</p>';

        try {
            const res = await fetch(`/api/minecraft/${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error('Failed to fetch server status');
            
            const data = await res.json();
            lastFetchedMcData = data;

            if (!data.online) {
                container.innerHTML = `
                    <div class="video-card" style="display: flex; flex-direction: column; gap: 10px;">
                        <h3 style="margin: 0; color: #ff0000;">Server is offline or unreachable</h3>
                        <p style="font-size: 9.5pt; color: #aaa;">ip: ${query}</p>
                    </div>
                `;
                return;
            }

            const iconHtml = data.icon ? `<img src="${data.icon}" style="width: 64px; height: 64px; image-rendering: pixelated; border: 2px solid #fff;" alt="server icon">` : '';
            const motdClean = data.motd?.clean ? data.motd.clean.join('\n') : 'No motd';
            
            const playersOnline = data.players?.online ?? 0;
            const playersMax = data.players?.max ?? 0;
            const version = data.version || 'Unknown';
            const software = data.software || 'Vanilla/unknown';

            container.innerHTML = `
                <div class="video-card" style="display: flex; flex-direction: column; gap: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            ${iconHtml}
                            <div>
                                <h3 style="margin: 0; color: #00ff00;">Online</h3>
                                <p style="margin: 2px 0 0 0; font-size: 9pt; color: #aaa;">ip: ${data.ip}:${data.port || 25565}</p>
                            </div>
                        </div>
                        <button id="exportMcTxtBtn" class="btn-action" style="font-size: 8pt; padding: 6px 12px;">Export as .txt</button>
                    </div>

                    <div style="border: 1px solid #444; padding: 10px; background: #111; font-family: monospace; font-size: 9pt; white-space: pre-wrap; color: #ffe700;">${motdClean}</div>

                    <div style="border: 1px solid #fff; padding: 10px; font-size: 9.5pt; display: flex; flex-direction: column; gap: 6px;">
                        <div><strong>Players:</strong> ${playersOnline} / ${playersMax}</div>
                        <div><strong>Version:</strong> ${version}</div>
                        <div><strong>Software:</strong> ${software}</div>
                        <div><strong>Protocol:</strong> ${data.protocol?.version ?? 'N/A'}</div>
                    </div>
                </div>
            `;

            document.getElementById('exportMcTxtBtn').addEventListener('click', () => {
                if (!lastFetchedMcData) return;

                const txtContent = `--- Lookup [Minecraft server] | Made by Nightregion @ lookup.teaa.workers.dev ---
IP: ${lastFetchedMcData.ip}:${lastFetchedMcData.port || 25565}
Status: Online
Players: ${lastFetchedMcData.players?.online}/${lastFetchedMcData.players?.max}
Version: ${lastFetchedMcData.version}
Software: ${lastFetchedMcData.software || 'Unknown'}.
Protocol: ${lastFetchedMcData.protocol?.version ?? 'N/A'}

MOTD:
${lastFetchedMcData.motd?.clean ? lastFetchedMcData.motd.clean.join('\n') : 'none'}
--------------------------`;

                const blob = new Blob([txtContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${query.replace(/[^a-z0-9]/gi, '_')}_minecraft_server.txt`;
                a.click();
                URL.revokeObjectURL(url);
            });

        } catch (err) {
            container.innerHTML = `<p style="color: #ff0000;">Error: Failed to query server status</p>`;
        }
    });
}