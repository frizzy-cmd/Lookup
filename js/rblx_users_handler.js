const searchBtn = document.getElementById('rblxSearchBtn');
const searchInput = document.getElementById('rblxSearchInput');
const container = document.getElementById('resultContainer');

let lastFetchedUser = null;

if (searchBtn) {
    searchBtn.addEventListener('click', async () => {
        if (typeof checkRateLimit === 'function' && checkRateLimit()) {
            return;
        }

        const query = searchInput.value.trim();
        if (!query) return;

        container.innerHTML = '<p>Loading user\'s profile...</p>';

        try {
            const res = await fetch(`/api/roblox/user/${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error('Failed to fetch user');
            
            const u = await res.json();
            lastFetchedUser = u;
            
            const presenceMap = ['Offline', 'Online', 'In-game', 'In-studio'];
            const statusText = presenceMap[u.presence.userPresenceType] || 'Error whilst fetching presence!';
            
            const verifiedHtml = u.hasVerifiedBadge ? '<span style="color: #0080ff; font-weight: bold;">[Verified]</span>' : '';
            const bannedHtml = u.isBanned ? '<span style="color: #ff0000;">[Banned]</span>' : '';

            let ingameHtml = '';
            if (u.presence.userPresenceType === 2 || u.presence.userPresenceType === 3) {
                ingameHtml = `
                    <div style="margin-top: 10px; font-size: 9pt; color: #ffe700; border: 1px dashed #ffe700; padding: 8px;">
                        Location: ${u.presence.lastLocation || 'N/A'}<br>
                        Place ID: ${u.presence.placeId || 'N/A'} | Game ID: ${u.presence.gameId || 'N/A'}
                    </div>
                `;
            }

            const groupsHtml = u.groups && u.groups.length > 0 
                ? u.groups.map(g => `<div style="font-size: 9pt; padding: 3px 0; border-bottom: 1px solid #333;">${g.group.name} (${g.role.name})</div>`).join('') 
                : '<span style="color: #888; font-size: 9pt;">Empty</span>';

            const historyHtml = u.usernameHistory && u.usernameHistory.length > 0
                ? u.usernameHistory.map(h => `<div style="font-size: 9pt; padding: 2px 0; color: #ccc;">- ${h}</div>`).join('')
                : '<span style="color: #888; font-size: 9pt;">Empty</span>';

            const favoritesHtml = u.favoriteGames && u.favoriteGames.length > 0
                ? u.favoriteGames.map(f => `<div style="font-size: 9pt; padding: 2px 0;">- ${f.name || f.rootPlace?.name || 'game #' + (f.id || f.rootPlaceId)}</div>`).join('')
                : '<span style="color: #888; font-size: 9pt;">Empty or private</span>';

            const inventoryHtml = u.inventory && u.inventory.length > 0
                ? u.inventory.map(item => `<div style="font-size: 9pt; padding: 2px 0;">- [${item.category}] ${item.name || item.assetName || 'asset #' + item.assetId}</div>`).join('')
                : '<span style="color: #888; font-size: 9pt;">Empty or private</span>';

            const headshotUrl = u.avatars.headshot || '';
            const bustUrl = u.avatars.bust || '';
            const fullUrl = u.avatars.full || '';

            container.innerHTML = `
                <div class="video-card" style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                        <img id="profileAvatarImg" src="${headshotUrl}" style="width: 140px; height: 140px; border: 2px solid #fff; object-fit: cover;" alt="avatar">
                        <div style="display: flex; gap: 4px;">
                            <button class="btn-action" style="font-size: 8pt; padding: 4px 6px;" onclick="document.getElementById('profileAvatarImg').src='${headshotUrl}'">Head</button>
                            <button class="btn-action" style="font-size: 8pt; padding: 4px 6px;" onclick="document.getElementById('profileAvatarImg').src='${bustUrl}'">Bust</button>
                            <button class="btn-action" style="font-size: 8pt; padding: 4px 6px;" onclick="document.getElementById('profileAvatarImg').src='${fullUrl}'">Full</button>
                        </div>
                        <button id="exportTxtBtn" class="btn-action" style="font-size: 8pt; padding: 6px 12px; margin-top: 5px; width: 100%;">Export as .txt</button>
                    </div>

                    <div style="flex-grow: 1; min-width: 250px;">
                        <h3 style="margin-top: 0;">${u.displayName} (@${u.name}) ${verifiedHtml} ${bannedHtml}</h3>
                        <p style="color: #ccc; font-size: 10pt; word-break: break-all; white-space: pre-wrap;">${u.description || 'No bio available'}</p>
                        
                        <div style="border: 1px solid #fff; padding: 10px; margin-top: 12px; font-size: 9.5pt; display: flex; flex-direction: column; gap: 6px;">
                            <div><strong>user ID:</strong> ${u.id}</div>
                            <div><strong>Status:</strong> <span style="color: ${u.presence.userPresenceType > 0 ? '#ffe700' : '#888'};">${statusText}</span></div>
                            <div><strong>Friends:</strong> ${u.stats.friends}</div>
                            <div><strong>Followers:</strong> ${u.stats.followers}</div>
                            <div><strong>Following:</strong> ${u.stats.following}</div>
                            <div><strong>Account creation:</strong> ${new Date(u.created).toLocaleDateString()}</div>
                        </div>

                        ${ingameHtml}

                        <div style="margin-top: 15px;">
                            <p style="color: #ffe700; margin-bottom: 5px; font-size: 10pt;">Past usernames:</p>
                            <div style="max-height: 100px; overflow-y: auto; border: 1px solid #444; padding: 6px;">
                                ${historyHtml}
                            </div>
                        </div>

                        <div style="margin-top: 15px;">
                            <p style="color: #ffe700; margin-bottom: 5px; font-size: 10pt;">Groups:</p>
                            <div style="max-height: 120px; overflow-y: auto; border: 1px solid #444; padding: 6px;">
                                ${groupsHtml}
                            </div>
                        </div>

                        <div style="margin-top: 15px;">
                            <p style="color: #ffe700; margin-bottom: 5px; font-size: 10pt;">Favorite games:</p>
                            <div style="max-height: 120px; overflow-y: auto; border: 1px solid #444; padding: 6px;">
                                ${favoritesHtml}
                            </div>
                        </div>

                        <div style="margin-top: 15px;">
                            <button id="toggleInventoryBtn" class="btn-action" style="font-size: 9pt; width: 100%; text-align: left; padding: 6px 10px;">+ Toggle inventory (shirts & accessories to avoid API limits)</button>
                            <div id="inventoryContainer" style="display: none; max-height: 150px; overflow-y: auto; border: 1px solid #444; padding: 6px; margin-top: 4px;">
                                ${inventoryHtml}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('toggleInventoryBtn').addEventListener('click', () => {
                const invBox = document.getElementById('inventoryContainer');
                const btn = document.getElementById('toggleInventoryBtn');
                if (invBox.style.display === 'none') {
                    invBox.style.display = 'block';
                    btn.textContent = '- Hide inventory (shirts & accessories to avoid API limits)';
                } else {
                    invBox.style.display = 'none';
                    btn.textContent = '+ Toggle inventory (shirts & accessories to avoid API limits)';
                }
            });

            document.getElementById('exportTxtBtn').addEventListener('click', () => {
                if (!lastFetchedUser) return;
                
                const groupsText = lastFetchedUser.groups && lastFetchedUser.groups.length > 0 
                    ? lastFetchedUser.groups.map(g => ` - ${g.group.name} (${g.role.name})`).join('\n') 
                    : ' Empty';

                const historyText = lastFetchedUser.usernameHistory && lastFetchedUser.usernameHistory.length > 0
                    ? lastFetchedUser.usernameHistory.map(h => ` - ${h}`).join('\n')
                    : ' Empty';

                const favoritesText = lastFetchedUser.favoriteGames && lastFetchedUser.favoriteGames.length > 0
                    ? lastFetchedUser.favoriteGames.map(f => ` - ${f.name || f.rootPlace?.name || 'Game #' + (f.id || f.rootPlaceId)}`).join('\n')
                    : ' Empty, or private';

                const txtContent = `--- Lookup [Roblox user] | Made by Nightregion @ lookup.teaa.workers.dev ---
Username: ${lastFetchedUser.name} (${lastFetchedUser.displayName})
ID: ${lastFetchedUser.id}
Created: ${new Date(lastFetchedUser.created).toLocaleDateString()}
Is banned: ${lastFetchedUser.isBanned}
Is verified: ${lastFetchedUser.hasVerifiedBadge}
Friends: ${lastFetchedUser.stats.friends}
Followers: ${lastFetchedUser.stats.followers}
Following: ${lastFetchedUser.stats.following}

Bio:
${lastFetchedUser.description || 'None'}

Past usernames:
${historyText}

Groups:
${groupsText}

Favorite games:
${favoritesText}
--------------------------`;

                const blob = new Blob([txtContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${lastFetchedUser.name}_lookup.txt`;
                a.click();
                URL.revokeObjectURL(url);
            });

        } catch (err) {
            container.innerHTML = `<p style="color: #ff0000;">Error: Failed to fetch user, user may not exist or the Roblox API is down at the moment.</p>`;
        }
    });
}