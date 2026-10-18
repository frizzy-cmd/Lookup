const ghSearchBtn = document.getElementById('ghSearchBtn');
const ghSearchInput = document.getElementById('ghSearchInput');
const container = document.getElementById('resultContainer');

let lastFetchedGhUser = null;

if (ghSearchBtn) {
    ghSearchBtn.addEventListener('click', async () => {
        if (typeof checkRateLimit === 'function' && checkRateLimit()) {
            return;
        }

        const query = ghSearchInput.value.trim();
        if (!query) return;

        container.innerHTML = '<p>Loading profile...</p>';

        try {
            const res = await fetch(`/api/github/user/${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error('Failed to fetch github user');

            const u = await res.json();
            lastFetchedGhUser = u;

            const avatarHtml = u.avatar_url ? `<img src="${u.avatar_url}" style="width: 140px; height: 140px; border: 2px solid #fff; object-fit: cover;" alt="pfp">` : '';

            container.innerHTML = `
                <div class="video-card" style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                        ${avatarHtml}
                        <a href="${u.html_url}" target="_blank" class="btn-action" style="font-size: 8pt; padding: 6px 12px; width: 100%; text-align: center; text-decoration: none;">Open GitHub -></a>
                        <button id="exportGhTxtBtn" class="btn-action" style="font-size: 8pt; padding: 6px 12px; width: 100%;">Export as .txt</button>
                    </div>

                    <div style="flex-grow: 1; min-width: 250px;">
                        <h3 style="margin-top: 0;">${u.name || u.login} <span style="color: #aaa; font-weight: normal; font-size: 11pt;">(@${u.login})</span></h3>
                        <p style="color: #ccc; font-size: 10pt; word-break: break-all; white-space: pre-wrap;">${u.bio || 'No description available'}</p>

                        <div style="border: 1px solid #fff; padding: 10px; margin-top: 12px; font-size: 9.5pt; display: flex; flex-direction: column; gap: 6px;">
                            <div><strong>Company:</strong> ${u.company || 'n/a'}</div>
                            <div><strong>Location:</strong> ${u.location || 'n/a'}</div>
                            <div><strong>Public repos:</strong> ${u.public_repos.toLocaleString()}</div>
                            <div><strong>Public gists:</strong> ${u.public_gists.toLocaleString()}</div>
                            <div><strong>Followers:</strong> ${u.followers.toLocaleString()}</div>
                            <div><strong>Following:</strong> ${u.following.toLocaleString()}</div>
                            <div><strong>Account created:</strong> ${new Date(u.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('exportGhTxtBtn').addEventListener('click', () => {
                if (!lastFetchedGhUser) return;

                const txtContent = `--- Lookup [GitHub user] | Made by Nightregion @ lookup.teaa.workers.dev ---
Name: ${lastFetchedGhUser.name || 'n/a'}
Username: ${lastFetchedGhUser.login}
ID: ${lastFetchedGhUser.id}
Company: ${lastFetchedGhUser.company || 'n/a'}
Location: ${lastFetchedGhUser.location || 'n/a'}
Public repos: ${lastFetchedGhUser.public_repos}
Public gists: ${lastFetchedGhUser.public_gists}
Followers: ${lastFetchedGhUser.followers}
Following: ${lastFetchedGhUser.following}
Profile URL: ${lastFetchedGhUser.html_url}
Account created: ${new Date(lastFetchedGhUser.created_at).toLocaleDateString()}

Bio:
${lastFetchedGhUser.bio || 'none'}
---------------------------------------------------`;

                const blob = new Blob([txtContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${lastFetchedGhUser.login}_githubuser_lookup.txt`;
                a.click();
                URL.revokeObjectURL(url);
            });

        } catch (err) {
            container.innerHTML = `<p style="color: #ff0000;">Error: User not found or API limit hit</p>`;
        }
    });
}