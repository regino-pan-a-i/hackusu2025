
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

    let data = await response.json();
    console.log(data);
    data = data.choices[0].message.content
    writeDialog('received', data)
}

document.getElementById("title").addEventListener("click", () => {
    chrome.sidePanel.setOptions({ path: 'index.html' })
        .then(() => chrome.sidePanel.open())
        .catch((error) => console.error(error));
});

async function addButtonFunctionality(input) {
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

        // let prompt = retrievePrompt();
        console.log("Prompt:", input);

        try {
            // Execute script to retrieve page data
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => document.body.innerText, // Run this function in the tab
            }).then( (results) => {
                if (results && results[0]) {
                    getCompletion(input,results[0].result);
                    
                } else {
                    console.error("No results from injected script.");
                }
            }).catch((error) => console.error("Script execution error:", error));
        } catch (e) {
            console.error("Execution failed:", e);
        }
    });

}

document.getElementById('submit').addEventListener('click', async () => {
    const input = document.getElementById('prompt').value;

    writeDialog('sent', input)

    document.getElementById('prompt').value = '';
    
    //aqui haz tu vaina
    await addButtonFunctionality(input)
});

function scrollToBottom() {
    const conversation = document.getElementById("conversation");
    conversation.scrollTop = conversation.scrollHeight;
}

function writeDialog(className, input){
    const conversation = document.getElementById('conversation');

    const newMessage = document.createElement('div');
    newMessage.classList.add(className)
    newMessage.textContent = input;
    conversation.appendChild(newMessage);
    scrollToBottom();

}