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
async function getTabData() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) {
                console.error("No active tab found.");
                reject("No active tab");
                return;
            }

            const tabId = tabs[0].id;
            const tabUrl = tabs[0].url;

            // Prevent script injection on restricted pages
            if (tabUrl.startsWith("chrome://") || tabUrl.startsWith("chrome-extension://") || tabUrl.startsWith("https://chrome.google.com/webstore")) {
                console.error("Cannot inject script into restricted Chrome pages.");
                reject("Restricted page");
                return;
            }

            resolve({ tabId, tabUrl });
        });
    });
}

async function retrieveData(tab) {
    try {
        // const tab = await getTabData(); // Now it correctly retrieves the tab info
        console.log(tab);

        // Execute script to retrieve page data
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.tabId },
            func: () => document.body.innerText,
        });

        if (results && results[0]) {
            return await getCompletion(results[0].result);
        } else {
            console.error("No results from injected script.");
        }
    } catch (error) {
        console.error("Error retrieving tab data:", error);
    }
}



async function overlayDisplayer(tab) {
    try {
        // const tab = await getTabData();
        console.log(tab);

        await chrome.scripting.executeScript({
            target: { tabId: tab.tabId },
            func: () => {
                let overlay = document.createElement('div');
                overlay.style.backgroundColor = '#CEE2E9'; // Fix incorrect syntax
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100vw';
                overlay.style.height = '100vh';
                overlay.style.zIndex = '9999';
                overlay.style.overflow = 'auto';
                overlay.id='overlay'
                document.body.appendChild(overlay);
            },
        });
    } catch (error) {
        console.error("Error displaying overlay:", error);
    }
}

async function setUp(){
    let tab = await getTabData()
    let data = await retrieveData(tab)
    await overlayDisplayer(tab)
    return {data,tab}
}

async function wordPerWord(data, tab) {
    try {
        document.getElementById('loader').setAttribute('hidden','true');
        await chrome.scripting.executeScript({
            target: { tabId: tab.tabId },
            args: [data], // Pass 'data' as an argument to the function
            func: (textData) => {  // Accept 'textData' as a parameter
                const overlay = document.getElementById("overlay");

                if (overlay) {
                    const displayContainer = document.createElement("div");
                    displayContainer.id = "display-container";
                    displayContainer.style.height = "100%";
                    displayContainer.style.overflow = "hidden";
                    displayContainer.style.display = "flex";
                    displayContainer.style.justifyContent = "center";
                    displayContainer.style.alignItems = "center";
                    //displayContainer.style.top = "50%";
                    //displayContainer.style.left = "50%";
                    displayContainer.style.color = "black";
                    displayContainer.style.fontSize = "4rem";
                    //displayContainer.style.transform = "translate(-50%, -50%)";

                    display = document.createElement("div");
                    display.id = "display";
                    display.style.width = "100%";
                    display.style.fontSize = "4rem";
                    display.style.fontWeight = "bold";
                    display.style.opacity = "1";
                    display.style.transition = "opacity 0.5s ease-in-out";
                    display.style.textAlign = "center";
                    display.style.color = "black";
                    display.style.height = "100%";

                    //displayContainer.appendChild(display);
                    display=displayContainer;
                    overlay.appendChild(displayContainer);

                    // Word display logic
                    let words = textData.split(" ");  // Split text into words
                    let wordCount = 3; // Default words per group
                    let speed = 500; // Default speed in ms
                    let index = 0;
                    let interval;
                    let isPlaying = true; // Play/Pause State

                    function updateWords() {
                        // if (index >= words.length) {
                        //     index = 0; // Restart from the beginning
                        // }

                        // Fade out effect
                        //display.style.opacity = 0;

                        setTimeout(() => {
                            // Display the words as a group
                            display.textContent = words.slice(index, index + wordCount).join(" ");
                            index += wordCount;

                            // Fade in effect
                            display.style.opacity = 1;
                        }, 300); // Wait for fade-out before updating
                    }

                    function startInterval() {
                        clearInterval(interval);
                        if (isPlaying) {
                            interval = setInterval(updateWords, speed);
                        }
                    }
                    

                    // Listen for messages from the extension popup
                    chrome.runtime.onMessage.addListener((message) => {
                        if (message.action === "setSpeed") {
                            speed = message.speed;
                            startInterval();  // Restart with new speed
                        }
                        if (message.action === "setText") {
                            words = message.text.split(" ");
                            index = 0; // Reset index
                            startInterval();
                        }
                        if (message.action === "pause") {
                            isPlaying = false;
                            clearInterval(interval);
                        }
                        if (message.action === "play") {
                            isPlaying = true;
                            startInterval();
                        }
                        if (message.action === "setWordCount") {
                            wordCount=message.wordCount
                        }
                    });

                    startInterval();  // Start word updating initially
                }

            },
        });
    } catch (error) {
        console.error("Error displaying overlay:", error);
    }
}


