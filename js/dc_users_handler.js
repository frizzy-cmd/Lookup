const dcSearchBtn = document.getElementById('dcSearchBtn');
const dcSearchInput = document.getElementById('dcSearchInput');
const dcContainer = document.getElementById('resultContainer');

let lastFetchedDiscordUser = null;

function whenDidUserMakeAccount(id) {
  const discordEpoch = 1420070400000n;
  const idBigInt = BigInt(id);
  // VVV i struggled there because of a missing ( .. oops!
  const timestamp = Number((idBigInt >> 22n) + discordEpoch); 
  return new Date(timestamp).toLocaleDateString();
}


if (dcSearchBtn) {
    dcSearchBtn.addEventListener('click', async () => {
        if (typeof checkRateLimit === 'function' && checkRateLimit()) {
            return;
        }

        const query = dcSearchInput.value.trim();
        if (!query) return;

        dcContainer.innerHTML = '<p>Loading user\'s profile...</p>';

        try {
            const res = await fetch(`api/discord/user/${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error('Failed to fetch discord user');
            
            const u = await res.json();
            lastFetchedDiscordUser = u;

            const accentStyle = u.accentColor ? `border-left: 6px solid ${u.accentColor};` : '';
            const bannerHtml = u.bannerUrl ? `<div style="margin-top: 10px;"><img src="${u.bannerUrl}" style="max-width: 100%; max-height: 225px; border: 1px solid #fff;" alt="banner"></div>` : '';

            dcContainer.innerHTML = `
                <div class="video-card" style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap; ${accentStyle}">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                        <img src="${u.avatarUrl}" style="width: 120px; height: 120px; border: 2px solid #fff; object-fit: cover;" alt="avatar">
                        <button id="exportDcTxtBtn" class="btn-action" style="font-size: 8pt; padding: 6px 12px; width: 100%;">Export as .txt</button>
                    </div>

                    ${bannerHtml}

                    <div style="flex-grow: 1; min-width: 250px;">
                        <h3 style="margin-top: 0;">${u.globalName} (<span style="color: #ffffff;">@${u.username}</span>)</h3>
                        
                        <div style="border: 1px solid #fff; padding: 10px; margin-top: 12px; font-size: 9.5pt; display: flex; flex-direction: column; gap: 6px;">
                            <div>User ID: ${u.id}</div>
                            <div>Discriminator: ${u.discriminator && u.discriminator !== '0' ? '#' + u.discriminator : 'None'}</div>
                            <div>Accent color: ${u.accentColor || 'None'}</div>
                            <div>Public flags: ${u.publicFlags}</div>
                            <div>Account created: ${whenDidUserMakeAccount(u.id)}</div>
                        </div>
                    </div>
                </div>
            `;


            document.getElementById('exportDcTxtBtn').addEventListener('click', () => {
                if (!lastFetchedDiscordUser) return;
                
                const txtContent = `--- Lookup [Discord user] | Made by Nightregion @ lookup.teaa.workers.dev ---
Global name: ${u.globalName}
Username: ${u.username}
ID: ${u.id}
Discriminator: ${u.discriminator}
Accent color: ${u.accentColor || 'None'}
Public flags: ${u.publicFlags}
Avatar URL: ${u.avatarUrl}
Banner URL: ${u.bannerUrl || 'None'}
---------------------------`;

                const blob = new Blob([txtContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${lastFetchedDiscordUser.username}_discord_lookup.txt`;
                a.click();
                URL.revokeObjectURL(url);
            });

        } catch (err) {
            dcContainer.innerHTML = `<p style="color: #ff0000;">Error: Failed to fetch Discord user, Does the user exist?</p>`;
        }
    });
}

