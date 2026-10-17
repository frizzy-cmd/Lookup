// handles roblox group lookup rendering and export
const groupSearchBtn = document.getElementById('groupSearchBtn');
const groupSearchInput = document.getElementById('groupSearchInput');
const container = document.getElementById('resultContainer');

let lastFetchedGroup = null;

if (groupSearchBtn) {
    groupSearchBtn.addEventListener('click', async () => {
        if (typeof checkRateLimit === 'function' && checkRateLimit()) {
            return;
        }

        const query = groupSearchInput.value.trim();
        if (!query) return;

        container.innerHTML = '<p>Loading group profile...</p>';

        try {
            const res = await fetch(`/api/roblox/group/${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error('Failed to fetch group');

            const g = await res.json();
            lastFetchedGroup = g;

            const iconHtml = g.iconUrl ? `<img src="${g.iconUrl}" style="width: 140px; height: 140px; border: 2px solid #fff; object-fit: cover;" alt="group logo">` : '<div style="width: 140px; height: 140px; border: 2px solid #fff; display: flex; align-items: center; center; font-size: 8pt; text-align: center; color: #888;">No icon</div>';
            
            const ownerHtml = g.owner ? `${g.owner.username} (ID: ${g.owner.id})` : 'N/A (Group owned)';
            
            // pretty sure this doesnt work but idgaf
            const shoutHtml = g.shout && g.shout.body ? `
                <div style="margin-top: 10px; border: 1px dashed #ffe700; padding: 8px; font-size: 9pt; color: #ffe700;">
                    <strong>Current shout:</strong> "${g.shout.body}"<br>
                    <span style="color: #aaa; font-size: 8pt;">by ${g.shout.poster?.username || 'N/A'}</span>
                </div>
            ` : '';

            const rolesHtml = g.roles && g.roles.length > 0
                ? g.roles.map(r => `<div style="font-size: 9pt; padding: 3px 0; border-bottom: 1px solid #333;">${r.name} (Rank: ${r.rank}, Members: ${r.memberCount ?? 'N/A'})</div>`).join('')
                : '<span style="color: #888; font-size: 9pt;">N/A</span>';

            container.innerHTML = `
                <div class="video-card" style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                        ${iconHtml}
                        <button id="exportGroupTxtBtn" class="btn-action" style="font-size: 8pt; padding: 6px 12px; width: 100%;">Export as .txt</button>
                    </div>

                    <div style="flex-grow: 1; min-width: 250px;">
                        <h3 style="margin-top: 0;">${g.name}</h3>
                        <p style="color: #ccc; font-size: 10pt; word-break: break-all; white-space: pre-wrap;">${g.description || 'No description available'}</p>

                        ${shoutHtml}

                        <div style="border: 1px solid #fff; padding: 10px; margin-top: 12px; font-size: 9.5pt; display: flex; flex-direction: column; gap: 6px;">
                            <div><strong>Group ID:</strong> ${g.id}</div>
                            <div><strong>Owner:</strong> ${ownerHtml}</div>
                            <div><strong>Members:</strong> ${g.memberCount.toLocaleString()}</div>
                            <div><strong>Locked:</strong> ${g.isLocked ? 'Yes' : 'No'}</div>
                            <div><strong>Public entry:</strong> ${g.publicEntryAllowed ? 'Yes' : 'No'}</div>
                        </div>

                        <div style="margin-top: 15px;">
                            <button id="toggleRolesBtn" class="btn-action" style="font-size: 9pt; width: 100%; text-align: left; padding: 6px 10px;">+ Toggle roles</button>
                            <div id="rolesContainer" style="display: none; max-height: 150px; overflow-y: auto; border: 1px solid #444; padding: 6px; margin-top: 4px;">
                                ${rolesHtml}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('toggleRolesBtn').addEventListener('click', () => {
                const rolesBox = document.getElementById('rolesContainer');
                const btn = document.getElementById('toggleRolesBtn');
                if (rolesBox.style.display === 'none') {
                    rolesBox.style.display = 'block';
                    btn.textContent = '- Toggle roles';
                } else {
                    rolesBox.style.display = 'none';
                    btn.textContent = '+ Toggle roles';
                }
            });

            document.getElementById('exportGroupTxtBtn').addEventListener('click', () => {
                if (!lastFetchedGroup) return;

                const rolesText = lastFetchedGroup.roles && lastFetchedGroup.roles.length > 0
                    ? lastFetchedGroup.roles.map(r => ` - ${r.name} (Rank: ${r.rank})`).join('\n')
                    : ' None';

                const txtContent = `--- Lookup [Roblox group] | Made by Nightregion @ lookup.teaa.workers.dev ---
Name: ${lastFetchedGroup.name}
Group ID: ${lastFetchedGroup.id}
Owner: ${lastFetchedGroup.owner ? lastFetchedGroup.owner.username : 'Group Owned'}
Members: ${lastFetchedGroup.memberCount}
Locked: ${lastFetchedGroup.isLocked}
Public entry: ${lastFetchedGroup.publicEntryAllowed}
Current shout: ${lastFetchedGroup.shout?.body || 'N/A'}

Description:
${lastFetchedGroup.description || 'No description available'}

Roles:
${rolesText}
---------------------------`;

                const blob = new Blob([txtContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${lastFetchedGroup.name.replace(/[^a-z0-9]/gi, '_')}_group_lookup.txt`;
                a.click();
                URL.revokeObjectURL(url);
            });

        } catch (err) {
            container.innerHTML = `<p style="color: #ff0000;">Error: Group not found or invalid ID</p>`;
        }
    });
}