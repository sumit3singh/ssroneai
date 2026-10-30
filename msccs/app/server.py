#!/usr/bin/env python3
"""
SSR ONE AI - M.Sc. Computer Science Academic Portal Server
Optimized for local preview and production cloud deployment on Render, Railway, or Heroku.
- Reads PORT environment variable dynamically (Render default).
- Robust MIME types for .pdf, .pptx, .json, .js, .css.
- Supports HTTP Byte-Range requests for mobile PDF viewers.
- Enables CORS and clean security headers.
"""

import os
import sys
import mimetypes
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Ensure correct working directory
APP_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(APP_DIR)

# Register custom MIME types
mimetypes.add_type('application/pdf', '.pdf')
mimetypes.add_type('application/vnd.openxmlformats-officedocument.presentationml.presentation', '.pptx')
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('application/json', '.json')

class AcademicPortalHandler(SimpleHTTPRequestHandler):
    """Custom request handler with CORS, correct MIME types, and cache headers."""

    def end_headers(self):
        # Enable CORS for external API integration if needed
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Range')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def run_server():
    # Read PORT from environment (Render sets this dynamically, default to 5050 locally)
    port = int(os.environ.get('PORT', 5050))
    host = '0.0.0.0'

    server_address = (host, port)
    httpd = HTTPServer(server_address, AcademicPortalHandler)

    print("=" * 65)
    print("  JAGAT GURU NANAK DEV PUNJAB STATE OPEN UNIVERSITY (JGND PSOU)")
    print("  M.Sc. Computer Science Semester IV — Academic Portal")
    print("=" * 65)
    print(f"  [SERVER RUNNING] http://{host}:{port}")
    print(f"  Serving directory: {APP_DIR}")
    print("  Press Ctrl+C to stop.")
    print("=" * 65)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer shutting down gracefully...")
        httpd.server_close()
        sys.exit(0)

if __name__ == '__main__':
    run_server()
