"""
app.py

Backend Flask sederhana untuk TobaVerse RAG Assistant.

Alur kerja tiap request:
    1. Frontend (chatbot.js) kirim pertanyaan user ke endpoint /api/chat
    2. Backend cari 5-7 potongan info paling relevan dari ChromaDB (retrieval)
    3. Potongan itu + pertanyaan dikirim ke Groq API sebagai context
    4. Groq (Llama 3.3) menyusun jawaban natural berdasarkan context tsb
    5. Jawaban dikirim balik ke frontend

Cara pakai:
    1. Pastikan sudah menjalankan build_vector_db.py duluan (folder
       chroma_db harus sudah ada)
    2. Buat file .env berisi: GROQ_API_KEY=gsk_xxxxxxxx
       (dapatkan gratis di console.groq.com -> API Keys)
    3. Jalankan: python app.py
    4. Server jalan di http://localhost:5000
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import chromadb
from chromadb.utils import embedding_functions
from groq import Groq
from dotenv import load_dotenv

load_dotenv()  # baca API key dari file .env

app = Flask(__name__)
CORS(app)  # supaya frontend (file HTML statis) boleh akses backend ini

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chroma_db")
COLLECTION_NAME = "tobaverse_knowledge"

# ------------------------------------------------------------------
# Setup koneksi ke vector database (dibuat sekali saat server start)
# ------------------------------------------------------------------
embedding_fn = embedding_functions.DefaultEmbeddingFunction()
chroma_client = chromadb.PersistentClient(path=DB_PATH)
collection = chroma_client.get_collection(
    name=COLLECTION_NAME,
    embedding_function=embedding_fn
)
collection.query(query_texts=["danau toba"], n_results=1)  # pemanasan model embedding

# ------------------------------------------------------------------
# Setup Groq API client
# ------------------------------------------------------------------
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
GROQ_MODEL = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")  # model dibaca dari .env

SYSTEM_PROMPT = """Kamu adalah TobaVerse, asisten wisata ramah untuk kawasan Danau Toba.
Jawab HANYA berdasarkan informasi yang diberikan di dalam <context> di bawah. Jika
informasi tidak ada di context, katakan dengan jujur bahwa kamu belum punya info soal
itu -- jangan mengarang jawaban.

Jawab dengan ramah, singkat, dan sertakan alasan mengapa tempat tersebut kamu
rekomendasikan (misal: sesuai budget, dekat lokasi, cocok untuk suasana yang diminta).
JANGAN membuka jawaban dengan sapaan panjang berulang-ulang -- langsung ke inti jawaban
setelah sapaan singkat (maksimal 1 kalimat pembuka).

ATURAN BAHASA:
- Deteksi bahasa yang digunakan user secara otomatis dari pesannya.
- Jika user menulis dalam Bahasa Indonesia, jawab dalam Bahasa Indonesia.
- Jika user menulis dalam Bahasa Inggris, jawab dalam Bahasa Inggris.
- Jika campuran, ikuti bahasa yang paling dominan.
- Nama tempat, istilah budaya Batak (ulos, gondang, marga, dll), dan nama destinasi
  TETAP memakai nama aslinya, tidak diterjemahkan, apapun bahasa jawabanmu.

Sentuhan lokal Batak (gunakan secukupnya, jangan berlebihan):
- Kamu boleh membuka percakapan atau sapaan dengan "Horas!" -- sapaan khas Batak yang
  hangat dan ramah, cocok untuk identitas TobaVerse.
- Kalau context yang diberikan memang menyebut istilah atau nilai budaya Batak (misalnya
  ulos, gondang, marga, rumah adat, semangat gotong royong), sampaikan istilah aslinya
  secara natural -- JANGAN menerjemahkan atau menggeneralisasinya.
- JANGAN mengarang klaim atau fakta budaya Batak yang tidak ada di context, meski
  terdengar masuk akal secara umum -- lebih baik tidak menyebutnya sama sekali daripada
  salah.
