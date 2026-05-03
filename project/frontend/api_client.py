import os
from typing import Any, Dict

import requests

BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5001')


def analyze_text(text: str) -> Dict[str, Any]:
    response = requests.post(
        f'{BACKEND_URL}/api/analyze',
        json={'text': text},
        timeout=120
    )
    payload = response.json()

    if not response.ok:
        message = payload.get('message', 'Analysis request failed')
        raise RuntimeError(message)

    return payload
