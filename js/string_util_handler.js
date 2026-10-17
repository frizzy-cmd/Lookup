// handles client-side string & base64 utilities
const inputEl = document.getElementById('stringInput');
const outputEl = document.getElementById('stringOutput');
const resultContainer = document.getElementById('resultContainer');
const statsBar = document.getElementById('statsBar');

function updateOutput(text) {
    outputEl.value = text;
    resultContainer.style.display = 'block';

    // update live stats
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split(/\r*\n/).length;
    statsBar.innerHTML = `<span>Chars: ${chars}</span><span>Words: ${words}</span><span>Lines: ${lines}</span>`;
}

document.getElementById('btnB64Enc').addEventListener('click', () => {
    try {
        const encoded = btoa(unescape(encodeURIComponent(inputEl.value)));
        updateOutput(encoded);
    } catch (err) {
        updateOutput('Error: Failed to encode to Base64!');
    }
});

document.getElementById('btnB64Dec').addEventListener('click', () => {
    try {
        const decoded = decodeURIComponent(escape(atob(inputEl.value)));
        updateOutput(decoded);
    } catch (err) {
        updateOutput('Error: Invalid Base64 string!');
    }
});

document.getElementById('btnUrlEnc').addEventListener('click', () => {
    try {
        updateOutput(encodeURIComponent(inputEl.value));
    } catch (err) {
        updateOutput('Error: Failed to URL encode!');
    }
});

document.getElementById('btnUrlDec').addEventListener('click', () => {
    try {
        updateOutput(decodeURIComponent(inputEl.value));
    } catch (err) {
        updateOutput('Error: Invalid URL encoded string!');
    }
});

document.getElementById('btnUpper').addEventListener('click', () => {
    updateOutput(inputEl.value.toUpperCase());
});

document.getElementById('btnLower').addEventListener('click', () => {
    updateOutput(inputEl.value.toLowerCase());
});

document.getElementById('btnReverse').addEventListener('click', () => {
    updateOutput(inputEl.value.split('').reverse().join(''));
});

document.getElementById('copyOutputBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(outputEl.value);
    const btn = document.getElementById('copyOutputBtn');
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy text', 1500);
});


// Nighregion was here 1:11 AM 10/18/2026