- Jangan memaksakan istilah Batak di setiap jawaban (misal untuk pertanyaan harga tiket
  atau jam operasional yang murni teknis) -- cukup muncul natural saat konteksnya memang
  soal budaya."""

TRANSFORM_SYSTEM_PROMPT = """Kamu adalah penerjemah dan editor bahasa untuk jawaban wisata.
Tugasmu mengubah bahasa jawaban sebelumnya tanpa mengubah fakta penting.
Jaga nama tempat, harga, angka, rating, rekomendasi, dan alasan tetap sama.
Hanya ubah bahasa atau susunan kata sesuai permintaan user."""


def deteksi_sapaan(pesan_user: str) -> bool:
    """Cek apakah pesan cuma sapaan/basa-basi, bukan pertanyaan data.
    Kalau iya, jawab langsung tanpa proses RAG (lebih cepat & tidak
    ambil context yang tidak relevan)."""
    sapaan_list = ["halo", "hai", "hi", "hello", "kamu siapa", "siapa kamu",
                   "selamat pagi", "selamat siang", "selamat malam", "horas"]
    pesan_lower = pesan_user.lower().strip()
    return any(pesan_lower == s or pesan_lower.startswith(s + " ") or pesan_lower.startswith(s + "!")
               for s in sapaan_list)


# ------------------------------------------------------------------
# Deteksi kategori sederhana dari pertanyaan user, supaya retrieval
# tidak mencampur kategori (misal: tanya "wisata" tapi malah dapat
# "warung makan" karena sama-sama menyebut kata "murah"/nama kota).
#
# Ini pendekatan rule-based ringan -- cukup untuk MVP. Kalau pertanyaan
# tidak cocok kata kunci manapun, tidak difilter (cari di semua sheet).
# ------------------------------------------------------------------
KATEGORI_KEYWORDS = {
    "wisata-metadata": ["wisata", "destinasi", "objek wisata", "pantai",
                        "air terjun", "bukit", "healing", "foto", "geosite"],
    "hotel-metadata": ["hotel", "penginapan", "nginap", "menginap", "homestay",
                       "villa", "resort", "kamar"],
    "resto-metadata,kuliner": ["makan", "resto", "restoran", "warung", "kafe",
                               "cafe", "kuliner", "kuliner khas"],
    "transportasi": ["transportasi", "kapal", "pesawat", "angkot", "penyeberangan",
                     "menyeberang", "nyebrang", "bandara", "pelabuhan"],
    "Artikel Danau Toba": ["budaya", "tradisi", "sejarah", "adat", "cerita",
                          "kisah", "asal usul", "legenda", "batak"],
}


def deteksi_kategori(pesan_user: str):
    pesan_lower = pesan_user.lower()
    kategori_cocok = []
    for source_group, keywords in KATEGORI_KEYWORDS.items():
        if any(kw in pesan_lower for kw in keywords):
            kategori_cocok.extend(source_group.split(","))
    return kategori_cocok if kategori_cocok else None


def deteksi_bahasa(pesan_user: str, history=None) -> str:
    """Deteksi bahasa dominan dari pesan user saat ini dan percakapan terakhir."""
    texts = [pesan_user]
    if history:
        for turn in reversed(history[-4:]):
            if turn.get("role") == "user":
                content = turn.get("content", "").strip()
                if content:
                    texts.append(content)

    english_words = {
        "i", "me", "my", "myself", "want", "would", "like", "from", "to", "the",
        "and", "for", "please", "recommend", "recommendation", "visit", "lake",
        "toba", "hotel", "restaurant", "budget", "trip", "travel", "destination",
        "place", "stay", "with", "hello", "hi", "thanks", "thank", "you", "your",
        "is", "are", "can", "could", "need", "go", "around", "near", "best", "quiet",
        "healing", "day", "weekend", "family", "solo", "couple", "friend", "friends"
    }
    indonesian_words = {
        "saya", "aku", "ingin", "mau", "ke", "di", "dari", "dan", "atau", "yang",
        "untuk", "tolong", "rekomendasi", "wisata", "liburan", "danau", "toba",
        "hotel", "restoran", "budget", "tempat", "pantai", "healing", "jalan",
        "hari", "pulang", "kamu", "kami", "mereka", "baik", "terbaik", "dekat",
        "sebelum", "setelah", "cocok", "suka"
    }

    english_score = 0
    indonesian_score = 0

    for text in texts:
        lower_text = text.lower().strip()
        if not lower_text:
            continue
        words = set(lower_text.replace("?", " ").replace("!", " ").replace(",", " ").split())
        english_score += sum(1 for word in words if word in english_words)
        indonesian_score += sum(1 for word in words if word in indonesian_words)

    if english_score > indonesian_score:
        return "en"
    if indonesian_score > english_score:
        return "id"
    return "id" if any(ch in pesan_user.lower() for ch in "aiueo") else "en"


def is_transform_request(message: str) -> bool:
    """Cek apakah pesan user hanya meminta transformasi bahasa/penulisan."""
    pesan_lower = message.lower().strip()
    if not pesan_lower:
        return False

    transform_patterns = [
        "in english",
        "english please",
        "translate",
        "translate this",
        "translate to english",
        "dalam bahasa indonesia",
        "bahasa indonesia",
        "bahasa inggris",
        "ubah ke bahasa inggris",
        "explain in english",
        "explain in indonesian",
        "in indonesian",
        "in bahasa indonesia",
        "rephrase",
        "rewrite",
        "simplify",
        "explain again",
        "terjemahkan",
        "terjemahin",
        "ubah ke bahasa",
    ]
    return any(pattern in pesan_lower for pattern in transform_patterns)


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "").strip()
    history = data.get("history", [])  # daftar {"role": "user"/"assistant", "content": "..."}

    if not user_message:
        return jsonify({"error": "Pesan tidak boleh kosong"}), 400

    # 0. Kalau cuma sapaan/basa-basi, jawab langsung tanpa RAG
    if deteksi_sapaan(user_message):
        return jsonify({
            "jawaban": "Horas! Selamat datang di TobaVerse. Aku siap bantu kamu "
                       "menemukan destinasi wisata, kuliner, penginapan, atau "
                       "transportasi di sekitar Danau Toba. Mau tanya apa dulu?",
            "sumber": []
        })

    if is_transform_request(user_message):
        last_assistant_reply = ""
        for turn in reversed(history):
            if turn.get("role") == "assistant":
                last_assistant_reply = turn.get("content", "").strip()
                break

        if not last_assistant_reply:
            return jsonify({
                "jawaban": "Saya belum punya jawaban sebelumnya untuk diterjemahkan. Silakan tanyakan rekomendasinya dulu.",
                "sumber": []
            })

        if any(term in user_message.lower() for term in ["english", "bahasa inggris", "translate to english", "in english", "explain in english"]):
            instruction = (
                "Translate the following response to English. Preserve all place names, prices, numbers, ratings, recommendations, and reasoning exactly. Do not add new facts or change the meaning."
            )
        else:
            instruction = (
                "Terjemahkan teks berikut ke Bahasa Indonesia. Jaga nama tempat, harga, angka, rating, rekomendasi, dan alasan tetap sama; ubah hanya bahasanya."
            )

        try:
            response = groq_client.chat.completions.create(
                model=GROQ_MODEL,
                max_tokens=700,
                temperature=0.2,
                messages=[
                    {"role": "system", "content": TRANSFORM_SYSTEM_PROMPT},
                    {"role": "user", "content": f"{instruction}\n\nTeks:\n{last_assistant_reply}"}
                ]
            )
            transformed_reply = response.choices[0].message.content.strip()
        except Exception as e:
            return jsonify({"error": f"Gagal memproses permintaan transformasi bahasa: {str(e)}"}), 500

        return jsonify({"jawaban": transformed_reply, "sumber": []})

    bahasa_dominan = deteksi_bahasa(user_message, history)
    if bahasa_dominan == "en":
        bahasa_instruction = "Respond entirely in English. Do not switch languages."
    else:
        bahasa_instruction = "Jawab seluruhnya dalam Bahasa Indonesia. Jangan beralih bahasa."

    # 1. RETRIEVAL: gabungkan pesan user terakhir (kalau ada) dengan pesan
    #    sekarang, supaya pertanyaan lanjutan ("kenapa harus itu?") tetap
    #    bisa dicari dengan konteks yang relevan, bukan dicari sendirian.
    pesan_user_sebelumnya = ""
    for turn in reversed(history):
        if turn.get("role") == "user":
            pesan_user_sebelumnya = turn.get("content", "")
            break

    query_untuk_retrieval = (
        f"{pesan_user_sebelumnya} {user_message}".strip()
        if pesan_user_sebelumnya else user_message
    )

    kategori_filter = deteksi_kategori(user_message) or deteksi_kategori(query_untuk_retrieval)
    query_kwargs = {"query_texts": [query_untuk_retrieval], "n_results": 7}
    if kategori_filter:
        query_kwargs["where"] = {"source": {"$in": kategori_filter}}

    hasil_pencarian = collection.query(**query_kwargs)
    potongan_relevan = hasil_pencarian["documents"][0]
    sumber = hasil_pencarian["metadatas"][0]

    # 2. Susun context dari hasil retrieval
    context_text = "\n\n".join(
        f"[{s['place_name']}] {doc}"
        for doc, s in zip(potongan_relevan, sumber)
    )

    # 3. GENERATION: kirim ke Groq API dengan context + riwayat percakapan
    #    Riwayat dibatasi 6 giliran terakhir supaya tidak boros token.
    messages_groq = [{"role": "system", "content": SYSTEM_PROMPT}]
    for turn in history[-2:]:
        role = "assistant" if turn.get("role") == "assistant" else "user"
        messages_groq.append({"role": role, "content": turn.get("content", "")})
    messages_groq.append({
        "role": "user",
        "content": f"<context>\n{context_text}\n</context>\n\nBahasa jawaban: {bahasa_instruction}\n\nPertanyaan: {user_message}"
    })

    try:
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            max_tokens=1024,
            temperature=0.3,
            messages=messages_groq
        )
        jawaban = response.choices[0].message.content
    except Exception as e:
        return jsonify({"error": f"Gagal memanggil LLM: {str(e)}"}), 500

    # 4. Kembalikan jawaban + sumber (transparansi -- bagus untuk etika/Responsible AI)
    return jsonify({
        "jawaban": jawaban,
        "sumber": [s["place_name"] for s in sumber]
    })


## ============================================================
# TOBAVERSE AI TRIP -- generate itinerary terstruktur dari
# preferensi wizard (durasi, budget, minat, dll)
# ============================================================

TRIP_SYSTEM_PROMPT = """
Kamu adalah TobaVerse AI Trip Planner. Tugasmu menyusun
itinerary perjalanan ke Danau Toba berdasarkan preferensi user, HANYA memakai
tempat/destinasi/resto/hotel/transportasi yang disebutkan di dalam <data>.
JANGAN mengarang nama tempat yang tidak ada di <data>.

