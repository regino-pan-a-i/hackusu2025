document.getElementById('understand').addEventListener('click', () => {
    chrome.runtime.sendMessage({
        action: 'updateSidePanel',
        newHtmlPath: 'understand.html'
    }, (response) => {
        console.log(response.status);
    });
});