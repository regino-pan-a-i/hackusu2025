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
    console.log(input);

    const conversation = document.getElementById('conversation');
    console.log(conversation);

    const newMessage = document.createElement('div');
    console.log(newMessage);

    // newMessage.textContent = input;
    // conversation.appendChild(newMessage);
    // document.getElementById('prompt').value = '';

});