Kalau data yang tersedia tidak cukup untuk mengisi semua hari yang diminta,
JUJUR -- kurangi jumlah destinasi per hari atau gabungkan aktivitas, jangan
mengarang tempat baru.

ATURAN BAHASA:
- Deteksi bahasa yang digunakan oleh user secara otomatis.
- Jika user menggunakan Bahasa Indonesia, jawab seluruh itinerary dalam Bahasa Indonesia.
- Jika user menggunakan Bahasa Inggris, jawab seluruh itinerary dalam Bahasa Inggris.
- Jika user mencampur kedua bahasa, gunakan bahasa yang paling dominan secara alami.
- Pertahankan bahasa yang sama secara konsisten pada seluruh output.

ATURAN NAMA TEMPAT:
- Nama tempat, hotel, restoran, transportasi, dan destinasi HARUS tetap menggunakan nama asli yang ada di dalam <data>.
- Jangan menerjemahkan nama tempat ke bahasa lain.
- Hanya ringkasan, alasan, estimasi biaya, tema perjalanan, dan tips budaya yang mengikuti bahasa user.

WAJIB jawab HANYA dalam format JSON valid, tanpa teks lain di luar JSON, dengan struktur persis seperti ini:

{
  "ringkasan": "1-2 kalimat ringkasan perjalanan",
  "estimasi_biaya_total": "contoh: Rp 800.000 - 1.200.000 per orang",
  "hari": [
    {
      "hari_ke": 1,
      "tema": "contoh: Eksplorasi Alam Balige",
      "aktivitas": [
        {
          "waktu": "contoh: 08.00",
          "nama_tempat": "harus persis sama dengan nama di <data>",
          "kategori": "wisata/kuliner/hotel/transportasi",
          "alasan": "kenapa AI merekomendasikan ini sesuai preferensi user",
          "estimasi_biaya": "contoh: Rp 20.000"
        }
      ]
    }
  ],
  "tips_budaya": [
    "1-3 tips budaya Batak yang relevan, HANYA jika ada di <data>"
  ]
}
"""

def bangun_context_trip(minat_list, budget, durasi):
    """Ambil data relevan dari tiap kategori untuk bahan itinerary."""
    minat_query = " ".join(minat_list) if minat_list else "wisata populer"
    bagian = {}

    hasil_wisata = collection.query(
        query_texts=[f"wisata {minat_query}"],
        n_results=min(6 + durasi * 2, 15),
        where={"source": "wisata-metadata"}
    )
    bagian["wisata"] = hasil_wisata["documents"][0]

    hasil_kuliner = collection.query(
        query_texts=[f"kuliner {minat_query}"],
        n_results=6,
        where={"source": {"$in": ["resto-metadata", "kuliner"]}}
    )
    bagian["kuliner"] = hasil_kuliner["documents"][0]

    hasil_hotel = collection.query(
        query_texts=[f"penginapan budget {budget}"],
        n_results=3,
        where={"source": "hotel-metadata"}
    )
    bagian["hotel"] = hasil_hotel["documents"][0]

    hasil_transport = collection.query(
        query_texts=["transportasi menuju Danau Toba"],
        n_results=3,
        where={"source": "transportasi"}
    )
    bagian["transportasi"] = hasil_transport["documents"][0]

    hasil_budaya = collection.query(
        query_texts=["budaya Batak sejarah tradisi"],
        n_results=2,
        where={"source": "Artikel Danau Toba"}
    )
    bagian["budaya"] = hasil_budaya["documents"][0]

    context_parts = []
    for kategori, docs in bagian.items():
        if docs:
            context_parts.append(f"--- {kategori.upper()} ---\n" + "\n".join(docs))
    return "\n\n".join(context_parts)


TRIP_CHAT_SYSTEM_PROMPT = """Kamu adalah TobaVerse AI Trip Consultant -- pemandu wisata
lokal yang ramah dan berpengalaman soal Danau Toba. Tugasmu mengobrol santai dengan
wisatawan untuk memahami rencana perjalanan mereka, BUKAN menginterogasi seperti formulir.

