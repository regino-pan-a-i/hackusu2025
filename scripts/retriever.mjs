export function retrievePageData(){
    let data = document.body.innerText
    // console.log(data)
    return data
}

export function retrievePrompt(){
    let prompt = document.getElementById('prompt').value
    console.log(prompt)
    return prompt
}
