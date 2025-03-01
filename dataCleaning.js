const apiKey = "YOUR_OPENAI_API_KEY"; // Replace 

async function getCompletion(context) {
    if (!context) {
        console.error("context is undefined.");
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
                {
                    role: "user",
                    content: `You will receive raw text extracted from a webpage. This text may contain valuable content along with unnecessary elements such as advertisements, cookie consent banners, user comments, navigation menus, disclaimers, and promotional text. Your task is to extract and return only the main document content while preserving its logical flow and coherence.
                        Guidelines:\nPreserve Core Content:\n
                        If the webpage is an article, blog post, or research paper, extract only the main body of the text, keeping all essential paragraphs and sections intact.\n
                        If the webpage is a recipe, include the full recipe (ingredients, steps, and relevant tips) but remove filler content such as personal anecdotes or excessive storytelling that does not contribute to the recipe itself.\n
                        If the page contains structured data (e.g., product descriptions, reviews, or FAQs), keep the essential information while removing unnecessary repetition or unrelated user-generated content.\n
                        Remove Unrelated Elements:\n
                        Eliminate ads, cookie banners, promotional text, and "subscribe" or "related articles" sections.\n
                        Discard navigation menus, footer links, and any redundant UI elements.\n
                        Exclude excessive disclaimers, legal notices, or repeated SEO-driven text.\n
                        Maintain Logical Flow:\n
                        Ensure the extracted content remains well-structured and readable.\n
                        Do not remove sentences or sections that are necessary for understanding transitions between ideas.\n
                        If the webpage includes headings or sections that contribute to the readability, retain them.\n
                        Context Awareness:\n
                        Recognize the type of content (e.g., research article vs. recipe site) and adapt filtering accordingly.\n
                        If in doubt, prioritize keeping relevant information over aggressive filtering.\n
                        Output Format:\n
                        Return the cleaned and structured text in a human-readable format without any added summaries or modifications. Preserve original paragraph breaks and headings where applicable.
                        Here is the text: ${context}`
                }
            ]
        })
    });

    let data = await response.json();
    data = data.choices[0].message.content;
    console.log(data);
    return data;
}

function getTabData(){
    // Get the active tab ID before executing the script
    let currrentTab = chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
            console.error("No active tab found.");
            return;
        }

        const tabId = tabs[0].id;
        const tabUrl = tabs[0].url;
        let myTab = {'tabId': tabId, 'tabUrl':tabUrl}
        
        // Prevent script injection on chrome:// or restricted URLs
        try{
            if (tabUrl.startsWith("chrome://") || tabUrl.startsWith("chrome-extension://") || tabUrl.startsWith("https://chrome.google.com/webstore")) {
                console.error("Cannot inject script into restricted Chrome pages.");
                return null;
            }
        }catch(e){
            console.log(e)
        }

        return myTab
    })
    return currrentTab
}

function retrieveData() {

    const tab = getTabData()

    // Execute script to retrieve page data
    try {
        chrome.scripting.executeScript({
            target: { tabId: tab['tabId'] },
            func: () => document.body.innerText, 
        }).then( (results) => {
            if (results && results[0]) {
                getCompletion(results[0].result);
                
            } else {
                console.error("No results from injected script.");
            }
        }).catch((error) => console.error("Script execution error:", error));
    } catch (e) {
        console.error("Execution failed:", e);
    }


}


function wordPerWord(data){

    // Execute script to retrieve page data
    try {
        chrome.scripting.executeScript({
            target: { tabId: tab['tabId'] },
            func: () => {
                let overlay = document.createElement('div')
                overlay.style.position = "fixed";
                overlay.style.top = "0";
                overlay.style.left = "0";
                overlay.style.width = "100vw";
                overlay.style.height = "100vh";
            }, 
        }).then( 
            displaywords(data)
        ).catch((error) => console.error("Script execution error:", error));
    } catch (e) {
        console.error("Execution failed:", e);
    }

}

function wordMode(){

    let data = retrieveData()
    wordPerWord(data)
}
function blurMode(){
    
    let data = retrieveData()
    console.log('data ready to parse as lines with blurry background')
}

document.getElementById("blur").addEventListener("click", blurMode)

document.getElementById("word").addEventListener("click", wordMode)

document.getElementById("title").addEventListener("click", () => {
    chrome.sidePanel.setOptions({ path: 'index.html' })
        .then(() => chrome.sidePanel.open())
        .catch((error) => console.error(error));
});