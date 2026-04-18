"use strict";
var UrlCheckState;
(function (UrlCheckState) {
    UrlCheckState[UrlCheckState["EMPTY_URL"] = 0] = "EMPTY_URL";
    UrlCheckState[UrlCheckState["NOT_HTTP_OR_HTTPS"] = 1] = "NOT_HTTP_OR_HTTPS";
    UrlCheckState[UrlCheckState["INVALID_FORMAT"] = 2] = "INVALID_FORMAT";
    UrlCheckState[UrlCheckState["POINTS_TO_FILE"] = 3] = "POINTS_TO_FILE";
    UrlCheckState[UrlCheckState["POINTS_TO_DIR"] = 4] = "POINTS_TO_DIR";
})(UrlCheckState || (UrlCheckState = {}));
var inputEl = document.getElementById("url-input");
var successStatusMsgEl = document.getElementById("url-input-success-status-msg");
var state = UrlCheckState.EMPTY_URL;
function update() {
    var url = inputEl.value;
    updateState: {
        //
        // Check URL Format
        //
        try {
            var urlObj = new URL(url);
            if (urlObj.protocol !== "https:" && urlObj.protocol !== "http:") {
                state = UrlCheckState.NOT_HTTP_OR_HTTPS;
                break updateState;
            }
        }
        catch (error) {
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
