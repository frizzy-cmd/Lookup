const gameSearchBtn = document.getElementById('gameSearchBtn');
const gameSearchInput = document.getElementById('gameSearchInput');
const container = document.getElementById('resultContainer');

let lastFetchedGame = null;

if (gameSearchBtn) {
    gameSearchBtn.addEventListener('click', async () => {
        if (typeof checkRateLimit === 'function' && checkRateLimit()) {
            return;
        }

        const query = gameSearchInput.value.trim();
        if (!query) return;

        container.innerHTML = '<p>Loading game...</p>';

        try {
            const res = await fetch(`/api/roblox/game/${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error('failed to fetch game');

            const g = await res.json();
            lastFetchedGame = g;

            const iconHtml = g.iconUrl ? `<img src="${g.iconUrl}" style="width: 140px; height: 140px; border: 2px solid #fff; object-fit: cover;" alt="game icon">` : '';

            container.innerHTML = `
                <div class="video-card" style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                        ${iconHtml}
                        <button id="exportGameTxtBtn" class="btn-action" style="font-size: 8pt; padding: 6px 12px; width: 100%;">Export as .txt</button>
                    </div>

                    <div style="flex-grow: 1; min-width: 250px;">
                        <h3 style="margin-top: 0;">${g.name}</h3>
                        <p style="color: #ccc; font-size: 10pt; word-break: break-all; white-space: pre-wrap;">${g.description || 'no description.'}</p>

                        <div style="border: 1px solid #fff; padding: 10px; margin-top: 12px; font-size: 9.5pt; display: flex; flex-direction: column; gap: 6px;">
                            <div><strong>Creator:</strong> ${g.creator.name || g.builder} (${g.creator.type || 'User'})</div>                          
                            <div><strong>Place ID:</strong> ${g.placeId}</div>
                            <div><strong>Universe ID:</strong> ${g.universeId}</div>
                            <div><strong>Playing now:</strong> <span style="color: #ffe700;">${g.playing.toLocaleString()}</span></div>
                            <div><strong>Total visits:</strong> ${g.visits.toLocaleString()}</div>
                            <div><strong>Favorites:</strong> ${g.favoritedCount.toLocaleString()}</div>
                            <div><strong>Max players per server:</strong> ${g.maxPlayers}</div>
                            <div><strong>Last updated:</strong> ${new Date(g.updated).toLocaleDateString()}</div>
                            <div><strong>Game creation:</strong> ${new Date(g.created).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>
            `;
            // maybe the creator part may work or may not work, idk... just try tho


            document.getElementById('exportGameTxtBtn').addEventListener('click', () => {
                if (!lastFetchedGame) return;

                const txtContent = `--- Lookup [Roblox game] | Made by Nightregion @ lookup.teaa.workers.dev ---
Name: ${lastFetchedGame.name}
Creator: ${lastFetchedGame.creator.name || lastFetchedGame.builder} (${lastFetchedGame.creator.type || 'User'})
Place ID: ${lastFetchedGame.placeId}
Universe ID: ${lastFetchedGame.universeId}
Playing now: ${lastFetchedGame.playing}
Total visits: ${lastFetchedGame.visits}
Favorites: ${lastFetchedGame.favoritedCount}
Max players per server: ${lastFetchedGame.maxPlayers}
Last Updated: ${new Date(lastFetchedGame.updated).toLocaleDateString()}
Game Creation: ${new Date(lastFetchedGame.created).toLocaleDateString()}

Description:
${lastFetchedGame.description || 'None'}
--------------------------`;

                const blob = new Blob([txtContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${lastFetchedGame.name.replace(/[^a-z0-9]/gi, '_')}_game_lookup.txt`;
                a.click();
                URL.revokeObjectURL(url);
            });

        } catch (err) {
            container.innerHTML = `<p style="color: #ff0000;">Error: Game not found or invalid ID</p>`;
        }
    });
}