"""
build_knowledge_base.py

Tujuan: mengubah dataset mentah panitia (dataset.txt / dataset.js) menjadi
"knowledge base" — daftar teks siap di-embed untuk sistem RAG TobaVerse.

Cara pakai:
    python build_knowledge_base.py

Input : dataset.txt (JSON mentah dari panitia)
Output: knowledge_base.json (list of {id, source, place_name, text, metadata})
        cleaning_report.txt (ringkasan proses cleaning untuk dokumentasi)
"""

import json
import re

INPUT_FILE = "dataset.txt"
OUTPUT_FILE = "knowledge_base.json"
REPORT_FILE = "cleaning_report.txt"

report_lines = []

def log(msg):
    print(msg)
    report_lines.append(msg)


def clean_text(val):
    """Bersihkan spasi berlebih, newline aneh, dan nilai kosong."""
    if val is None:
        return ""
    val = str(val).strip()
    val = re.sub(r"\s+", " ", val)
    return val


def dedupe_by_name(entries, name_field):
    """Hapus entri dengan nama tempat yang identik persis (case-insensitive)."""
    seen = set()
    hasil = []
    duplikat = 0
    for e in entries:
        nama = clean_text(e.get(name_field, "")).lower()
        if not nama:
            continue
        if nama in seen:
            duplikat += 1
            continue
        seen.add(nama)
        hasil.append(e)
    return hasil, duplikat


# ------------------------------------------------------------------
# 1. Baca dataset mentah
# ------------------------------------------------------------------
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

log("=== LAPORAN PEMBANGUNAN KNOWLEDGE BASE TOBAVERSE ===\n")

knowledge_base = []
kb_id = 0


# ------------------------------------------------------------------
# 2. wisata-metadata -> teks per destinasi wisata
# ------------------------------------------------------------------
entries = data.get("wisata-metadata", [])
before = len(entries)
entries, dup = dedupe_by_name(entries, "place-name")
log(f"wisata-metadata: {before} entri awal -> {len(entries)} setelah hapus {dup} duplikat nama")

for e in entries:
    nama = clean_text(e.get("place-name"))
    if not nama:
        continue
    tipe = clean_text(e.get("place-type")) or "destinasi wisata"
    tiket = clean_text(e.get("entry-fee")) or "tidak tercatat"
    jam = clean_text(e.get("operational-hour")) or "tidak tercatat"
    alamat = clean_text(e.get("address")) or "tidak tercatat"
    rating = clean_text(e.get("place-rating")) or "belum ada rating"

    text = (
        f"{nama} adalah {tipe} yang berlokasi di {alamat}. "
        f"Harga tiket masuk: {tiket}. Jam operasional: {jam}. "
        f"Rating pengunjung: {rating}."
    )
    knowledge_base.append({
        "id": f"wisata_{kb_id}",
        "source": "wisata-metadata",
        "place_name": nama,
        "text": text,
        "metadata": {"lat_long": e.get("lat-long", ""), "type": tipe}
    })
    kb_id += 1


# ------------------------------------------------------------------
# 3. hotel-metadata -> teks per akomodasi
# ------------------------------------------------------------------
entries = data.get("hotel-metadata", [])
before = len(entries)
entries, dup = dedupe_by_name(entries, "place-name")
log(f"hotel-metadata: {before} entri awal -> {len(entries)} setelah hapus {dup} duplikat nama")

for e in entries:
    nama = clean_text(e.get("place-name"))
    if not nama:
        continue
    tipe = clean_text(e.get("place-type")) or "akomodasi"
    harga = clean_text(e.get("price-per-head")) or "tidak tercatat"
    checkin = clean_text(e.get("check-in")) or "tidak tercatat"
    fasilitas = clean_text(e.get("Fasilitas")) or "tidak tercatat"
    alamat = clean_text(e.get("address")) or "tidak tercatat"
    rating = clean_text(e.get("place-rating")) or "belum ada rating"

    text = (
        f"{nama} adalah {tipe} yang berlokasi di {alamat}. "
        f"Harga per orang: {harga}. Waktu check-in: {checkin}. "
        f"Fasilitas: {fasilitas}. Rating pengunjung: {rating}."
    )
    knowledge_base.append({
        "id": f"hotel_{kb_id}",
        "source": "hotel-metadata",
        "place_name": nama,
        "text": text,
        "metadata": {"lat_long": e.get("lat-long", ""), "type": tipe}
    })
    kb_id += 1


# ------------------------------------------------------------------
# 4. resto-metadata -> teks per resto/kafe
# ------------------------------------------------------------------
entries = data.get("resto-metadata", [])
before = len(entries)
entries, dup = dedupe_by_name(entries, "place-name")
log(f"resto-metadata: {before} entri awal -> {len(entries)} setelah hapus {dup} duplikat nama")

for e in entries:
    nama = clean_text(e.get("place-name"))
    if not nama:
        continue
    tipe = clean_text(e.get("place-type")) or "tempat makan"
    harga = clean_text(e.get("price-per-head")) or "tidak tercatat"
    menu = clean_text(e.get("recommend-menu")) or "tidak tercatat"
    alamat = clean_text(e.get("address")) or "tidak tercatat"
    rating = clean_text(e.get("place-rating")) or "belum ada rating"

    text = (
        f"{nama} adalah {tipe} yang berlokasi di {alamat}. "
        f"Harga per orang: {harga}. Menu rekomendasi: {menu}. "
        f"Rating pengunjung: {rating}."
    )
    knowledge_base.append({
        "id": f"resto_{kb_id}",
        "source": "resto-metadata",
        "place_name": nama,
        "text": text,
        "metadata": {"lat_long": e.get("lat-long", ""), "type": tipe}
    })
    kb_id += 1


