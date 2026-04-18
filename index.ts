"use strict";

enum UrlCheckState {
    EMPTY_URL = 0,
    NOT_HTTP_OR_HTTPS,
    INVALID_FORMAT,
    POINTS_TO_FILE,
    POINTS_TO_DIR,  
}

const inputEl            = document.getElementById("url-input") as HTMLInputElement;
const successStatusMsgEl = document.getElementById("url-input-success-status-msg");

let state: UrlCheckState = UrlCheckState.EMPTY_URL;

function update() {
    const url = inputEl.value;

    updateState: {
        //
        // Check URL Format
        //
        try {
            let urlObj = new URL(url);
            if (urlObj.protocol !== "https:" && urlObj.protocol !== "http:") {
                state = UrlCheckState.NOT_HTTP_OR_HTTPS;
                break updateState;
            }
        } catch (error) {
            state = UrlCheckState.INVALID_FORMAT;
            break updateState;
        }

        // TODO: await fetch request
        state = UrlCheckState.POINTS_TO_FILE;
    }

    updateUI: {
        // Reset UI
        inputEl.setCustomValidity("");
        successStatusMsgEl.textContent = "";
        // Update UI
        switch (state) {
            case UrlCheckState.NOT_HTTP_OR_HTTPS:
                inputEl.setCustomValidity("URL must start with 'https://' or 'http://'!");
                break;
            case UrlCheckState.INVALID_FORMAT:
                inputEl.setCustomValidity("Invalid URL format!");
                break;
            case UrlCheckState.POINTS_TO_FILE:
                successStatusMsgEl.textContent = "URL points to file.";
                break;
            //case UrlCheckState.POINTS_TO_DIR:
            //    successStatusMsgEl.textContent = "URL points to folder.";
            //    break;
        }
        inputEl.reportValidity();
    }
}

inputEl.addEventListener("input", update);
update();
