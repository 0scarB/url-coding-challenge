# URL-Checker Coding Challenge

View on GitHub Pages <https://0scarb.github.io/url-coding-challenge/>

Time taken: 2h 54m


## Development Setup

Run `npm install --include=dev` to install the correct version of typescript as
a npm-package developer dependency. If this fails, ensure you can run the commands
`npm` and `node` in the terminal.

If things continue to fail, you may be using the wrong version of NodeJS and
`npm`.  Read `.nvmrc` to view the project's NodeJS.  If you have `nvm` -- the
Node Version Manager <https://github.com/nvm-sh/nvm> -- on your path, I
recommend you first run `nvm install` or `nvm use` to switch to the project's
NodeJS version, before running `npm` commands. **Ensure you are using the
project's version of NodeJS and `npm` before reporting issues.**

You need to have Python installed and be able to run the `python3` in the
terminal to use the "serve" commands, described below.


## Development

Run `npm exec tsc` to compile `index.ts` to `index.js`.

Run `npm run serve` to serve the web-app locally. To open it, navigate to
<http://localhost:8080> in your browser.<br>
Run `npm run serve-background` to start the server in a background process,
allowing you to continue using the terminal.<br>
Run `npm run serve-background-stop` to terminate the background process.<br>
The output of the background process is logged to `server.log`. Run `tail -f
server.log` to follow it.<br>
(These commands use Python's `http.server' module. This requires you to have a
version Python 3 installed.)


## Implementation

`HTMLInputElement.setCustomValidity/reportValidity` are used to display errors,
using the browser's builtin input validation API; Other success and pending
messages are displayed in HTML-`span`s.

POST requests are made to the mocked API endpoint "/url-type". The URL to be
checked is supplied in the plaintext request body. The mocked endpoint
responds with the plaintext "file" or "dir" in its response body, if the
supplied URL points to a file or directory (folder). If the supplied URL
does not exist, it responds with a 404 error response.

The function `fetchMock` mocks requests to the API endpoint. URLs with the
domains "exists.com", "tuta.com", "xkcd.com" and "google.com" are treated as
existent.  Existent URLs ending in a slash "/" are treated as directories. All
other existent URLs are treated as files.

Throttling ensures that the time-delta between two requests is at least
`API_THROTTLE_INTERVAL_IN_MS` long. New requests that would have been triggered
within this interval are rescheduled to run after the interval ends with
`setTimeout`. Calls to `clearTimeout` ensure that only a single request is
rescheduled to run that the end of the interval.


