// document.getElementById('understand').addEventListener('click', () => {
//     chrome.runtime.sendMessage({
//         action: 'updateSidePanel',
//         newHtmlPath: 'understand.html'
//     }, (response) => {
//         console.log(response.status);
//     });
// });

document.getElementById("title").addEventListener("click", () => {
    chrome.sidePanel.setOptions({ path: 'index.html' })
        .then(() => chrome.sidePanel.open())
        .catch((error) => console.error(error));
});

document.getElementById('submit').addEventListener('click', () => {
    const input = document.getElementById('prompt').value;

    const conversation = document.getElementById('conversation');

    const newMessage = document.createElement('div');
    newMessage.classList.add('sent');
    newMessage.textContent = input;

    conversation.appendChild(newMessage);
});