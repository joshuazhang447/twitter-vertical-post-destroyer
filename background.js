chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "open_viewer") {
        chrome.tabs.create({ url: chrome.runtime.getURL("viewer.html") });
    }
});
