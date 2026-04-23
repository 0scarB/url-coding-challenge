"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var State;
(function (State) {
    State[State["EMPTY_URL"] = 0] = "EMPTY_URL";
    State[State["NOT_HTTP_OR_HTTPS"] = 1] = "NOT_HTTP_OR_HTTPS";
    State[State["INVALID_FORMAT"] = 2] = "INVALID_FORMAT";
    State[State["REQUEST_THROTTLED"] = 3] = "REQUEST_THROTTLED";
    State[State["AWAITING_API_URL_TYPE_RESPONSE"] = 4] = "AWAITING_API_URL_TYPE_RESPONSE";
    State[State["NOT_FOUND"] = 5] = "NOT_FOUND";
    State[State["POINTS_TO_FILE"] = 6] = "POINTS_TO_FILE";
    State[State["POINTS_TO_DIR"] = 7] = "POINTS_TO_DIR";
    State[State["REQUEST_FAILED"] = 8] = "REQUEST_FAILED";
    State[State["BUG"] = 9] = "BUG";
})(State || (State = {}));
const MOCK_FETCH = true;
const MOCK_FETCH_DELAY_IN_MS = 1000;
const MOCK_FETCH_EXISTENT_DOMAINS = ["exists.com", "tuta.com", "xkcd.com", "google.com"];
const MOCK_FETCH_DIR_SUFFIX = "/";
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_NOT_FOUND = 404;
const API_THROTTLE_INTERVAL_IN_MS = 2000;
const API_BASE_URL = "https://bogus.com/api/";
const API_URL_TYPE_ENDPOINT_PATH = "url-type";
function crash(errorMsg) {
    // Display the error message at the top of the viewport
    // so it's visible when the developer console is closed.
    const errorDiv = document.createElement("div");
    errorDiv.style.position = "fixed";
    errorDiv.style.top = "0";
    errorDiv.style.left = "0";
    errorDiv.style.color = "white";
    errorDiv.style.backgroundColor = "red";
    errorDiv.style.fontWeight = "bold";
    errorDiv.textContent = errorMsg;
    document.body.appendChild(errorDiv);
    throw new Error(errorMsg);
}
function getElementByIdOrCrash(id) {
    const el = document.getElementById(id);
    if (!el)
        crash(`No element with id="${id}"!`);
    return el;
}
function getInputElementByIdOrCrash(id) {
    const el = getElementByIdOrCrash(id);
    if (!(el instanceof HTMLInputElement))
        crash(`Element with id="${id}" is not an input element!`);
    return el;
}
const inputEl = getInputElementByIdOrCrash("url-input");
const pendingStatusMsgEl = getElementByIdOrCrash("url-input-pending-status-msg");
const successStatusMsgEl = getElementByIdOrCrash("url-input-success-status-msg");
let state = State.EMPTY_URL;
let requestTimestamp = -1;
let doRequestTimeoutId = -1;
function delay(milliseconds) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    });
}
function fetchMock(url, options) {
    return __awaiter(this, void 0, void 0, function* () {
        console.info(`Mock fetch("${url}", ${JSON.stringify(options)})`);
        yield delay(MOCK_FETCH_DELAY_IN_MS);
        const urlToCheck = options.body;
        if (MOCK_FETCH_EXISTENT_DOMAINS.includes(new URL(urlToCheck).hostname)) {
            if (urlToCheck.endsWith(MOCK_FETCH_DIR_SUFFIX)) {
                console.info(`Mock response body: dir`);
                return new Response("dir");
            }
            else {
                console.info(`Mock response body: file`);
                return new Response("file");
            }
        }
        else {
            console.info(`Mock response: 404 Not Found`);
            return new Response("", { status: HTTP_STATUS_NOT_FOUND });
        }
    });
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
            inputEl.setCustomValidity("Request failed. There may be a problem with the server. " +
                "Please notify developers!");
            break;
        case State.BUG:
            inputEl.setCustomValidity("Encountered a bug. Please notify developers!");
            break;
    }
    inputEl.reportValidity();
}
function doRequest() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = inputEl.value;
        let responseStatus = -1;
        let responseBody = "";
        try {
            requestTimestamp = Date.now();
            const responsePromise = (MOCK_FETCH ? fetchMock : fetch)(API_BASE_URL + API_URL_TYPE_ENDPOINT_PATH, {
                method: "POST",
                headers: { "Content-Type": "text/plain" },
                body: url,
            });
            state = State.AWAITING_API_URL_TYPE_RESPONSE;
            updateUi();
            const response = yield responsePromise;
            responseStatus = response.status;
            if (response.status === HTTP_STATUS_OK)
                responseBody = yield response.text();
        }
        catch (error) {
            state = State.REQUEST_FAILED;
            updateUi();
            return;
        }
        // Return early, if the URL no longer matches the most recent input
        if (url !== inputEl.value)
            return;
        if (responseStatus === HTTP_STATUS_OK && responseBody === "file") {
            state = State.POINTS_TO_FILE;
        }
        else if (responseStatus === HTTP_STATUS_OK && responseBody === "dir") {
            state = State.POINTS_TO_DIR;
        }
        else if (responseStatus === HTTP_STATUS_NOT_FOUND) {
            state = State.NOT_FOUND;
        }
        else {
            state = State.BUG;
            updateUi();
            return;
        }
        updateUi();
    });
}
function update() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = inputEl.value;
        // Check the URL's format
        try {
            let urlObj = new URL(url);
            if (urlObj.protocol !== "https:" && urlObj.protocol !== "http:") {
                state = State.NOT_HTTP_OR_HTTPS;
                updateUi();
                return;
            }
        }
        catch (error) {
            state = State.INVALID_FORMAT;
            updateUi();
            return;
        }
        // Throttle requests and schedule them for later with setTimeout, if needed ...
        const timestamp = Date.now();
        // NOTE: clearTimeout does nothing if doRequestTimeoutId is not an active timeout ID
        clearTimeout(doRequestTimeoutId);
        if (timestamp - requestTimestamp < API_THROTTLE_INTERVAL_IN_MS) {
            doRequestTimeoutId =
                setTimeout(doRequest, requestTimestamp + API_THROTTLE_INTERVAL_IN_MS - timestamp);
            state = State.REQUEST_THROTTLED;
            updateUi();
            return;
        }
        // ... otherwise, do the request immediately
        doRequest();
    });
}
inputEl.addEventListener("input", update);
update();
