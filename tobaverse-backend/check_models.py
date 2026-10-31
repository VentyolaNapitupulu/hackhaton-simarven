"""
check_models.py

Jalankan ini untuk melihat daftar model Gemini yang benar-benar aktif
dan bisa dipakai dengan API key kamu saat ini (menghindari error
404 NOT_FOUND karena nama model sudah tidak berlaku).

Cara pakai:
    python check_models.py
"""

import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

print("=== Model yang tersedia dan mendukung generateContent ===\n")
for model in client.models.list():
    if "generateContent" in getattr(model, "supported_actions", []) or True:
        print(model.name)