# ------------------------------------------------------------------
# 5. kuliner -> teks per makanan khas
# ------------------------------------------------------------------
entries = data.get("kuliner", [])
log(f"kuliner: {len(entries)} entri (tidak ada nama tempat untuk dedupe, cek manual jika perlu)")

for e in entries:
    nama = clean_text(e.get("kuliner-name"))
    deskripsi = clean_text(e.get("description"))
    if not nama:
        continue
    text = f"{nama} adalah kuliner khas Danau Toba. {deskripsi}"
    knowledge_base.append({
        "id": f"kuliner_{kb_id}",
        "source": "kuliner",
        "place_name": nama,
        "text": text,
        "metadata": {}
    })
    kb_id += 1


# ------------------------------------------------------------------
# 6. transportasi -> teks per moda transportasi
# ------------------------------------------------------------------
entries = data.get("transportasi", [])
before = len(entries)
entries, dup = dedupe_by_name(entries, "transport-name")
log(f"transportasi: {before} entri awal -> {len(entries)} setelah hapus {dup} duplikat nama")

for e in entries:
    nama = clean_text(e.get("transport-name"))
    if not nama:
        continue
    arah = clean_text(e.get("direction")) or "tidak tercatat"
    harga = clean_text(e.get("price")) or "tidak tercatat"
    jenis = clean_text(e.get("jenis-mobil")) or ""
    deskripsi = clean_text(e.get("description")) or ""
    jam = clean_text(e.get("operational-hour")) or "tidak tercatat"

    text = (
        f"{nama} adalah moda transportasi dengan rute {arah}. "
        f"Tarif: {harga}. Jenis: {jenis}. Jam operasional: {jam}. {deskripsi}"
    )
    knowledge_base.append({
        "id": f"transport_{kb_id}",
        "source": "transportasi",
        "place_name": nama,
        "text": text,
        "metadata": {}
    })
    kb_id += 1


# ------------------------------------------------------------------
# 7. Artikel Danau Toba -> teks naratif (kemungkinan perlu di-chunk lagi
#    kalau isinya panjang; cek dulu panjang teksnya)
# ------------------------------------------------------------------
entries = data.get("Artikel Danau Toba", [])
log(f"Artikel Danau Toba: {len(entries)} entri")
log(f"  -> field yang tersedia: {list(entries[0].keys()) if entries else '(kosong)'}")

for e in entries:
    # Ambil field teks terpanjang sebagai isi artikel (nama field bisa bervariasi)
    judul = None
    isi = None
    for k, v in e.items():
        if isinstance(v, str) and len(v) > 100:
            isi = v
        elif isinstance(v, str) and judul is None:
            judul = v
    if not isi:
        continue
    text = f"{judul or 'Artikel Danau Toba'}: {clean_text(isi)}"
    knowledge_base.append({
        "id": f"artikel_{kb_id}",
        "source": "Artikel Danau Toba",
        "place_name": judul or "Artikel",
        "text": text,
        "metadata": {"needs_chunking": len(isi) > 800}
    })
    kb_id += 1


# ------------------------------------------------------------------
# 8. Info Seputar Danau Toba -> SENGAJA DI-SKIP (known issue)
#
# Sheet ini adalah tabel Excel dengan header bertingkat/merged cells
# (contoh: "Akomodasi" adalah header besar yang membawahi "Hotel" dan
# "Homestay", masing-masing punya sub-kolom Alamat/Harga/Ulasan).
# Saat dikonversi ke JSON, struktur header ini rusak: 2 baris pertama
# hanya berisi label header (bukan data), dan kolom-kolom selebihnya
# diberi nama generic "Column4", "Column23", dst -- sehingga makna
# aslinya hilang dan butuh pemetaan manual (~65 kolom) untuk dipulihkan.
#
# Data sebenarnya (mulai baris ke-3, 26 baris = per kabupaten) cukup
# kaya: hotel, homestay, kuliner, transportasi, fasilitas, atraksi,
# bahkan profil wisatawan 2024 -- tapi pemetaan manual ini butuh waktu
# yang tidak sepadan untuk cakupan MVP preliminary round, mengingat
# sheet lain (Artikel Danau Toba, wisata/hotel/resto-metadata, kuliner,
# transportasi) sudah memberi cakupan yang solid untuk chatbot.
#
# Keputusan: SKIP sheet ini untuk preliminary round, dicatat sebagai
# known issue dan kandidat pengayaan data di tahap final.
# ------------------------------------------------------------------
log("Info Seputar Danau Toba: SENGAJA DI-SKIP (known issue -- header Excel "
    "bertingkat/merged cells rusak saat konversi JSON, butuh pemetaan manual "
    "~65 kolom; dicatat sebagai rencana pengayaan data tahap final, bukan "
    "dipakai di preliminary)")


# ------------------------------------------------------------------
# 9. Simpan hasil
# ------------------------------------------------------------------
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(knowledge_base, f, ensure_ascii=False, indent=2)

log(f"\n=== TOTAL KNOWLEDGE BASE: {len(knowledge_base)} entri siap di-embed ===")
log(f"Disimpan ke: {OUTPUT_FILE}")

with open(REPORT_FILE, "w", encoding="utf-8") as f:
    f.write("\n".join(report_lines))

print(f"\nSelesai. Lihat {REPORT_FILE} untuk ringkasan lengkap (bisa dipakai untuk dokumen 'Ringkasan Penggunaan Data').")