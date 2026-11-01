# TobaVerse AI 

## 1. Deskripsi Singkat

Wisatawan yang baru pertama kali berkunjung ke Danau Toba kesulitan mendapatkan jawaban atas pertanyaan personal (mis. destinasi sesuai budget/suasana tertentu), karena sistem pencarian yang ada hanya mencocokkan kata kunci literal. **TobaVerse AI** menjawab masalah ini lewat dua fitur: **Ompung Bot**, asisten percakapan yang menjawab pertanyaan bebas berbahasa natural dengan rekomendasi disertai alasan, dan **AI Trip Planner**, yang menyusun itinerary perjalanan lengkap dari obrolan santai (bukan formulir kaku). Kedua fitur dibangun dengan pendekatan **Retrieval-Augmented Generation (RAG)** — pencarian vektor (ChromaDB + sentence-transformers) yang digrounding ke dataset resmi pariwisata Danau Toba, dikombinasikan dengan **LLM (Llama 3.3 via Groq API)** untuk menyusun jawaban natural tanpa mengarang informasi.

## 2. Anggota Tim

| Nama | Peran | Kontak |
| --- | --- | --- |
| Ventyola Rohati Napitupulu | AI Engineer & Project Lead | +62 831-3192-2932 |
| Silvia Eklesiana Sitorus | Frontend Developer & UI/UX Designer | +62 852-1690-0383 |
| Margareth Bungaran Sitompul | Backend Developer | +62 813-9914-7785 |

### 3. Pemanfaatan Data Pariwisata Toba

**Data Utama:**  
Dataset dikompilasi dari **Pusat Data Institut Teknologi Del** melalui skema permohonan data penelitian dosen. Dari total 14 *sheet* data yang diperoleh, kami mengeliminasi redundansi dan memilih 6 *sheet* paling relevan sebagai basis pengetahuan (*knowledge base*), yang diproses menjadi 348 entri terstruktur:

| Sumber Data / Sheet | Entri Digunakan | Fungsi |
| :--- | :---: | :--- |
| `wisata-metadata` | 138 | Data destinasi wisata (harga, jam operational, alamat, rating) |
| `hotel-metadata` | 36 | Data akomodasi & penginapan |
| `resto-metadata` | 147 | Data tempat makan & kuliner |
| `kuliner` | 12 | Data kuliner khas Batak |
| `transportasi` | 9 | Data moda & rute transportasi |
| `Artikel Danau Toba` | 6 | Konten naratif sejarah & budaya |

**Pengolahan Data:**

* **Deduplikasi Otomatis:** Melakukan pembersihan berbasis nama tempat (contoh: pada data `transportasi` dari 16 menjadi 9 entri setelah menghapus 7 duplikat nyata, seperti *"KMP Kaldera Toba"* yang tercatat berulang kali).
* **Strukturisasi Teks:** Masing-masing entri dikonversi menjadi teks naratif siap-*embed*, dilengkapi metadata kategori untuk optimalisasi pencarian (*retrieval filtering*).
* **Pembersihan Sheet Terpisah:**
  * Sheet `Info Seputar Danau Toba` **sengaja tidak digunakan**: struktur data mengalami kendala *merged-header* Excel saat konversi ke JSON (membutuhkan pemetaan ulang ~65 kolom, kurang efisien untuk skala *preliminary*).
  * Sheet `resto-hotel-v2` dan `wisata-v2` (total 22.302 baris ulasan individual) **sengaja tidak digunakan pada tahap ini**: 41–55% entri tidak memiliki ulasan bermakna dan skalanya terlalu granular untuk *Knowledge Base RAG MVP* — dicadangkan untuk pengkayaan fitur analisis sentimen di *roadmap* lanjutan.

## 4. Tautan & Aset Pendukung
- **Link Video Demonstrasi (Wajib):** https://youtu.be/PAW3vYfXZxw?si=a79y7N-J13uYComd
- **Link Pitch Deck / Proposal (Wajib):** https://drive.google.com/file/d/1jGoG3wC3y7PosxCbXpGdjp2BaOARuwQ7/view?usp=sharing
## 5. Struktur Repository

