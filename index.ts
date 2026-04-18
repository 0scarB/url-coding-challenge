enum UrlCheckState {
    INVALID_FORMAT = 1,
    POINTS_TO_FILE = 2,
    POINTS_TO_DIR  = 3,
}

const inputEl            = document.getElementById("url-input") as HTMLInputElement;
const successStatusMsgEl = document.getElementById("url-input-success-status-msg");

function displayStatus(state: UrlCheckState) {
    // Reset UI
    inputEl.setCustomValidity("");
    successStatusMsgEl.textContent = "";
    // Update UI
    switch (state) {
        case UrlCheckState.INVALID_FORMAT:
            console.log(state);
            inputEl.setCustomValidity("Invalid URL format!");
            break;
        case UrlCheckState.POINTS_TO_FILE:
            successStatusMsgEl.textContent = "URL points to file.";
            break;
        case UrlCheckState.POINTS_TO_DIR:
            successStatusMsgEl.textContent = "URL points to folder.";
            break;
    }
    console.log(inputEl.checkValidity());
    inputEl.reportValidity();
}

function update() {
    //displayStatus(UrlCheckState.INVALID_FORMAT);
    //displayStatus(UrlCheckState.POINTS_TO_FILE);
    displayStatus(UrlCheckState.POINTS_TO_DIR);
}

inputEl.addEventListener("input", update);
update();
