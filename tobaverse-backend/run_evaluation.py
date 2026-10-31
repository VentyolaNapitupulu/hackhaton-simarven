"""
run_evaluation.py

Menjalankan semua pertanyaan di pertanyaan_uji.json ke backend TobaVerse
(http://localhost:5000/api/chat), lalu menyimpan hasilnya ke
evaluation_results.csv untuk dinilai manual (benar/salah/kurang tepat).

Syarat: app.py (backend) HARUS sudah jalan di terminal lain sebelum
menjalankan skrip ini.

Cara pakai:
    python run_evaluation.py
"""

import json
import csv
import time
import datetime
import requests

BACKEND_URL = "http://localhost:5000/api/chat"
INPUT_FILE = "pertanyaan_uji.json"
timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
OUTPUT_FILE = f"evaluation_results_{timestamp}.csv"

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    pertanyaan_list = json.load(f)

hasil_semua = []

print(f"Menjalankan {len(pertanyaan_list)} pertanyaan uji...\n")

for item in pertanyaan_list:
    print(f"[{item['id']}] {item['pertanyaan']}")

    jawaban, sumber, error = "", "", ""
    percobaan_maksimal = 3

    for percobaan in range(1, percobaan_maksimal + 1):
        try:
            response = requests.post(
                BACKEND_URL,
                json={"message": item["pertanyaan"]},
                timeout=30
            )
            data = response.json()

            if data.get("error") and "429" in str(data.get("error")):
                print(f"    -> Kena rate limit, tunggu 20 detik lalu coba lagi ({percobaan}/{percobaan_maksimal})...")
                time.sleep(20)
                continue

            jawaban = data.get("jawaban", "")
            sumber = ", ".join(data.get("sumber", []))
            error = data.get("error", "")
            break
        except Exception as e:
            error = str(e)
            break

    print(f"    -> Jawaban: {jawaban[:100]}...")
    print(f"    -> Sumber : {sumber}")
    if error:
        print(f"    -> ERROR   : {error}")
    print()

    hasil_semua.append({
        "id": item["id"],
        "kategori": item["kategori"],
        "pertanyaan": item["pertanyaan"],
        "jawaban": jawaban,
        "sumber": sumber,
        "error": error,
        "penilaian_manual": ""  # kolom kosong -- diisi kamu setelah baca hasilnya
    })

    time.sleep(13)  # jeda 13 detik antar pertanyaan -- sesuai batas 5 request/menit free tier

# Simpan ke CSV supaya gampang dibuka di Excel/Google Sheets
with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=[
        "id", "kategori", "pertanyaan", "jawaban", "sumber", "error", "penilaian_manual"
    ])
    writer.writeheader()
    writer.writerows(hasil_semua)

print(f"\nSelesai! Hasil disimpan ke {OUTPUT_FILE}")
print("Buka file itu di Excel, lalu isi kolom 'penilaian_manual' dengan:")
print("  - 'benar' kalau jawaban akurat dan relevan")
print("  - 'salah' kalau jawaban salah/mengarang/nyampur kategori")
print("  - 'kurang tepat' kalau sebagian benar tapi ada yang meleset")