function checkRateLimit() {
    const now = Date.now();
    let data = JSON.parse(localStorage.getItem('ratelimit_data') || '{"timestamps": [], "bannedUntil": 0}');

    if (now < data.bannedUntil) {
        alert('This IP has been blocked from requesting for 5 minutes, I told you to stop!');
        return true;
    }

    data.timestamps = data.timestamps.filter(t => now - t < 10000);
    data.timestamps.push(now);

    const count = data.timestamps.length;

    if (count === 3) {
        localStorage.setItem('ratelimit_data', JSON.stringify(data));
        return true; 
    }
    
    if (count === 10) {
        alert('Stop before you get blocked for 5 minutes. I am warning you.');
    }
    
    if (count >= 25) {
        data.bannedUntil = now + 300000;
        localStorage.setItem('ratelimit_data', JSON.stringify(data));
        alert('This IP has been blocked from requesting for 5 minutes, I told you to stop!');
        return true;
    }

    localStorage.setItem('ratelimit_data', JSON.stringify(data));
    return false;
}

// client rate limiting on this is kinda shitty.. 

// !!!!!!!!!!!!!
//TODO: make server rate limiting