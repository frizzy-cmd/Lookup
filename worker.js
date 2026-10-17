export default {
async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    }

    if (url.pathname.startsWith('/api/roblox/user/')) {
        const query = decodeURIComponent(url.pathname.split('/').pop());
        
        try {
            let userId = null;
            
            if (/^\d+$/.test(query)) {
                userId = query;
            } else {
                try {
                    const userLookupRes = await fetch(`https://users.roblox.com/v1/usernames/users`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ usernames: [query], excludeBannedUsers: false })
                    });
                    const userLookupData = await userLookupRes.json();
                    
                    if (userLookupData.data && userLookupData.data.length > 0) {
                        userId = userLookupData.data[0].id;
                    }
                } catch (e) {}

                if (!userId) {
                    try {
                        const searchRes = await fetch(`https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(query)}&limit=1`);
                        const searchData = await searchRes.json();
                        
                        if (searchData.data && searchData.data.length > 0) {
                            userId = searchData.data[0].id;
                        }
                    } catch (e) {}
                }
            }

            if (!userId) {
                return new Response(JSON.stringify({ error: 'User not found!' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                });
            }

            // hotfix safefetch.. pls work 1:56 am rn
            const safeFetch = async (endpoint, options) => {
                try {
                    const res = await fetch(endpoint, options);
                    if (!res.ok) return null;
                    return await res.json();
                } catch (err) {
                    return null;
                }
            };

            const [
                userData, 
                headshotData, 
                bustData, 
                fullData, 
                presenceData, 
                friendData, 
                followerData, 
                followingData, 
                groupsData, 
                historyData,
                favoritesData,
                shirtsData,
                hatsData
            ] = await Promise.all([
                safeFetch(`https://users.roblox.com/v1/users/${userId}`),
                safeFetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`),
                safeFetch(`https://thumbnails.roblox.com/v1/users/avatar-bust?userIds=${userId}&size=420x420&format=Png&isCircular=false`),
                safeFetch(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`),
                safeFetch(`https://presence.roblox.com/v1/presence/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userIds: [Number(userId)] })
                }),
                safeFetch(`https://friends.roblox.com/v1/users/${userId}/friends/count`),
                safeFetch(`https://friends.roblox.com/v1/users/${userId}/followers/count`),
                safeFetch(`https://friends.roblox.com/v1/users/${userId}/followings/count`),
                safeFetch(`https://groups.roblox.com/v1/users/${userId}/groups/roles`),
                safeFetch(`https://users.roblox.com/v1/users/${userId}/username-history`),
                safeFetch(`https://games.roblox.com/v2/users/${userId}/favorite/games`),
                safeFetch(`https://inventory.roblox.com/v2/users/${userId}/inventory/2?limit=25`), // shirts
                safeFetch(`https://inventory.roblox.com/v2/users/${userId}/inventory/8?limit=25`)  // hats / accessories
            ]);

            if (!userData) {
                return new Response(JSON.stringify({ error: 'User profile not found on Roblox' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                });
            }

            const presence = presenceData?.userPresences?.[0] || {};

            const combinedInventory = [
                ...(shirtsData?.data || []).map(item => ({ ...item, category: 'Shirt' })),
                ...(hatsData?.data || []).map(item => ({ ...item, category: 'Hat/Accessory' }))
            ];

            const payload = {
                id: userData.id || userId,
                name: userData.name || query,
                displayName: userData.displayName || query,
                description: userData.description || '',
                created: userData.created || new Date().toISOString(),
                isBanned: userData.isBanned || false,
                hasVerifiedBadge: userData.hasVerifiedBadge || false,
                avatars: {
                    headshot: headshotData?.data?.[0]?.imageUrl || '',
                    bust: bustData?.data?.[0]?.imageUrl || '',
                    full: fullData?.data?.[0]?.imageUrl || ''
                },
                presence: {
                    userPresenceType: presence.userPresenceType || 0,
                    lastLocation: presence.lastLocation || '',
                    placeId: presence.placeId || null,
                    gameId: presence.gameId || null
                },
                stats: {
                    friends: friendData?.count || 0,
                    followers: followerData?.count || 0,
                    following: followingData?.count || 0
                },
                groups: groupsData?.data || [],
                usernameHistory: historyData?.data || [],
                favoriteGames: favoritesData?.data || [],
                inventory: combinedInventory
            };

            return new Response(JSON.stringify(payload), {
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=120'
                }
            });

        } catch (err) {
            return new Response(JSON.stringify({ error: 'Failed to fetch from Roblox API', details: err.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }
    }

    // DISCORD USER 
    // DISCORD USER 
    // DISCORD USER 
    // DISCORD USER 
    // DISCORD USER 

    if (url.pathname.startsWith('/api/discord/user/')) {
        const userId = url.pathname.split('/').pop();
        
        if (!/^\d+$/.test(userId)) {
            return new Response(JSON.stringify({ error: 'Invalid discord user id' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        try {
            const discordRes = await fetch(`https://discord.com/api/v10/users/${userId}`, {
                headers: {
                    'Authorization': `Bot ${env.DISCORD_BOT_TOKEN}`
                    // nuh uh! sneaky boy! you not getting my token!
                }
            });

            if (!discordRes.ok) {
                return new Response(JSON.stringify({ error: 'User not found or invalid bot token' }), {
                    status: discordRes.status,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                });
            }

            const userData = await discordRes.json();

            // format avatar url
            let avatarUrl = `https://cdn.discordapp.com/embed/avatars/${Number(userData.discriminator || 0) % 5}.png`;
            if (userData.avatar) {
                const ext = userData.avatar.startsWith('a_') ? 'gif' : 'png';
                avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${userData.avatar}.${ext}?size=512`;
            }

            // format banner url if it exists
            let bannerUrl = null;
            if (userData.banner) {
                const ext = userData.banner.startsWith('a_') ? 'gif' : 'png';
                bannerUrl = `https://cdn.discordapp.com/banners/${userId}/${userData.banner}.${ext}?size=512`;
            }

            const payload = {
                id: userData.id,
                username: userData.username,
                globalName: userData.global_name || userData.username,
                discriminator: userData.discriminator,
                avatarUrl: avatarUrl,
                bannerUrl: bannerUrl,
                accentColor: userData.accent_color ? `#${userData.accent_color.toString(16).padStart(6, '0')}` : null,
                publicFlags: userData.public_flags || 0
            };

            return new Response(JSON.stringify(payload), {
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=120'
                }
            });

        } catch (err) {
            return new Response(JSON.stringify({ error: 'Failed to fetch from discord api', details: err.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }
    }

    // ROBLOX GAMES
    // ROBLOX GAMES
    // ROBLOX GAMES
    // ROBLOX GAMES
    // ROBLOX GAMES

    if (url.pathname.startsWith('/api/roblox/game/')) {
        const query = decodeURIComponent(url.pathname.split('/').pop()).trim();
        
        // extract place ID if full URL is pasted..
        let placeId = query;
        if (query.includes('roblox.com/games/')) {
            const match = query.match(/games\/(\d+)/);
            if (match) placeId = match[1];
        }

        if (!/^\d+$/.test(placeId)) {
            return new Response(JSON.stringify({ error: 'Invalid place id' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        try {
            // this converts placeId to universeId
            const uniRes = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
            if (!uniRes.ok) throw new Error('Universe not found');
            const uniData = await uniRes.json();
            const universeId = uniData.universeId;

            // this fetches game details place details and shit
            const [gameRes, placeRes, iconRes] = await Promise.all([
                fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`),
                fetch(`https://games.roblox.com/v1/places/multiget-place-details?placeIds=${placeId}`),
                fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&returnPolicy=PlaceHolder&size=512x512&format=Png`)
            ]);

            const gameData = gameRes.ok ? await gameRes.json() : {};
            const placeData = placeRes.ok ? await placeRes.json() : {};
            const iconData = iconRes.ok ? await iconRes.json() : {};

            const game = gameData.data?.[0];
            const place = placeData?.[0];

            if (!game) {
                return new Response(JSON.stringify({ error: 'Game details not found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                });
            }

            const payload = {
                placeId: placeId,
                universeId: universeId,
                name: game.name || 'unknown',
                description: game.description || '',
                builder: game.builder || 'unknown',
                builderId: game.builderId,
                creator: game.creator || {},
                playing: game.playing || 0,
                visits: game.visits || 0,
                favoritedCount: game.favoritedCount || 0,
                created: game.created,
                updated: game.updated,
                maxPlayers: place?.maxPlayerCount || game.maxPlayers || 0,
                iconUrl: iconData.data?.[0]?.imageUrl || ''
            };

            return new Response(JSON.stringify(payload), {
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=120'
                }
            });

        } catch (err) {
            return new Response(JSON.stringify({ error: 'Failed to fetch game data', details: err.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }
    }

    // ROBLOX GROUP
    // ROBLOX GROUP
    // ROBLOX GROUP
    // ROBLOX GROUP
    // ROBLOX GROUP

    if (url.pathname.startsWith('/api/roblox/group/')) {
        const query = decodeURIComponent(url.pathname.split('/').pop()).trim();
        
        let groupId = query;
        if (query.includes('roblox.com/communities/') || query.includes('roblox.com/groups/')) {
            const match = query.match(/(?:communities|groups)\/(\d+)/);
            if (match) groupId = match[1];
        }

        if (!/^\d+$/.test(groupId)) {
            return new Response(JSON.stringify({ error: 'invalid group id' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        try {
            const [groupRes, iconRes, rolesRes] = await Promise.all([
                fetch(`https://groups.roblox.com/v1/groups/${groupId}`),
                fetch(`https://thumbnails.roblox.com/v1/groups/icons?groupIds=${groupId}&size=420x420&format=Png&isCircular=false`),
                fetch(`https://groups.roblox.com/v1/groups/${groupId}/roles`)
            ]);

            if (!groupRes.ok) throw new Error('group not found');

            const groupData = await groupRes.json();
            const iconData = iconRes.ok ? await iconRes.json() : {};
            const rolesData = rolesRes.ok ? await rolesRes.json() : {};

            const payload = {
                id: groupData.id,
                name: groupData.name,
                description: groupData.description || '',
                owner: groupData.owner ? {
                    id: groupData.owner.userId || groupData.owner.id,
                    username: groupData.owner.username || groupData.owner.name,
                    displayName: groupData.owner.displayName
                } : null,
                shout: groupData.shout || null,
                memberCount: groupData.memberCount || 0,
                isLocked: groupData.isLocked || false,
                publicEntryAllowed: groupData.publicEntryAllowed || false,
                iconUrl: iconData.data?.[0]?.imageUrl || '',
                roles: rolesData.roles || []
            };

            return new Response(JSON.stringify(payload), {
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=120'
                }
            });

        } catch (err) {
            return new Response(JSON.stringify({ error: 'failed to fetch group data', details: err.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }
    }

    // IP LOOKUP?
    //
    //
    //
    //
    //

    // ahhh osint bro this is opsec?
    if (url.pathname.startsWith('/api/osint/ip/')) {
        const query = decodeURIComponent(url.pathname.split('/').pop()).trim();
        
        if (!query) {
            return new Response(JSON.stringify({ error: 'Invalid IP or domain' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        try {
            // teehe! thank youuu!
            const res = await fetch(`http://ip-api.com/json/${query}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
            const data = await res.json();

            if (data.status !== 'success') {
                return new Response(JSON.stringify({ error: data.message || 'Failed to resolve ip' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                });
            }

            return new Response(JSON.stringify(data), {
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=120'
                }
            });
        } catch (err) {
            return new Response(JSON.stringify({ error: 'IP lookup failed', details: err.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }
    }

    // dns rec
    if (url.pathname.startsWith('/api/osint/dns/')) {
        const domain = decodeURIComponent(url.pathname.split('/').pop()).trim();
        
        if (!domain) {
            return new Response(JSON.stringify({ error: 'Invalid domain' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        try {
            // qry A AAAA MX TXT rec conc via cf dns
            const types = ['A', 'AAAA', 'MX', 'TXT', 'NS'];
            const dnsPromises = types.map(type => 
                fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`, {
                    headers: { 'Accept': 'application/dns-json' }
                }).then(res => res.json()).catch(() => ({ Answer: [] }))
            );

            const results = await Promise.all(dnsPromises);
            
            const dnsRecords = {};
            types.forEach((type, index) => {
                dnsRecords[type] = results[index].Answer || [];
            });

            return new Response(JSON.stringify({ domain, records: dnsRecords }), {
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=120'
                }
            });
        } catch (err) {
            return new Response(JSON.stringify({ error: 'DNS lookup failed', details: err.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }
    }

    return new Response('Not found', { status: 404 });
}
};