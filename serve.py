# Runs the site on your computer: py serve.py, then open http://localhost:8000.
#
# The same as `py -m http.server`, with one change: it tells the browser not to
# keep copies of the files. Without that, Firefox sometimes keeps an old CSS or
# JS file after you've changed it, and you end up looking at half old, half new.
#
# Only for working on the site. GitHub Pages doesn't use this file.
# A different port: py serve.py 8123

import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # no-store: don't save this file at all, ask for it fresh every time.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
print(f"Serving on http://localhost:{port}  (Ctrl+C to stop)")
ThreadingHTTPServer(("", port), NoCacheHandler).serve_forever()