```text
.
├── README.md
├── LICENSE
│
├── tobaverse-frontend/
│   ├── assets/                    # Gambar, ikon, audio, dan aset frontend
│   ├── css/
│   │   ├── chatbot.css
│   │   ├── culinary.css
│   │   ├── culture.css
│   │   ├── events.css
│   │   ├── explore.css
│   │   ├── home.css
│   │   ├── journey.css
│   │   ├── map.css
│   │   ├── style.css
│   │   └── trip.css
│   │
│   ├── js/
│   │   ├── chatbot.js
│   │   ├── culinary.js
│   │   ├── culture.js
│   │   ├── events.js
│   │   ├── explore.js
│   │   ├── journey.js
│   │   ├── map.js
│   │   ├── music.js
│   │   └── trip.js
│   │
│   ├── index.html
│   ├── explore.html
│   ├── culture.html
│   ├── culinary.html
│   ├── journey.html
│   ├── events.html
│   ├── map.html
│   └── trip.html
│
└── tobaverse-backend/
    ├── app.py                      # API Flask (Ompung Bot & AI Trip Planner)
    ├── build_knowledge_base.py     # Mengolah dataset menjadi knowledge_base.json
    ├── build_vector_db.py          # Membuat embedding & ChromaDB
    ├── check_models.py             # Pengecekan model/dependensi
    ├── knowledge_base.json         # Knowledge base hasil preprocessing (348 entri)
    ├── pertanyaan_uji.json         # Dataset pertanyaan evaluasi
    ├── run_evaluation.py           # Pengujian fungsional otomatis
    ├── cleaning_report.txt         # Ringkasan proses data cleaning
    ├── requirements.txt
    ├── .env.example
    └── chroma_db/                  # Vector database (dibuat otomatis)
```

## 6. Prasyarat (Requirements)

