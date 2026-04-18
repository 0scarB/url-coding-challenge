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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var State;
(function (State) {
    State[State["EMPTY_URL"] = 0] = "EMPTY_URL";
    State[State["NOT_HTTP_OR_HTTPS"] = 1] = "NOT_HTTP_OR_HTTPS";
    State[State["INVALID_FORMAT"] = 2] = "INVALID_FORMAT";
    State[State["NOT_FOUND"] = 3] = "NOT_FOUND";
    State[State["AWAITING_API_URL_TYPE_RESPONSE"] = 4] = "AWAITING_API_URL_TYPE_RESPONSE";
    State[State["POINTS_TO_FILE"] = 5] = "POINTS_TO_FILE";
    State[State["POINTS_TO_DIR"] = 6] = "POINTS_TO_DIR";
    State[State["BUG"] = 7] = "BUG";
})(State || (State = {}));
var MOCK_FETCH = true;
var MOCK_FETCH_DELAY = 1000;
var MOCK_FETCH_EXISTENT_DOMAINS = ["exists.com", "tuta.com", "xkcd.com", "google.com"];
var MOCK_FETCH_DIR_SUFFIX = "/";
var HTTP_STATUS_OK = 200;
var HTTP_STATUS_NOT_FOUND = 404;
var API_BASE_URL = "https://bogus.com/api/";
var API_URL_TYPE_ENDPOINT_PATH = "url-type";
var inputEl = document.getElementById("url-input");
var pendingStatusMsgEl = document.getElementById("url-input-pending-status-msg");
var successStatusMsgEl = document.getElementById("url-input-success-status-msg");
var state = State.EMPTY_URL;
function delay(milliseconds) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, milliseconds); })];
        });
    });
}
function fetchMock(url, options) {
    return __awaiter(this, void 0, void 0, function () {
        var urlToCheck;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, delay(MOCK_FETCH_DELAY)];
                case 1:
                    _a.sent();
                    urlToCheck = options.body;
                    if (MOCK_FETCH_EXISTENT_DOMAINS.includes(new URL(urlToCheck).hostname)) {
                        if (urlToCheck.endsWith(MOCK_FETCH_DIR_SUFFIX)) {
                            return [2 /*return*/, new Response("dir")];
                        }
                        else {
                            return [2 /*return*/, new Response("file")];
                        }
                    }
                    else {
                        throw { status: 404 };
                    }
                    return [2 /*return*/];
            }
        });
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
function update() {
    return __awaiter(this, void 0, void 0, function () {
        var url, urlObj, responseStatus, responseBody, responsePromise, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = inputEl.value;
                    //
                    // Check URL Format
                    //
                    try {
                        urlObj = new URL(url);
                        if (urlObj.protocol !== "https:" && urlObj.protocol !== "http:") {
                            state = State.NOT_HTTP_OR_HTTPS;
                            updateUi();
                            return [2 /*return*/];
                        }
                    }
                    catch (error) {
                        state = State.INVALID_FORMAT;
                        updateUi();
                        return [2 /*return*/];
                    }
                    responseStatus = -1;
                    responseBody = "";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    responsePromise = (MOCK_FETCH ? fetchMock : fetch)(API_BASE_URL + API_URL_TYPE_ENDPOINT_PATH, {
                        method: "POST",
                        headers: { "Content-Type": "text/plain" },
                        body: url
                    });
                    state = State.AWAITING_API_URL_TYPE_RESPONSE;
                    updateUi();
                    return [4 /*yield*/, responsePromise];
                case 2:
                    response = _a.sent();
                    responseStatus = response.status;
                    if (!(response.status === HTTP_STATUS_OK)) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.text()];
                case 3:
                    responseBody = _a.sent();
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    responseStatus = error_1.status;
                    return [3 /*break*/, 6];
                case 6:
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
                        return [2 /*return*/];
                    }
                    updateUi();
                    return [2 /*return*/];
            }
        });
    });
}
inputEl.addEventListener("input", update);
update();
