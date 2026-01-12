document.addEventListener('DOMContentLoaded', () => {
    const imgElement = document.getElementById('result-image');
    const saveBtn = document.getElementById('save-btn');

    // Load image from storage
    chrome.storage.local.get(['combinedImage'], (result) => {
        if (result.combinedImage) {
            imgElement.src = result.combinedImage;

            saveBtn.onclick = () => {
                const a = document.createElement('a');
                a.href = result.combinedImage;
                a.download = `twitter-combined-${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };
        } else {
            document.body.innerHTML = "<h1>No image found. Please try again.</h1>";
        }
    });
});