Kamu perlu mengumpulkan 5 informasi berikut lewat percakapan natural:
1. durasi -- jumlah hari (angka, contoh: 1, 2, 3, 4)
2. kota_asal -- kota keberangkatan (teks bebas)
3. companion -- teman perjalanan (Solo / Pasangan / Keluarga / Teman, atau deskripsi bebas)
4. budget -- perkiraan budget per orang (teks bebas, contoh: "500 ribu", "sekitar 1 juta")
5. minat -- daftar minat wisata (array teks, contoh: ["Alam", "Kuliner"])

ATURAN PENTING:
- Baca pesan user dengan cermat. Kalau user sudah menyebut beberapa info sekaligus dalam
  satu kalimat (misal "Aku dari Balige, budget 300 ribu, sehari, suka kuliner"), EKSTRAK
  SEMUANYA sekaligus -- JANGAN tanya ulang info yang sudah disebutkan.
- HANYA tanyakan informasi yang BELUM diketahui dari "slot_diketahui" yang diberikan.
- Gabungkan slot_diketahui dengan info baru dari pesan user -- jangan menghapus info yang
  sudah ada kecuali user secara eksplisit mengubahnya.
- Bicara seperti pemandu lokal: beri komentar, saran singkat, atau alasan ("liburan sehari
  dari Balige dengan budget segitu sangat memungkinkan, kita bisa fokus area sekitar saja
  biar hemat transport") -- bukan sekadar "Baik, dicatat."
- Kalau ada preferensi yang terlihat kurang cocok (misal budget sangat kecil tapi minat
  petualangan jauh), beri tahu dengan jujur dan sarankan penyesuaian, jangan langsung setuju.
- JANGAN mengarang fakta soal tempat/harga -- kamu baru boleh membahas destinasi spesifik
  nanti setelah itinerary dibuat, bukan di tahap obrolan ini.
- Sesuaikan bahasa balasanmu dengan bahasa yang dipakai user (Indonesia atau English),
  otomatis, tanpa diminta.

Setelah SEMUA 5 slot terisi, di pesanmu buat ringkasan singkat dan tanya konfirmasi
("Apakah ringkasan ini sudah sesuai?") -- JANGAN langsung asumsikan siap tanpa konfirmasi.

WAJIB balas HANYA dalam format JSON valid, struktur persis:
{
  "balasan": "teks balasan natural untuk ditampilkan ke user",
  "slots": {
    "durasi": angka atau null,
    "kota_asal": "teks" atau null,
    "companion": "teks" atau null,
    "budget": "teks" atau null,
    "minat": ["array", "teks"]
  },
  "siap_generate": true jika kelima slot sudah terisi DAN user sudah konfirmasi ringkasan, false jika belum,
  "saran_balasan": ["1-3 saran singkat balasan yang mungkin dipilih user, opsional, boleh array kosong"]
}"""


@app.route("/api/trip-chat", methods=["POST"])
def trip_chat():
    data = request.get_json()
    user_message = data.get("message", "").strip()
    known_slots = data.get("known_slots", {})
    history = data.get("history", [])

    if not user_message:
        return jsonify({"error": "Pesan tidak boleh kosong"}), 400

    messages_groq = [{"role": "system", "content": TRIP_CHAT_SYSTEM_PROMPT}]
    for turn in history[-8:]:
        role = "assistant" if turn.get("role") == "assistant" else "user"
        messages_groq.append({"role": role, "content": turn.get("content", "")})

    messages_groq.append({
        "role": "user",
        "content": f"slot_diketahui saat ini: {json.dumps(known_slots, ensure_ascii=False)}\n\n"
                   f"Pesan user: {user_message}"
    })

    try:
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            max_tokens=700,
            temperature=0.5,
            response_format={"type": "json_object"},
            messages=messages_groq
        )
        result = json.loads(response.choices[0].message.content)
    except Exception as e:
        return jsonify({"error": f"Gagal memproses percakapan: {str(e)}"}), 500

    return jsonify(result)


@app.route("/api/trip-plan", methods=["POST"])
def trip_plan():
    data = request.get_json()
    durasi = int(data.get("durasi", 1))
    kota_asal = data.get("kota_asal", "")
    budget = data.get("budget", "")
    companion = data.get("companion", "")
    minat = data.get("minat", [])
    preferensi_tambahan = data.get("preferensi_tambahan", "")

    context_text = bangun_context_trip(minat, budget, durasi)

    prompt_user = f"""<data>
{context_text}
</data>

Preferensi perjalanan:
- Durasi: {durasi} hari
- Kota asal: {kota_asal}
- Budget: {budget}
- Travel companion: {companion}
- Minat wisata: {", ".join(minat)}
- Preferensi tambahan: {preferensi_tambahan}

Susun itinerary sesuai format JSON yang diminta."""

    try:
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            max_tokens=2048,
            temperature=0.4,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": TRIP_SYSTEM_PROMPT},
                {"role": "user", "content": prompt_user}
            ]
        )
        raw = response.choices[0].message.content
        itinerary = json.loads(raw)
    except Exception as e:
        return jsonify({"error": f"Gagal membuat itinerary: {str(e)}"}), 500

    return jsonify(itinerary)


@app.route("/api/health", methods=["GET"])
def health():
    """Endpoint sederhana untuk cek apakah server jalan."""
    return jsonify({"status": "ok", "total_data": collection.count()})


if __name__ == "__main__":
    print(f"Vector DB siap, total entri: {collection.count()}")
    print("Server jalan di http://localhost:5000")
    app.run(debug=True, port=5000)