"use strict";

type fetchOptions = {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: string,
}

enum State {
    EMPTY_URL = 0,
    NOT_HTTP_OR_HTTPS,
    INVALID_FORMAT,
    NOT_FOUND,
    AWAITING_API_URL_TYPE_RESPONSE,
    POINTS_TO_FILE,
    POINTS_TO_DIR,  
    BUG,
}

const MOCK_FETCH = true;
const MOCK_FETCH_DELAY            = 1000;
const MOCK_FETCH_EXISTENT_DOMAINS = [ "exists.com", "tuta.com", "xkcd.com", "google.com" ];
const MOCK_FETCH_DIR_SUFFIX       = "/";

const HTTP_STATUS_OK        = 200;
const HTTP_STATUS_NOT_FOUND = 404;

const API_BASE_URL               = "https://bogus.com/api/";
const API_URL_TYPE_ENDPOINT_PATH = "url-type";

const inputEl            = document.getElementById("url-input") as HTMLInputElement;
const pendingStatusMsgEl = document.getElementById("url-input-pending-status-msg");
const successStatusMsgEl = document.getElementById("url-input-success-status-msg");

let state: State = State.EMPTY_URL;

async function delay(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function fetchMock(url: string, options: fetchOptions): Promise<Response> {
    await delay(MOCK_FETCH_DELAY);

    const urlToCheck = options.body;
    if (MOCK_FETCH_EXISTENT_DOMAINS.includes(new URL(urlToCheck).hostname)) {
        if (urlToCheck.endsWith(MOCK_FETCH_DIR_SUFFIX)) {
            return new Response("dir");
        } else {
            return new Response("file");
        }
    } else {
        throw {status: 404};
    }
}

function updateUi() {
    // Reset UI
    inputEl.setCustomValidity("");
    pendingStatusMsgEl.textContent = "";
    successStatusMsgEl.textContent = "";
    // Update UI
    switch (state) {
        case State.NOT_HTTP_OR_HTTPS:
            inputEl.setCustomValidity("URL must start with 'https://' or 'http://'!");
            break;
        case State.INVALID_FORMAT:
            inputEl.setCustomValidity("Invalid URL format!");
            break;
        case State.AWAITING_API_URL_TYPE_RESPONSE:
            pendingStatusMsgEl.textContent = "Checking URL existence...";
            break;
        case State.NOT_FOUND:
            inputEl.setCustomValidity("URL does not exist!");
            break;
        case State.POINTS_TO_FILE:
            successStatusMsgEl.textContent = "URL points to file.";
            break;
        case State.POINTS_TO_DIR:
            successStatusMsgEl.textContent = "URL points to folder.";
            break;
        case State.BUG:
            inputEl.setCustomValidity("Encountered a bug. Please notify developers!");
            break;
    }
    inputEl.reportValidity();
}

async function update() {
    const url = inputEl.value;

    //
    // Check URL Format
    //
    try {
        let urlObj = new URL(url);
        if (urlObj.protocol !== "https:" && urlObj.protocol !== "http:") {
            state = State.NOT_HTTP_OR_HTTPS;
            updateUi();
            return;
        }
    } catch (error) {
        state = State.INVALID_FORMAT;
        updateUi();
        return;
    }

    let responseStatus = -1;
    let responseBody   = "";
    try {
        const responsePromise = (MOCK_FETCH ? fetchMock : fetch)(
            API_BASE_URL + API_URL_TYPE_ENDPOINT_PATH, {
                method: "POST",
                headers: { "Content-Type": "text/plain" },
                body: url,
            });

        state = State.AWAITING_API_URL_TYPE_RESPONSE;
        updateUi();

        const response = await responsePromise;
        responseStatus = response.status;
        if (response.status === HTTP_STATUS_OK)
            responseBody = await response.text();
    } catch (error) {
        responseStatus = error.status;
    }
    if (responseStatus === HTTP_STATUS_OK && responseBody === "file") {
        state = State.POINTS_TO_FILE;
    } else
    if (responseStatus === HTTP_STATUS_OK && responseBody === "dir") {
        state = State.POINTS_TO_DIR;
    } else
    if (responseStatus === HTTP_STATUS_NOT_FOUND) {
        state = State.NOT_FOUND;
    } else {
        state = State.BUG;
        return;
    }
    updateUi();
}

inputEl.addEventListener("input", update);
update();

