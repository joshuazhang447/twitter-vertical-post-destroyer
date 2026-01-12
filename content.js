console.log("Twitter Vertical Post Fixer: Content script loaded");

function getOriginalImageUrl(url) {
    try {
        const urlObj = new URL(url);
        urlObj.searchParams.set('name', 'orig');
        return urlObj.toString();
    } catch (e) {
        return url;
    }
}

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = url;
    });
}

async function combineAndShowImages(imageUrls) {
    if (imageUrls.length === 0) return;

    console.log("Loading images...");
    try {
        const images = await Promise.all(imageUrls.map(url => loadImage(url)));

        const width = images[0].width;
        const totalHeight = images.reduce((sum, img) => sum + img.height, 0);

        console.log(`Canvas dimensions: ${width}x${totalHeight}`);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = totalHeight;
        const ctx = canvas.getContext('2d');

        let currentY = 0;
        images.forEach(img => {
            ctx.drawImage(img, 0, currentY);
            currentY += img.height;
        });

        const dataUrl = canvas.toDataURL('image/png');

        try {
            await new Promise((resolve, reject) => {
                chrome.storage.local.set({ combinedImage: dataUrl }, () => {
                    if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                    else resolve();
                });
            });

            console.log("Image saved to storage, requesting viewer open...");
            chrome.runtime.sendMessage({ action: "open_viewer" });
        } catch (storageErr) {
            console.error("Storage error:", storageErr);
            alert("Error saving image! The combined image might be too large.");
        }

    } catch (err) {
        console.error("Error combining images:", err);
        alert("Failed to load or combine images. Check console for details.");
    }
}

function processTweets() {
    console.log("Twitter Vertical Post Fixer: Scanning for vertical posts...");
    const articles = document.querySelectorAll('article[data-testid="tweet"]');

    let foundImages = [];

    for (const article of articles) {
        const tweetText = article.querySelector('div[data-testid="tweetText"]');
        if (!tweetText) continue;

        const inlinePhotos = tweetText.querySelectorAll('div[data-testid="tweetPhoto"] img');

        if (inlinePhotos.length > 1) {
            console.log("Twitter Vertical Post Fixer: Found vertical post with " + inlinePhotos.length + " images.");
            foundImages = Array.from(inlinePhotos).map(img => getOriginalImageUrl(img.src));
            break;
        }
    }

    if (foundImages.length > 0) {
        combineAndShowImages(foundImages);
    } else {
        console.log("Twitter Vertical Post Fixer: No vertical multi-image posts found.");
        alert("No vertical posts found on screen! Please scroll so the post is visible.");
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scan_images") {
        processTweets();
        sendResponse({ status: "processing" });
    }
});
