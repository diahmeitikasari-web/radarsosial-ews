# Persistent Rules for AI Coding Assistant (Radar Sosial)

## Two-Track Algorithmic Audit Maintenance Rule
- Dokumen `/AUDIT_TWO_TRACK.md` merupakan dokumen rujukan resmi evaluasi penguasaan program (*program comprehension*) dan audit dua jalur (Track 1: AI Technical Audit & Track 2: Domain/Ethics Audit).
- **Instruksi Wajib**: Setiap kali terjadi perubahan mendasar pada:
  1. Rumus matematika sosiometri, skor Z, klasifikasi Coie-Dodge, atau metrik jaringan SNA di `/src/services/snaEngine.ts`.
  2. Logika heuristik penataan tempat duduk di `/src/services/seatingEngine.ts`.
  3. Struktur data, multi-tenancy sekolah, atau aturan keamanan Firestore (`firestore.rules`).
  4. Antarmuka peran pengguna (Guru BK, Kepala Sekolah, Orang Tua, Super Admin).
  Asisten AI **wajib** memperbaharui berkas `/AUDIT_TWO_TRACK.md` (khususnya nomor baris anotasi kode ground-truth `#A-01` s.d `#A-08`, formula matematika, tabel cross-check 4 zona, dan lembar verifikasi sidang viva dosen).

## Principles of Domain & Ethics
- Selalu patuhi Kode Etik ABKIN: Lindungi kerahasiaan pilihan sosiometri mentah dan jangan tampilkan istilah krisis/patologis ke hadapan orang tua (gunakan narasi `parentNote` pengasuhan positif).
- Patuhi Permendikbudristek No. 46 Tahun 2023 (PPKSP/TPPK) untuk deteksi dini dan intervensi iklim sosial sekolah.
