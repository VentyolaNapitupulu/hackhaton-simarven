"""
build_vector_db.py

Tujuan: membaca knowledge_base.json (hasil dari build_knowledge_base.py),
mengubah tiap teks jadi embedding, dan menyimpannya ke ChromaDB
(vector database) yang tersimpan permanen di disk (folder ./chroma_db).

Jalankan SEKALI saja di awal (atau setiap kali knowledge_base.json berubah).
Setelah ini selesai, backend (app.py) tinggal MEMBACA database yang sudah
jadi ini -- tidak perlu bikin ulang setiap kali ada pertanyaan user.

Cara pakai:
    python build_vector_db.py
"""

import json
import chromadb
from chromadb.utils import embedding_functions

KB_FILE = "knowledge_base.json"
DB_PATH = "./chroma_db"
COLLECTION_NAME = "tobaverse_knowledge"

# ------------------------------------------------------------------
# 1. Siapkan fungsi embedding
#    Model "all-MiniLM-L6-v2": kecil (~80MB), cepat, gratis, jalan
#    lokal di laptop (tidak perlu API key untuk bagian ini).
# ------------------------------------------------------------------
print("Menyiapkan model embedding (unduhan pertama kali bisa makan waktu 1-2 menit)...")
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

# ------------------------------------------------------------------
# 2. Baca knowledge base
# ------------------------------------------------------------------
with open(KB_FILE, "r", encoding="utf-8") as f:
    knowledge_base = json.load(f)

print(f"Ditemukan {len(knowledge_base)} entri di {KB_FILE}")

# ------------------------------------------------------------------
# 3. Buat / buka koleksi ChromaDB
# ------------------------------------------------------------------
client = chromadb.PersistentClient(path=DB_PATH)

# Hapus koleksi lama jika ada (supaya tidak dobel kalau dijalankan ulang)
try:
    client.delete_collection(COLLECTION_NAME)
    print("Koleksi lama dihapus, membuat ulang dari nol...")
except Exception:
    pass

collection = client.create_collection(
    name=COLLECTION_NAME,
    embedding_function=embedding_fn
)

# ------------------------------------------------------------------
# 4. Masukkan semua entri ke koleksi (ChromaDB otomatis bikin embedding)
# ------------------------------------------------------------------
ids = [item["id"] for item in knowledge_base]
documents = [item["text"] for item in knowledge_base]
metadatas = [
    {"source": item["source"], "place_name": item["place_name"]}
    for item in knowledge_base
]

print("Membuat embedding untuk semua entri (proses ini butuh waktu, sabar ya)...")
collection.add(ids=ids, documents=documents, metadatas=metadatas)

print(f"\nSelesai! Vector database tersimpan di folder: {DB_PATH}")
print(f"Total entri ter-index: {collection.count()}")

# ------------------------------------------------------------------
# 5. Tes cepat: coba cari sesuatu
# ------------------------------------------------------------------
print("\n=== TES PENCARIAN ===")
hasil = collection.query(
    query_texts=["tempat wisata alam yang murah di Balige"],
    n_results=3
)
for i, (doc, meta) in enumerate(zip(hasil["documents"][0], hasil["metadatas"][0])):
    print(f"\n{i+1}. [{meta['source']}] {meta['place_name']}")
    print(f"   {doc[:150]}...")