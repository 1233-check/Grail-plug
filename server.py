#!/usr/bin/env python3
"""
Grail Plug Supply — Backend Server
Serves static files + Razorpay payment API endpoints.
"""

import os
import json
import hmac
import hashlib
import mimetypes
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

import requests as http_requests  # renamed to avoid shadowing

# ── Load .env ────────────────────────────────────────────────────────────────
def load_env(path='.env'):
    """Load key=value pairs from .env file into os.environ."""
    if not os.path.exists(path):
        print(f"⚠  No {path} found — Razorpay endpoints will fail.")
        return
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            key, _, value = line.partition('=')
            os.environ.setdefault(key.strip(), value.strip())

load_env()

RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')
PORT = int(os.environ.get('PORT', 3000))

if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    print("⚠  RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set. Payment endpoints will fail.")


# ── Razorpay helpers ─────────────────────────────────────────────────────────
RAZORPAY_API = 'https://api.razorpay.com/v1'

def razorpay_create_order(amount_paise, currency='INR', receipt=None):
    """Create a Razorpay order. Returns dict on success, raises on failure."""
    payload = {
        'amount': int(amount_paise),
        'currency': currency,
        'receipt': receipt or 'grailplug_order',
    }
    resp = http_requests.post(
        f'{RAZORPAY_API}/orders',
        json=payload,
        auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
        timeout=15
    )
    resp.raise_for_status()
    return resp.json()


def razorpay_verify_signature(order_id, payment_id, signature):
    """Verify Razorpay payment signature using HMAC-SHA256."""
    message = f'{order_id}|{payment_id}'
    expected = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


# ── HTTP Handler ─────────────────────────────────────────────────────────────
class GrailHandler(SimpleHTTPRequestHandler):
    """Serves static files from current dir + handles /api/* routes."""

    def _send_json(self, status, data):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_body(self):
        length = int(self.headers.get('Content-Length', 0))
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        return json.loads(raw)

    # ── Route: POST /api/create-order ────────────────────────────────────
    def _handle_create_order(self):
        try:
            body = self._read_body()
        except (json.JSONDecodeError, ValueError):
            return self._send_json(400, {'error': 'Invalid JSON body.'})

        amount = body.get('amount')  # expected in paise
        currency = body.get('currency', 'INR')
        receipt = body.get('receipt', None)

        # Validate
        if amount is None:
            return self._send_json(400, {'error': 'Missing "amount" (in paise).'})
        try:
            amount = int(amount)
        except (TypeError, ValueError):
            return self._send_json(400, {'error': '"amount" must be a number (in paise).'})
        if amount < 100:
            return self._send_json(400, {'error': 'Minimum amount is 100 paise (₹1).'})

        try:
            order = razorpay_create_order(amount, currency, receipt)
            return self._send_json(200, {
                'order_id': order['id'],
                'amount': order['amount'],
                'currency': order['currency'],
                'key_id': RAZORPAY_KEY_ID  # safe to send to frontend
            })
        except http_requests.exceptions.HTTPError as e:
            status = e.response.status_code if e.response is not None else 500
            detail = ''
            try:
                detail = e.response.json().get('error', {}).get('description', str(e))
            except Exception:
                detail = str(e)
            code = 401 if status == 401 else 500
            return self._send_json(code, {'error': f'Razorpay error: {detail}'})
        except Exception as e:
            return self._send_json(500, {'error': f'Server error: {str(e)}'})

    # ── Route: POST /api/verify-payment ──────────────────────────────────
    def _handle_verify_payment(self):
        try:
            body = self._read_body()
        except (json.JSONDecodeError, ValueError):
            return self._send_json(400, {'error': 'Invalid JSON body.'})

        order_id = body.get('razorpay_order_id')
        payment_id = body.get('razorpay_payment_id')
        signature = body.get('razorpay_signature')

        if not all([order_id, payment_id, signature]):
            return self._send_json(400, {
                'error': 'Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature.'
            })

        if razorpay_verify_signature(order_id, payment_id, signature):
            return self._send_json(200, {
                'verified': True,
                'payment_id': payment_id,
                'order_id': order_id,
                'message': 'Payment verified successfully.'
            })
        else:
            return self._send_json(400, {
                'verified': False,
                'error': 'Payment signature verification failed. Do NOT mark as paid.'
            })

    # ── Route: GET /api/config ───────────────────────────────────────────
    def _handle_config(self):
        """Return only the public key (never the secret)."""
        return self._send_json(200, {'key_id': RAZORPAY_KEY_ID})

    # ── Routing ──────────────────────────────────────────────────────────
    def do_POST(self):
        path = urlparse(self.path).path
        if path == '/api/create-order':
            return self._handle_create_order()
        elif path == '/api/verify-payment':
            return self._handle_verify_payment()
        else:
            self._send_json(404, {'error': 'Not found.'})

    def do_GET(self):
        path = urlparse(self.path).path
        if path == '/api/config':
            return self._handle_config()
        # Everything else → serve static files
        return super().do_GET()

    # Suppress noisy logs for static assets
    def log_message(self, format, *args):
        if '/api/' in str(args[0]) if args else False:
            super().log_message(format, *args)


# ── Main ─────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    # Ensure proper MIME types
    mimetypes.add_type('application/javascript', '.js')
    mimetypes.add_type('text/css', '.css')

    server = HTTPServer(('', PORT), GrailHandler)
    print(f'\n  🔥 Grail Plug server running at http://localhost:{PORT}')
    print(f'  💳 Razorpay endpoints ready:')
    print(f'     POST /api/create-order')
    print(f'     POST /api/verify-payment')
    print(f'     GET  /api/config\n')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n  Server stopped.')
        server.server_close()
