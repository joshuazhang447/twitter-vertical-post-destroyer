document.addEventListener('DOMContentLoaded', async () => {
    const btn = document.getElementById('get-images-btn');

    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    //Check if we are on X or Twitter
    const isX = tab.url && (tab.url.includes("x.com") || tab.url.includes("twitter.com"));

    if (!isX) {
        btn.disabled = true;
        btn.textContent = "Only works on X";
        btn.style.backgroundColor = "#ccc";
        btn.style.cursor = "not-allowed";
        return;
    }

    btn.addEventListener('click', () => {
        btn.textContent = "Processing...";
        // Send message to content script
        chrome.tabs.sendMessage(tab.id, { action: "scan_images" }, (response) => {
            // Check for errors
            if (chrome.runtime.lastError) {
                console.error("Error:", chrome.runtime.lastError.message);
                btn.textContent = "Error: Refresh Page";
            } else {
                // Only close it if it's successful
                window.close();
            }
        });
    });
});
