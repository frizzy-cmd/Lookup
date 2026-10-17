// handles IP and domain OSINT lookups
const osintSearchBtn = document.getElementById('osintSearchBtn');
const osintSearchInput = document.getElementById('osintSearchInput');
const container = document.getElementById('resultContainer');

let lastFetchedData = null;

if (osintSearchBtn) {
    osintSearchBtn.addEventListener('click', async () => {
        if (typeof checkRateLimit === 'function' && checkRateLimit()) {
            return;
        }

        const query = osintSearchInput.value.trim();
        if (!query) return;

        container.innerHTML = '<p>Processing...</p>';
        // oooh fancy word instead of loading!

        try {
            // is ip or domain?
            // me when i see a llm call for regex lol
            const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(query) || query.includes(':');

            if (isIp) {
                // i know bro osint is so opsec
                const res = await fetch(`/api/osint/ip/${encodeURIComponent(query)}`);
                if (!res.ok) throw new Error('Failed to fetch IP data');
                const ipData = await res.json();
                lastFetchedData = { type: 'ip', data: ipData };

                // DNS html
                container.innerHTML = `
                    <div class="video-card" style="display: flex; flex-direction: column; gap: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <h3 style="margin: 0;">IP info: ${ipData.query}</h3>
                            <button id="exportOsintTxtBtn" class="btn-action" style="font-size: 8pt; padding: 6px 12px;">Export as .txt</button>
                        </div>

                        <div style="border: 1px solid #fff; padding: 10px; font-size: 9.5pt; display: flex; flex-direction: column; gap: 6px;">
                            <div><strong>Country:</strong> ${ipData.country} (${ipData.countryCode})</div>
                            <div><strong>Region:</strong> ${ipData.regionName} (${ipData.region})</div>
                            <div><strong>City:</strong> ${ipData.city}, ${ipData.zip || 'n/a'}</div>
                            <div><strong>Coordinates:</strong> ${ipData.lat}, ${ipData.lon}</div>
                            <div><strong>Timezone:</strong> ${ipData.timezone}</div>
                            <div><strong>ISP:</strong> ${ipData.isp}</div>
                            <div><strong>Organization:</strong> ${ipData.org}</div>
                            <div><strong>ASN:</strong> ${ipData.as}</div>
                        </div>
                    </div>
                `;
            } else {
                // domain
                // this fetches ip geo for root and dns rec
                const res = await fetch(`/api/osint/dns/${encodeURIComponent(query)}`);
                if (!res.ok) throw new Error('Failed to fetch DNS records');
                const dnsData = await res.json();
                lastFetchedData = { type: 'dns', data: dnsData };

                let dnsHtml = '';
                for (const [type, records] of Object.entries(dnsData.records)) {
                    const recText = records.length > 0 
                        ? records.map(r => `<div style="font-size: 9pt; padding: 2px 0; color: #ccc;">- ${r.data} (TTL: ${r.TTL})</div>`).join('')
                        : '<span style="color: #888; font-size: 9pt;">N/A</span>';

                    dnsHtml += `
                        <div style="margin-top: 10px;">
                            <p style="color: #ffe700; margin-bottom: 4px; font-size: 10pt;">${type} records:</p>
                            <div style="max-height: 100px; overflow-y: auto; border: 1px solid #444; padding: 6px;">
                                ${recText}
                            </div>
                        </div>
                    `;
                }

                container.innerHTML = `
                    <div class="video-card" style="display: flex; flex-direction: column; gap: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <h3 style="margin: 0;">Domain: ${dnsData.domain}</h3>
                            <button id="exportOsintTxtBtn" class="btn-action" style="font-size: 8pt; padding: 6px 12px;">Export as .txt</button>
                        </div>

                        ${dnsHtml}
                    </div>
                `;
            }

            document.getElementById('exportOsintTxtBtn').addEventListener('click', () => {
                if (!lastFetchedData) return;

                let txtContent = '';
                if (lastFetchedData.type === 'ip') {
                    const d = lastFetchedData.data;
                    txtContent = `--- Lookup [IP] | Made by Nightregion @ lookup.teaa.workers.dev ---
IP: ${d.query}
Country: ${d.country} (${d.countryCode})
Region: ${d.regionName}
City: ${d.city}, ${d.zip}
Coordinates: ${d.lat}, ${d.lon}
Timezone: ${d.timezone}
ISP: ${d.isp}
Organization: ${d.org}
ASN: ${d.as}
---------------------`;
                } else {
                    const d = lastFetchedData.data;
                    let recordsDump = '';
                    for (const [type, recs] of Object.entries(d.records)) {
                        recordsDump += `\n[${type} Records]\n`;
                        recordsDump += recs.length > 0 ? recs.map(r => ` - ${r.data}`).join('\n') : ' None';
                        recordsDump += '\n';
                    }
                    txtContent = `--- Lookup [Domain] | Made by Nightregion @ lookup.teaa.workers.dev ---
Domain: ${d.domain}
${recordsDump}
---------------------------`;
                }

                const blob = new Blob([txtContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${query.replace(/[^a-z0-9]/gi, '_')}_ipdomain.txt`;
                a.click();
                URL.revokeObjectURL(url);
            });

        } catch (err) {
            container.innerHTML = `<p style="color: #ff0000;">Error: Lookup failed or invalid target</p>`;
        }
    });
}