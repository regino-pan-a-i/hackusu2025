const apiKey = "YOUR_OPENAI_API_KEY"; // Replace 

async function getCompletion(context) {
    if (!context) {
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
                    content: `Using the following context, answer the question provided:\n\nContext: ${context}\n\nQuestion: Write a summary of the content`
                }
            ]
        })
    });

    let data = await response.json();
    console.log(data);
    data = data.choices[0].message.content;
    updateResponse(data);
}

document.getElementById("title").addEventListener("click", () => {
    chrome.sidePanel.setOptions({ path: 'index.html' })
        .then(() => chrome.sidePanel.open())
        .catch((error) => console.error(error));
});

async function sendContent() {
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

        try {
            // Execute script to retrieve page data
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => document.body.innerText, // Run this function in the tab
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
    });

}

async function updateResponse(text) {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "tts-1",  // or "tts-1-hd" for higher quality
            input: text,
            voice: "alloy"   // Other options: "nova", "shimmer", "echo", "fable"
        })
    });
    if (!response.ok) {
        alert("Failed to generate speech.");
        return;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const container = document.getElementById("audio");
    const audioPlayer = document.createElement("audio");
    audioPlayer.id = "audioPlayer";
    audioPlayer.controls = true;
    audioPlayer.src = audioUrl;
    container.appendChild(audioPlayer);
    container.classList.remove('loader');
    control=document.getElementById("control")
    control.removeAttribute('hidden');
    control.setAttribute('style',"display: flex; align-items: center; gap: 10px; margin-top: 10px;");
    const slider=document.getElementById("speedSlider");
    slider.addEventListener('input',changeSpeed);
    const plus=document.getElementById("plus");
    plus.addEventListener('click',increaseSpeed);
    const minus=document.getElementById("minus");
    minus.addEventListener('click',decreaseSpeed);
}
// Function to change playback speed
function changeSpeed() {
    const audioPlayer = document.getElementById("audioPlayer");
    const speedSlider = document.getElementById("speedSlider");
    const speedValue = document.getElementById("speedValue");

    if (audioPlayer) {
        const speed = parseFloat(speedSlider.value);
        audioPlayer.playbackRate = speed;
        speedValue.textContent = speed.toFixed(1) + "x"; // Update displayed speed
    }
}

function adjustSpeed(amount) {
    const speedSlider = document.getElementById("speedSlider");
    let newSpeed = parseFloat(speedSlider.value) + amount;

    // Keep speed within range (0.5x to 2x)
    newSpeed = Math.max(0.5, Math.min(2, newSpeed));
    speedSlider.value = newSpeed;
    changeSpeed()
}
function increaseSpeed(){adjustSpeed(0.1);}
function decreaseSpeed(){adjustSpeed(-0.1);}
sendContent()