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
    REQUEST_THROTTLED,
    AWAITING_API_URL_TYPE_RESPONSE,
    NOT_FOUND,
    POINTS_TO_FILE,
    POINTS_TO_DIR,  
    REQUEST_FAILED,
    BUG,
}

const MOCK_FETCH = true;
const MOCK_FETCH_DELAY_IN_MS      = 1000;
const MOCK_FETCH_EXISTENT_DOMAINS = [ "exists.com", "tuta.com", "xkcd.com", "google.com" ];
const MOCK_FETCH_DIR_SUFFIX       = "/";

const HTTP_STATUS_OK        = 200;
const HTTP_STATUS_NOT_FOUND = 404;

const API_THROTTLE_INTERVAL_IN_MS = 2000;
const API_BASE_URL                = "https://bogus.com/api/";
const API_URL_TYPE_ENDPOINT_PATH  = "url-type";

function crash(errorMsg: string): never {
    // Display the error message at the top of the viewport
    // so it's visible when the developer console is closed.
    const errorDiv = document.createElement("div");
    errorDiv.style.position        = "fixed";
    errorDiv.style.top             = "0";
    errorDiv.style.left            = "0";
    errorDiv.style.color           = "white";
    errorDiv.style.backgroundColor = "red";
    errorDiv.style.fontWeight      = "bold";
    errorDiv.textContent = errorMsg;
    document.body.appendChild(errorDiv);

    throw new Error(errorMsg);
}

function getElementByIdOrCrash(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) crash(`No element with id="${id}"!`);
    return el;
}
function getInputElementByIdOrCrash(id: string): HTMLInputElement {
    const el = getElementByIdOrCrash(id);
    if (!(el instanceof HTMLInputElement))
        crash(`Element with id="${id}" is not an input element!`);
    return el as HTMLInputElement;
}

const inputEl            = getInputElementByIdOrCrash("url-input");
const pendingStatusMsgEl = getElementByIdOrCrash("url-input-pending-status-msg");
const successStatusMsgEl = getElementByIdOrCrash("url-input-success-status-msg");

let state: State = State.EMPTY_URL;
let requestTimestamp   = -1;
let doRequestTimeoutId = -1;

async function delay(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function fetchMock(url: string, options: fetchOptions): Promise<Response> {
    console.info(`Mock fetch("${url}", ${JSON.stringify(options)})`);

    await delay(MOCK_FETCH_DELAY_IN_MS);

    const urlToCheck = options.body;
    if (MOCK_FETCH_EXISTENT_DOMAINS.includes(new URL(urlToCheck).hostname)) {
        if (urlToCheck.endsWith(MOCK_FETCH_DIR_SUFFIX)) {
            console.info(`Mock response body: dir`);
            return new Response("dir");
        } else {
            console.info(`Mock response body: file`);
            return new Response("file");
        }
    } else {
        console.info(`Mock response: 404 Not Found`);
        return new Response("", {status: HTTP_STATUS_NOT_FOUND});
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
        case State.REQUEST_THROTTLED:
            pendingStatusMsgEl.textContent = "Checking URL existence... (Throttling)";
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
        case State.REQUEST_FAILED:
            inputEl.setCustomValidity(
                "Request failed. There may be a problem with the server. " +
                "Please notify developers!");
            break;
        case State.BUG:
            inputEl.setCustomValidity("Encountered a bug. Please notify developers!");
            break;
    }
    inputEl.reportValidity();
}

function checkUrlFormat(url: string): boolean {
    try {
        let urlObj = new URL(url);
        if (urlObj.protocol !== "https:" && urlObj.protocol !== "http:") {
            state = State.NOT_HTTP_OR_HTTPS;
            updateUi();
            return false;
        }
    } catch (error) {
        state = State.INVALID_FORMAT;
        updateUi();
        return false;
    }
    return true;
}

async function doRequest() {
    const url = inputEl.value;
    if (!checkUrlFormat(url)) return;

    let responseStatus = -1;
    let responseBody   = "";
    try {
        requestTimestamp = Date.now();

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
        state = State.REQUEST_FAILED;
        updateUi();
        return;
    }

    // Return early, if the URL no longer matches the most recent input
    if (url !== inputEl.value) return;

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
        updateUi();
        return;
    }
    updateUi();
}

async function update() {
    const url = inputEl.value;
    if (!checkUrlFormat(url)) return;

    // Throttle requests and schedule them for later with setTimeout, if needed ...
    const timestamp = Date.now();
    // NOTE: clearTimeout does nothing if doRequestTimeoutId is not an active timeout ID
    clearTimeout(doRequestTimeoutId);
    if (timestamp - requestTimestamp < API_THROTTLE_INTERVAL_IN_MS) {
        doRequestTimeoutId =
            setTimeout(doRequest,
                       requestTimestamp + API_THROTTLE_INTERVAL_IN_MS - timestamp);
        state = State.REQUEST_THROTTLED;
        updateUi();
        return;
    }
    // ... otherwise, do the request immediately
    doRequest();
}

inputEl.addEventListener("input", update);
update();

