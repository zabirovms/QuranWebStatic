import sqlite3
import gzip
import json
import os
from pathlib import Path

# Paths configuration
DB_PATH = Path("C:/Users/Anas/AndroidStudioProjects/QuranApp_replit/assets/data/quran/quran_prebuilt.sqlite")
DEST_DIR = Path(__file__).parent.parent / "public" / "data"

def rebuild_quran_data():
    print("--- Rebuilding Quran Datasets from SQLite ---")
    if not DB_PATH.exists():
        raise FileNotFoundError(f"Source database not found at: {DB_PATH}")

    if not DEST_DIR.exists():
        DEST_DIR.mkdir(parents=True, exist_ok=True)
        print(f"Created destination directory: {DEST_DIR}")

    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()

    # Helpers
    def save_gzipped_json(filename, data):
        filepath = DEST_DIR / filename
        json_bytes = json.dumps(data, ensure_ascii=False).encode("utf-8")
        compressed = gzip.compress(json_bytes)
        filepath.write_bytes(compressed)
        print(f"  Saved: {filename} ({(len(compressed) / 1024):.2f} KB)")

    # 1. Rebuild quran_metadata.json.gz
    print("Compiling quran_metadata.json.gz...")
    cursor.execute("SELECT number, name_arabic, name_tajik, revelation_type, description FROM surah_metadata ORDER BY number")
    surah_meta_rows = cursor.fetchall()
    
    surahs_metadata = []
    for row in surah_meta_rows:
        surah_id, name_ar, name_tj, rev_type, desc = row
        
        # Get ayahs page, juz, verse number and absolute id
        cursor.execute("SELECT verse_id, absolute_id, page, juz FROM verses WHERE surah_id = ? ORDER BY verse_id", (surah_id,))
        verses_rows = cursor.fetchall()
        
        ayahs = [
            {
                "numberInSurah": v[0],
                "number": v[1],
                "page": v[2],
                "juz": v[3]
            }
            for v in verses_rows
        ]
        
        surahs_metadata.append({
            "number": surah_id,
            "name": name_ar,
            "name_tajik": name_tj,
            "revelationType": rev_type,
            "description": desc or "",
            "ayahs": ayahs
        })

    metadata_payload = {"data": {"surahs": surahs_metadata}}
    save_gzipped_json("quran_metadata.json.gz", metadata_payload)


    # Helper to generate TranslationData schema: data -> surahs -> ayahs
    def build_translation_data(query, query_params):
        cursor.execute(query, query_params)
        rows = cursor.fetchall()
        
        surahs_map = {}
        for r in rows:
            surah_id, verse_id, text = r
            if surah_id not in surahs_map:
                surahs_map[surah_id] = []
            surahs_map[surah_id].append({
                "number": verse_id,
                "text": text
            })
            
        surahs_list = []
        for s_id in sorted(surahs_map.keys()):
            surahs_list.append({
                "number": s_id,
                "ayahs": surahs_map[s_id]
            })
            
        return {"data": {"surahs": surahs_list}}


    # Helper to generate VerseDataByKey schema: { "surahNum": [{"verse", "text"}] }
    def build_verse_data_by_key(query, query_params):
        cursor.execute(query, query_params)
        rows = cursor.fetchall()
        
        payload = {}
        for r in rows:
            surah_id, verse_id, text = r
            surah_key = str(surah_id)
            if surah_key not in payload:
                payload[surah_key] = []
            payload[surah_key].append({
                "verse": verse_id,
                "text": text
            })
        return payload


    # 2. Rebuild quran_tj_ayati.json.gz
    print("Compiling quran_tj_ayati.json.gz...")
    ayati_payload = build_translation_data(
        "SELECT surah_id, verse_id, text FROM translations WHERE resource_id = 'tj_ayati' ORDER BY surah_id, verse_id",
        ()
    )
    save_gzipped_json("quran_tj_ayati.json.gz", ayati_payload)

    # 3. Rebuild quran_transliteration.json.gz
    print("Compiling quran_transliteration.json.gz...")
    translit_payload = build_translation_data(
        "SELECT surah_id, verse_id, text FROM translations WHERE resource_id = 'transliteration' ORDER BY surah_id, verse_id",
        ()
    )
    save_gzipped_json("quran_transliteration.json.gz", translit_payload)

    # 4. Rebuild quran_tafsir_osonbayon.json.gz
    print("Compiling quran_tafsir_osonbayon.json.gz...")
    tafsir_payload = build_translation_data(
        "SELECT surah_id, verse_id, text FROM tafsir WHERE resource_id = 'tj_osonbayon' ORDER BY surah_id, verse_id",
        ()
    )
    save_gzipped_json("quran_tafsir_osonbayon.json.gz", tafsir_payload)

    # 5. Rebuild secondary translations
    print("Compiling secondary translations...")
    
    # Abu Alomuddin
    alomuddin = build_verse_data_by_key(
        "SELECT surah_id, verse_id, text FROM translations WHERE resource_id = 'tj_alomuddin' ORDER BY surah_id, verse_id",
        ()
    )
    save_gzipped_json("quran_tj_alomuddin.json.gz", alomuddin)

    # Pioneers Center
    pioneers = build_verse_data_by_key(
        "SELECT surah_id, verse_id, text FROM translations WHERE resource_id = 'tj_pioneers' ORDER BY surah_id, verse_id",
        ()
    )
    save_gzipped_json("quran_tj_pioneers.json.gz", pioneers)

    # Farsi Translation
    farsi = build_verse_data_by_key(
        "SELECT surah_id, verse_id, text FROM translations WHERE resource_id = 'fa_translation' ORDER BY surah_id, verse_id",
        ()
    )
    save_gzipped_json("quran_fa_translation.json.gz", farsi)

    # Russian Kuliev
    russian = build_verse_data_by_key(
        "SELECT surah_id, verse_id, text FROM translations WHERE resource_id = 'ru_kuliev' ORDER BY surah_id, verse_id",
        ()
    )
    save_gzipped_json("quran_ru_kuliev.json.gz", russian)

    conn.close()
    print("Rebuild complete! All 8 files successfully created and compressed.")

if __name__ == "__main__":
    rebuild_quran_data()
