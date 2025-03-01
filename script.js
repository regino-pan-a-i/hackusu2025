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

document.getElementById('understand').addEventListener('click', () => {
    chrome.sidePanel.setOptions({ path: 'understand.html' })
        .then(() => chrome.sidePanel.open())
        .catch((error) => console.error(error));
});

document.getElementById('focus').addEventListener('click', () => {
    chrome.sidePanel.setOptions({ path: 'focus.html' })
        .then(() => chrome.sidePanel.open())
        .catch((error) => console.error(error));
});


document.getElementById('summary').addEventListener('click', () => {
    chrome.sidePanel.setOptions({ path: 'summary.html' })
        .then(() => chrome.sidePanel.open())
        .catch((error) => console.error(error));
});