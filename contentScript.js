// document.getElementById('understand').addEventListener('click', () => {
//     chrome.runtime.sendMessage({
//         action: 'updateSidePanel',
//         newHtmlPath: 'understand.html'
//     }, (response) => {
//         console.log(response.status);
//     });
// });

const apiKey = "YOUR_OPENAI_API_KEY"; // Replace 

async function getCompletion(question, context) {
    if (!question || !context) {
        console.error("question or context is undefined.");
        return;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [
                //{ role: "system", content: "You are a helpful assistant." },
                {
                    role: "user",
                    content: `Using the following context, answer the question provided:\n\nContext: ${context}\n\nQuestion: ${question}`
                }
            ]
        })
    });

    const data = await response.json();
    console.log(data);
    return data.choices[0].message.content
}

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

    //aqui haz tu vaina

    conversation.appendChild(newMessage);
    document.getElementById('prompt').value = '';
});