- **Environment:** Python 3.10 atau lebih baru
- **Package manager:** pip
- **Software tambahan:** Tidak ada (ChromaDB berjalan sebagai file lokal, tidak butuh server database terpisah; tidak butuh Docker)
- **API Key Eksternal:** **Groq API** (untuk LLM Llama 3.3) — gratis, daftar di [console.groq.com](https://console.groq.com) → API Keys. **JANGAN commit API key asli ke repository.**

## 7. Environment Variables

Di dalam folder `tobaverse-backend/` telah disediakan file `.env.example` sebagai template konfigurasi.

Buat file baru bernama `.env` dengan menyalin isi dari `.env.example`, kemudian isi API key Groq Anda.

Contoh isi file `.env`:

```env
GROQ_API_KEY=isi_dengan_api_key_groq_anda
```

## 8. Langkah Instalasi & Menjalankan Project Secara Lokal

```bash
# 1. Clone repository
git clone [https://github.com/VentyolaNapitupulu/hackhaton-simarven.git](https://github.com/VentyolaNapitupulu/hackhaton-simarven.git)
cd hackhaton-simarven/tobaverse-backend

# 2. Buat virtual environment
python -m venv venv

# 3. Aktifkan virtual environment
# Mac/Linux
source venv/bin/activate
# Windows (Command Prompt)
venv\Scripts\activate
# Windows (PowerShell)
venv\Scripts\Activate.ps1
# Jika PowerShell menampilkan error "running scripts is disabled"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install -r requirements.txt

# 4. Salin file environment variable, isi dengan API key Groq
cp .env.example .env
# (Buka .env, isi GROQ_API_KEY dengan key dari console.groq.com)

# 5. Bangun vector database dari knowledge_base.json (WAJIB, sekali saja)
python build_vector_db.py
# Proses ini mengunduh model embedding kecil (~80MB) pada eksekusi pertama,
# lalu membuat folder chroma_db/ berisi vector database siap pakai.

# 6. Jalankan backend
python app.py
# Backend berjalan di: http://localhost:5000
# Cek health endpoint: http://localhost:5000/api/health

# 7. Jalankan frontend
# Buka file frontend/index.html langsung di browser (double-click,
# atau klik kanan -> Open with Live Server jika pakai ekstensi VS Code).
# Backend HARUS tetap berjalan (langkah 6) selama frontend digunakan.
```

## 9. Cara Menggunakan / Testing (Evaluasi Model)

**Ompung Bot (chatbot):**
Klik tombol chat bulat (pojok kanan bawah) di halaman manapun. Contoh input untuk mencoba:
- `"Rekomendasi tempat wisata alam di Balige"`
- `"Wisata budaya Batak apa yang bisa dikunjungi?"`
- `"Penginapan murah dekat Danau Toba"`
- Coba juga dalam Bahasa Inggris, mis. `"best culinary spots near Balige"` — AI merespons otomatis sesuai bahasa yang digunakan.

**AI Trip Planner:**
Buka `frontend/trip.html`. Ketik preferensi secara bebas, boleh sekaligus dalam satu kalimat, contoh:
`"Aku dari Medan, budget 500 ribu, 2 hari, suka alam dan kuliner"`
AI akan mengekstrak informasi secara otomatis, menanyakan yang masih kurang, lalu meminta konfirmasi ringkasan sebelum menghasilkan itinerary lengkap per hari.

**Menjalankan ulang pengujian fungsional (opsional):**
```bash
python run_evaluation.py
```
Membutuhkan `app.py` sudah berjalan di terminal terpisah. Hasil tersimpan sebagai `evaluation_results_<timestamp>.csv`, berisi 20 pertanyaan uji beserta jawaban AI dan sumber data yang dipakai.

## 10. Known Issues / Batasan

- Backend saat ini berjalan lokal (belum di-deploy ke cloud) — demo dijalankan dari laptop pengembang.
- **AI Trip Planner** dibangun lebih baru dan belum melalui pengujian iteratif seketat **Ompung Bot** (yang telah melalui 3+ ronde evaluasi dengan perbaikan terdokumentasi).
- Model embedding yang digunakan (`all-MiniLM-L6-v2`) berukuran kecil dan punya keterbatasan disambiguasi kategori pada kasus tertentu; sebagian besar sudah dimitigasi dengan filter berbasis metadata kategori, namun beberapa query ambigu masih berpotensi mengambil hasil retrieval yang kurang presisi.
- Cakupan dataset terbatas pada 6 dari 14 sheet (348 entri) — lihat bagian 3 untuk alasan eksplisit sheet yang tidak digunakan.
- Bergantung pada API gratis Groq — pada penggunaan simultan yang tinggi, rate limit dapat berlaku.
- Untuk pertanyaan di luar cakupan data (mis. cuaca, info non-pariwisata), AI secara sengaja menjawab jujur bahwa informasi tidak tersedia, alih-alih mengarang jawaban — ini merupakan desain yang disengaja untuk mencegah misinformasi, bukan kegagalan sistem.

## 11. AI Use Declaration

Pengembangan sistem **TobaVerse AI** memanfaatkan teknologi kecerdasan buatan (*Artificial Intelligence*) dengan rincian sebagai berikut:

* **Large Language Model (LLM):** Menggunakan **Llama 3.3 (via Groq API)** untuk memproses pemahaman kueri percakapan dan menghasilkan respons alami.
* **Embedding Model:** Memanfaatkan `all-MiniLM-L6-v2` (*Sentence-Transformers*) untuk mengonversi entri teks basis pengetahuan menjadi vektor numerik.
* **Framework RAG (Retrieval-Augmented Generation):** Menerapkan arsitektur RAG agar AI hanya merespons berdasarkan dokumen data resmi yang dipanggil dari Vector Database guna meminimalkan risiko jawaban halusinasi.
* **AI Coding Assistant:** Menggunakan AI Assistant selama proses penulisan kode, *data cleaning script*, dan penyusunan dokumentasi.

---

## 12. Third-Party Declaration

Berikut adalah daftar pustaka (*libraries*), kerangka kerja (*frameworks*), dan aset pihak ketiga yang diintegrasikan ke dalam aplikasi:

### Backend & AI Infrastructure
* **Python 3.10+:** Bahasa pemrograman utama backend.
* **Flask & Flask-CORS:** Web framework dan penangan aturan pertukaran sumber daya lintas domain (*cross-origin*).
* **ChromaDB:** *Vector Database* lokal untuk penyimpanan dan pencarian jarak vektor (*vector similarity search*).
* **Sentence-Transformers:** Pustaka ekstraksi fitur *embeddings* dari teks.
* **Groq API Client:** SDK penghubung ke inference engine Llama 3.3.
* **Pandas & NumPy:** Pustaka pengolahan dan manipulasi data.

### Frontend & UI/UX
* **HTML5, CSS3, & JavaScript (ES6+):** Dasar pembentuk antarmuka dan interaktivitas halaman web.
* **Bootstrap 5:** Kerangka kerja desain antarmuka yang responsif.

### Media & Aset Audio
* **Batak Audio Theme:** Aset musik latar dan efek suara lokal (`batak-theme.mp3`, `Uningan.mp3`) untuk memperkuat nuansa kebudayaan Toba.

---