document.getElementById("speed-slider").addEventListener("input", (event) => {
    let newSpeed = parseFloat(event.target.value);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "setSpeed", speed: newSpeed });
    });
    document.getElementById("speed-value").textContent = `Delay: ${newSpeed}ms`;
});

document.getElementById("increase").addEventListener("click", () => {
    let countSpan = document.getElementById("word-count");
    let newCount = parseInt(countSpan.textContent) + 1;
    countSpan.textContent = newCount;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "setWordCount", wordCount: newCount });
    });
});

document.getElementById("decrease").addEventListener("click", () => {
    let countSpan = document.getElementById("word-count");
    let newCount = Math.max(1, parseInt(countSpan.textContent) - 1);
    countSpan.textContent = newCount;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "setWordCount", wordCount: newCount });
    });
});


document.getElementById("stop-button").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "pause" });
    });
});

document.getElementById("play-button").addEventListener("click", async () => {
    // let { data, tab } = await setUp();
    // await wordPerWord(data, tab);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "play" });
    });
});

async function wordMode(){
    document.getElementById('loader').removeAttribute('hidden');
    let {data, tab} = await setUp()
    document.getElementById('wordControllers').removeAttribute('hidden');
    wordPerWord(data, tab)
}
async function blurMode(){
    
    document.getElementById('word-type').innerText='size';
    document.getElementById('word-count').innerText=8;
    document.getElementById('speed-value').setAttribute('hidden','true');
    document.getElementById('loader').removeAttribute('hidden');
    
    let {data,tab} = await setUp()
    document.getElementById('wordControllers').removeAttribute('hidden');
    
    try {
        document.getElementById('loader').setAttribute('hidden','true');
        // const tab = await getTabData();

        await chrome.scripting.executeScript({
            target: { tabId: tab.tabId },
            func: (data) => {
                console.log(document,data)
                // Create a new style element
const style = document.createElement('style');

// Add the CSS content
style.textContent = `.gradient-blur {
  position: fixed;
  z-index: 5;
  inset: auto 0 0 0;
  height: 55%;
  pointer-events: none;
}
.gradient-blur > div,
.gradient-blur::before,
.gradient-blur::after {
  position: absolute;
  inset: 0;
}
.gradient-blur::before {
  content: "";
  z-index: 1;
  backdrop-filter: blur(0.5px);
  mask: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 1) 12.5%,
    rgba(0, 0, 0, 1) 25%,
    rgba(0, 0, 0, 0) 37.5%
  );
}
.gradient-blur > div:nth-of-type(1) {
  z-index: 2;
  backdrop-filter: blur(1px);
  mask: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 12.5%,
    rgba(0, 0, 0, 1) 25%,
    rgba(0, 0, 0, 1) 37.5%,
    rgba(0, 0, 0, 0) 50%
  );
}
.gradient-blur > div:nth-of-type(2) {
  z-index: 3;
  backdrop-filter: blur(2px);
  mask: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 25%,
    rgba(0, 0, 0, 1) 37.5%,
    rgba(0, 0, 0, 1) 50%,
    rgba(0, 0, 0, 0) 62.5%
  );
}
.gradient-blur > div:nth-of-type(3) {
  z-index: 4;
  backdrop-filter: blur(4px);
  mask: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 37.5%,
    rgba(0, 0, 0, 1) 50%,
    rgba(0, 0, 0, 1) 62.5%,
    rgba(0, 0, 0, 0) 75%
  );
}
.gradient-blur > div:nth-of-type(4) {
  z-index: 5;
  backdrop-filter: blur(8px);
  mask: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 50%,
    rgba(0, 0, 0, 1) 62.5%,
    rgba(0, 0, 0, 1) 75%,
    rgba(0, 0, 0, 0) 87.5%
  );
}
.gradient-blur > div:nth-of-type(5) {
  z-index: 6;
  backdrop-filter: blur(16px);
  mask: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 62.5%,
    rgba(0, 0, 0, 1) 75%,
    rgba(0, 0, 0, 1) 87.5%,
    rgba(0, 0, 0, 0) 100%
  );
}
.gradient-blur > div:nth-of-type(6) {
  z-index: 7;
  backdrop-filter: blur(32px);
  mask: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 75%,
    rgba(0, 0, 0, 1) 87.5%,
    rgba(0, 0, 0, 1) 100%
  );
}
.gradient-blur::after {
  content: "";
  z-index: 8;
  backdrop-filter: blur(64px);
  mask: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 87.5%,
    rgba(0, 0, 0, 1) 100%
  );
}
.gradient-blur2 {
  position: fixed;
  z-index: 5;
  inset: 0 0 0 0;
  height: 55%;
  pointer-events: none;
}
.gradient-blur2 > div,
.gradient-blur2::before,
.gradient-blur2::after {
  position: absolute;
  inset: 0;
}
.gradient-blur2::before {
  content: "";
  z-index: 1;
  backdrop-filter: blur(0.5px);
  mask: linear-gradient(
    to top,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 1) 12.5%,
    rgba(0, 0, 0, 1) 25%,
    rgba(0, 0, 0, 0) 37.5%
  );
}
.gradient-blur2 > div:nth-of-type(1) {
  z-index: 2;
  backdrop-filter: blur(1px);
  mask: linear-gradient(
    to top,
    rgba(0, 0, 0, 0) 12.5%,
    rgba(0, 0, 0, 1) 25%,
    rgba(0, 0, 0, 1) 37.5%,
    rgba(0, 0, 0, 0) 50%
  );
}
.gradient-blur2 > div:nth-of-type(2) {
  z-index: 3;
  backdrop-filter: blur(2px);
  mask: linear-gradient(
    to top,
    rgba(0, 0, 0, 0) 25%,
    rgba(0, 0, 0, 1) 37.5%,
    rgba(0, 0, 0, 1) 50%,
    rgba(0, 0, 0, 0) 62.5%
  );
}
.gradient-blur2 > div:nth-of-type(3) {
  z-index: 4;
  backdrop-filter: blur(4px);
  mask: linear-gradient(
    to top,
    rgba(0, 0, 0, 0) 37.5%,
    rgba(0, 0, 0, 1) 50%,
    rgba(0, 0, 0, 1) 62.5%,
    rgba(0, 0, 0, 0) 75%
  );
}
.gradient-blur2 > div:nth-of-type(4) {
  z-index: 5;
  backdrop-filter: blur(8px);
  mask: linear-gradient(
    to top,
    rgba(0, 0, 0, 0) 50%,
    rgba(0, 0, 0, 1) 62.5%,
    rgba(0, 0, 0, 1) 75%,
    rgba(0, 0, 0, 0) 87.5%
  );
}
.gradient-blur2 > div:nth-of-type(5) {
  z-index: 6;
  backdrop-filter: blur(16px);
  mask: linear-gradient(
    to top,
    rgba(0, 0, 0, 0) 62.5%,
    rgba(0, 0, 0, 1) 75%,
    rgba(0, 0, 0, 1) 87.5%,
    rgba(0, 0, 0, 0) 100%
  );
}
.gradient-blur2 > div:nth-of-type(6) {
  z-index: 7;
  backdrop-filter: blur(32px);
  mask: linear-gradient(
    to top,
    rgba(0, 0, 0, 0) 75%,
    rgba(0, 0, 0, 1) 87.5%,
    rgba(0, 0, 0, 1) 100%
  );
}
.gradient-blur2::after {
  content: "";
  z-index: 8;
  backdrop-filter: blur(64px);
  mask: linear-gradient(
    to top,
    rgba(0, 0, 0, 0) 87.5%,
    rgba(0, 0, 0, 1) 100%
  );

}
.content{
  font-size: 8rem;
  padding: 2rem;
  color: black;
}`;

// Append the style element to the document's head
document.head.appendChild(style);

                overlay=document.getElementById('overlay');
                // Create the gradient-blur div
                const gradientBlur1 = document.createElement('div');
                gradientBlur1.classList.add('gradient-blur2');

                // Append 6 divs inside gradientBlur1
                for (let i = 0; i < 6; i++) {
                const div = document.createElement('div');
                gradientBlur1.appendChild(div);
                }

                // Create the content div
                const contentDiv = document.createElement('div');
                contentDiv.classList.add('content');
                contentDiv.id = 'cont';
                contentDiv.style.color='black';
                contentDiv.style.fontSize='8rem';

                // Create a line break inside the content div
                const br = document.createElement('br');
                contentDiv.appendChild(br);
                contentDiv.textContent=data;

                // Create the second gradient-blur div
                const gradientBlur2 = document.createElement('div');
                gradientBlur2.classList.add('gradient-blur');

                // Append 6 divs inside gradientBlur2
                for (let i = 0; i < 6; i++) {
                const div = document.createElement('div');
                gradientBlur2.appendChild(div);
                }

                // Append everything to the body or another container
                overlay.appendChild(gradientBlur1);
                overlay.appendChild(contentDiv);
                overlay.appendChild(gradientBlur2);

                // Get the scrollable div
                const scrollableDiv = overlay;

                // Get the computed style of the div
                const computedStyle = window.getComputedStyle(document.getElementById('cont'));

                // Get the line-height property value
                const lineHeighto = parseFloat(computedStyle.getPropertyValue('font-size'));
                var lineHeight=lineHeighto;
                lineHeight=lineHeight/30/2;
                // Set the scroll height increment (how much you want to scroll each time)
                const intervalTime = 500/30; // in milliseconds (2000ms = 2 seconds)
                
                let interval;

                function startInterval() {
                    clearInterval(interval);
                    interval = setInterval(()=>scrollableDiv.scrollTop += lineHeight);
                }

                chrome.runtime.onMessage.addListener((message) => {
                    if (message.action === "setSpeed") {
                        lineHeight = lineHeighto*(message.speed/2000.0)/30;
                        startInterval();  // Restart with new speed
                    }
                    if (message.action === "pause") {
                        clearInterval(interval);
                    }
                    if (message.action === "play") {
                        startInterval();
                    }
                    if (message.action === "setWordCount") {
                        wordCount=message.wordCount
                        document.getElementById('cont').style.fontSize=wordCount+'rem';
                    }
                });

            },
            args : [ data ],
        });
    } catch (error) {
        console.error("Error displaying overlay:", error);
    }


    console.log('data ready to parse as lines with blurry background')
}

document.getElementById("blur").addEventListener("click", blurMode)

document.getElementById("word").addEventListener("click", wordMode)

document.getElementById("title").addEventListener("click", () => {
    chrome.sidePanel.setOptions({ path: 'index.html' })
        .then(() => chrome.sidePanel.open())
        .catch((error) => console.error(error));
});