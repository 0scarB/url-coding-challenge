# URL-Checker Coding Challenge

You can run the web-app by serving the repository's root directory
from a static file server. If you have python installed, you can run:
```sh
python3 -m http.server -b localhost 8080
```
then navigate to <http://localhost:8080> in your browser.

Time taken: 2h 54m


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


## Development

You can compile `index.ts` to `index.js` by running `compile-typescript.sh`.
To do this you need `tsc` on your PATH.

