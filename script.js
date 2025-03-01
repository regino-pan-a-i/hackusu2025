chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'openSidePanel',
        title: 'Open side panel',
        contexts: ['all']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'openSidePanel') {
        // This will open the panel in all the pages on the current window.
        chrome.sidePanel.open({ windowId: tab.windowId });
    }
});

// Handle data retrieval after the button click
function addButtonFunctionality() {
    document.getElementById("button").addEventListener("click", async () => {
        // Get the active tab ID before executing the script
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            if (tabs.length === 0) {
                console.error("No active tab found.");
                return;
            }

            const tabId = tabs[0].id;
            const tabUrl = tabs[0].url;
            
            try{
                // Prevent script injection on chrome:// or restricted URLs
                if (tabUrl.startsWith("chrome://") || tabUrl.startsWith("chrome-extension://") || tabUrl.startsWith("https://chrome.google.com/webstore")) {
                    console.error("Cannot inject script into restricted Chrome pages.");
                    return;
                }
            }catch(e){
                console.log(e)
            }

            // Import the functions dynamically
            const { retrievePrompt } = await import("./scripts/retriever.mjs");

            let prompt = retrievePrompt();
            console.log("Prompt:", prompt);

            try {
                // Execute script to retrieve page data
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    func: () => document.body.innerText, // Run this function in the tab
                }).then((results) => {
                    if (results && results[0]) {
                        console.log("Page Data:", results[0].result);
                    } else {
                        console.error("No results from injected script.");
                    }
                }).catch((error) => console.error("Script execution error:", error));
            } catch (e) {
                console.error("Execution failed:", e);
            }
        });
    });
}

// Ensure script runs after the DOM loads
document.addEventListener("DOMContentLoaded", addButtonFunctionality);

document.getElementById('understand').addEventListener('click', () => {
    chrome.sidePanel.setOptions({ path: 'understand.html' })
        .then(() => chrome.sidePanel.open())
        .catch((error) => console.error(error));
});

document.getElementById("title").addEventListener("click", () => {
    chrome.sidePanel.setOptions({ path: 'index.html' })
        .then(() => chrome.sidePanel.open())
        .catch((error) => console.error(error));
});