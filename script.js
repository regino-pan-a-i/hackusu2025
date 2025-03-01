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

console.log("you are running this script")

// Handle data retrival after the button click
function addButtonFunctionality(){
    document.getElementById("button").addEventListener('click', async ()=>{
        
        const { retrievePrompt } = await import("./scripts/retriever.mjs");

        let prompt = retrievePrompt();
        console.log(prompt)

        // Inject retrievePageData() into the page
        chrome.scripting.executeScript({
            target: { allFrames: true },
            func: () => document.body.innerText,
        }).then((results) => {
            let data = results[0].result;
            console.log(data);
        });
    })
}

document.addEventListener("DOMContentLoaded", addButtonFunctionality)


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateSidePanel') {
        chrome.sidePanel.setOptions({
            path: request.newHtmlPath
        });
        sendResponse({ status: 'Side panel updated' });
    }
});