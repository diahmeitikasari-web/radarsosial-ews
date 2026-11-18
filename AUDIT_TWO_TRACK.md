# Laporan Audit Algoritmik Dua Jalur (Two-Track Algorithmic Audit)
## Evaluasi Program Comprehension: Platform Radar Sosial
### Sistem Pemetaan Sosiometri, Analisis Jaringan Relasi Siswa (SNA), & Deteksi Dini Iklim Sosial Sekolah / Madrasah
**Laboratorium Bimbingan & Konseling, Tim Riset Pemetaan Relasi Sosial & TPPK Satuan Pendidikan**  
*Metodologi Audit: Verifikasi Algoritma, Anotasi Kode Ground-Truth, Uji Domain Sosiometri/Psikometri & Kesiapan Sidang Viva Dosen*

---

### Ringkasan Eksekutif (Executive Summary)

Laporan audit ini disusun sebagai bukti otentisitas penguasaan program (*program comprehension*) secara komprehensif terhadap arsitektur dan basis kode **Radar Sosial** (Platform Pemetaan Sosiometri & Perilaku Siswa berbasis model Jacob Levy Moreno dan Coie & Dodge 1982). Tujuan utamanya adalah menjamin bahwa pengembang dan peneliti menguasai secara mandiri setiap formula matematika, algoritma graf, mekanisme normalisasi statistik skor-Z, pembatasan etis kerahasiaan konseling, dan keputusan arsitektur multi-tenant di hadapan dewan penguji/dosen pembimbing, tanpa bergantung secara pasif pada kode buatan AI.

Metodologi audit ini mengadopsi format **Dua Jalur (Two-Track Algorithmic Audit)**:
1. **Track 1 (AI Technical Audit)**: Pemeriksaan teknis terhadap arsitektur perangkat lunak, jalur aliran data (data pipeline), mesin komputasi sosiometrik, algoritma graf Brandes, mesin penataan tempat duduk adaptif (*smart seating*), dan mitigasi titik rawan *bugs/edge-cases*.
2. **Lembar Anotasi Kode Ground-Truth (#A-01 s.d #A-08)**: Penjangkaran baris kode nyata (*exact line anchors*) pada berkas sumber proyek ke landasan konseptual dan matematis.
3. **Track 2 (Domain & Ethics Audit)**: Evaluasi kesesuaian terhadap teori psikologi sosial (Moreno 1934, Coie-Dodge 1982, Peer Evaluation Inventory, Hawley 2003), Kode Etik Bimbingan dan Konseling Indonesia (ABKIN), serta regulasi Permendikbudristek No. 46 Tahun 2023 tentang Pencegahan dan Penanganan Kekerasan di Lingkungan Satuan Pendidikan (PPKSP/TPPK).
4. **Tabel Cross-Check 4 Zona & Rubrik Viva Dosen**: Pemetaan zona (*Konvergen*, *AI Salah/Dangkal*, *Telah Diperbaiki*, dan *Perlu Investigasi Lanjutan*), dilengkapi simulasi tanya jawab kritis sidang skripsi/tesis.

---

## 1. Track 1: Laporan Audit Teknis AI (AI Technical Audit)

### 1.1 Arsitektur Aplikasi & Alur Data
- **Pondasi Arsitektur**: Client-side Reactive Single Page Application berbasis **React 18 + Vite + TypeScript**, didukung oleh modul kalkulasi mandiri (*pure functions*) pada `/src/services/snaEngine.ts` dan `/src/services/seatingEngine.ts`, serta lapisan persistensi Cloud-First berbasis **Cloud Firestore Single Source of Truth** dengan cache lokal di `/src/services/dataStorage.ts` dan `/src/services/firestoreSync.ts` agar unggahan Guru BK konsisten lintas perangkat.
- **Alur Data Lengkap**:
  1. *Input & Impor Instrumen*: Data siswa dan nominasi sosiometrik dimasukkan melalui kuisioner langsung atau diimpor massal via berkas Excel (`/src/services/excelHandler.ts`).
  2. *Agregasi Pilihan Mentah*: Menghitung total pilihan disukai (*Likes Received* / $L$), pilihan ditolak (*Dislikes Received* / $D$), serta nominasi yang diberikan (*Likes/Dislikes Given*).
  3. *Mesin Standarisasi Skor Z*: Menghitung rata-rata ($\mu$) dan simpangan baku ($\sigma$) pada tingkat rombel/sekolah untuk menghasilkan $z_L$, $z_D$, *Social Preference* ($z_{SP}$), dan *Social Impact* ($z_{SI}$).
  4. *Klasifikasi Sosio-Perilaku 2 Tingkat*: Menggabungkan kuadran Coie-Dodge dengan 5 dimensi *Peer Evaluation Inventory* (Prososial, Agresif, Menarik Diri, Viktimisasi, Hiperaktif) untuk menghasilkan tipologi spesifik (mis. *Passive Victim*, *Bistrategic*, *Isolated*).
  5. *Mesin Graf Jaringan (SNA Graph Engine)*: Membangun matriks ketetanggaan (*adjacency matrix*), menghitung densitas kelas, rasio resiprositas timbal-balik, indeks sentralitas perantara (*Brandes Betweenness Centrality*), deteksi komunitas klik tertutup (*Label Propagation*), dan indeks homofili gender.
  6. *Mesin Optimasi Penataan Meja (Smart Seating Engine)*: Heuristik penempatan tempat duduk yang memasangkan siswa rentan dengan mentor prososial (*buddy system*) serta mengisolasi pasangan konflik (*mutual dislike*).
  7. *Penyajian Multi-Peran (Role-Based View)*:
     - **Guru BK**: Analisis mendalam, rekam catatan klinis terproteksi, rekomendasi DSS intervensi, ekspor PDF/Excel.
     - **Kepala Sekolah**: Agregat iklim sosial sekolah, indeks TPPK, rekomendasi kebijakan manajerial.
     - **Orang Tua**: Narasi ramah pengasuhan (*strength-based gentle guidance*) tanpa label klinis yang mencemaskan.
     - **Super Admin**: Audit log, manajemen periode, matriks korelasi Pearson/Spearman, dan agregasi lintas satuan pendidikan.

### 1.2 Inventarisasi Komponen Matematis & Algoritma Inti
| Modul / Komponen | Tipe Algoritma / Formula | Berkas Sumber | Cakupan Keluaran |
| :--- | :--- | :--- | :--- |
| **Normalisasi Skor Z** | Formula Baku Normalisasi Gaussian | `/src/services/snaEngine.ts` (baris 69–104) | $z_L, z_D, z_{SP}, z_{SI}$ |
| **Klasifikasi Coie & Dodge** | Logika Ambang Batas 5 Kategori (1982) + Zero-Variance Guard | `/src/services/snaEngine.ts` (baris 84–85, 106–118) | Popular, Rejected, Neglected, Controversial, Average |
| **Tipologi Perilaku Sebaya** | Integrasi Moreno x PEI x Hawley | `/src/services/snaEngine.ts` (baris 129–147) | 7 Kategori Profil Sosio-Perilaku |
| **Deteksi Broker Jaringan** | Algoritma Brandes (*Betweenness Centrality*) | `/src/services/snaEngine.ts` (baris 509–576) | Skor Betweenness ternormalisasi & Siswa Broker |
| **Deteksi Komunitas Klik** | *Weighted Label Propagation Algorithm* | `/src/services/snaEngine.ts` (baris 578–720) | Klaster Klik, Pemimpin Subgrup, Indeks Eksklusivitas |
| **Indeks Homofili Gender** | Perbandingan Relasi Intra vs Inter-Gender | `/src/services/snaEngine.ts` (baris 722–738) | Nilai $-1.0$ s.d $+1.0$ |
| **Smart Seating Optimizer** | Heuristik Constraint-Satisfaction Penataan Meja | `/src/services/seatingEngine.ts` (baris 16–285) | Denah Meja, Harmony Score, Pasangan Buddy |
| **Evaluasi Iklim Kelas** | Formula Tertimbang Kohesi Multi-Kriteria & Penalti Risiko | `/src/services/snaEngine.ts` (baris 272–458) | Skor Iklim (0–100) & Status Kondusif/Waspada/Kritis/Belum Terisi |
| **Komparasi Belajar vs Bermain** | Pemisahan Sosio-Instrumental vs Sosio-Afektif & Kesenjangan Lintas Konteks | `/src/services/snaEngine.ts` (baris 750–924), `/src/components/OfficialPDFReport.tsx`, `/src/dashboards/GuruBKDashboard.tsx` | Metrik & Iklim Belajar vs Bermain, 5 Tipe Kesenjangan Siswa, Sintesis PDF Resmi |

### 1.3 Formula Skoring & Ambang Batas Matematis
1. **Standarisasi Skor Z Rombel (setelah deduplikasi relasi & eliminasi *self-nomination*)**:
   $$\mu_L = \frac{\sum L_i}{n}, \quad \sigma_L = \sqrt{\frac{\sum (L_i - \mu_L)^2}{n}}$$
   $$\mu_D = \frac{\sum D_i}{n}, \quad \sigma_D = \sqrt{\frac{\sum (D_i - \mu_D)^2}{n}}$$
   $$z_L = \frac{L - \mu_L}{\sigma_L}, \quad z_D = \frac{D - \mu_D}{\sigma_D}$$
2. **Preferensi Sosial ($z_{SP}$) & Dampak Sosial ($z_{SI}$)**:
   $$z_{SP} = z_L - z_D \quad (\text{Ukuran Seberapa Disukai Relatif terhadap Penolakan})$$
   $$z_{SI} = z_L + z_D \quad (\text{Ukuran Tingkat Keberadaan / Visibilitas Sosial})$$
3. **Kriteria Klasifikasi Status Coie & Dodge (1982) dengan *Zero-Dislike / Zero-Like Guard***:
   - **Popular**: $z_{SP} > 1.0 \land z_L > 0 \land (z_D < 0 \text{ atau } z_D \le 0 \text{ bila } \mu_D = \sigma_D = 0)$
   - **Rejected**: $z_{SP} < -1.0 \land z_D > 0 \land (z_L < 0 \text{ atau } z_L \le 0 \text{ bila } \mu_L = \sigma_L = 0)$
   - **Neglected**: $z_{SI} < -1.0 \land L \le \mu_L$
   - **Controversial**: $z_{SI} > 1.0 \land z_L > 0 \land z_D > 0$
   - **Average**: Siswa di luar batas kriteria di atas (posisi adaptif mayoritas).
4. **Densitas Multi-Kriteria & Resiprositas Berbasis Kriteria**:
   $$\text{Density} = \min\left(1,\; \frac{|E_{\text{like}}^{\text{unik}}|}{n(n-1) \times K_{\text{aktif}}}\right)$$
   di mana $K_{\text{aktif}}$ adalah jumlah kriteria aktif (mis. Belajar & Bermain = 2), dan pasangan timbal balik (*Reciprocity*) dihitung pada himpunan `(criteria, studentId, targetId)` agar sinkron dengan visualisasi sosiogram.
5. **Sentralitas Perantara Brandes ($C_B$)**:
   Untuk setiap simpul $v \in V$, Brandes menghitung akumulasi *pair-dependency* $\delta_{s\bullet}(v)$ dalam waktu $\mathcal{O}(|V| \cdot |E|)$:
   $$\delta_{s\bullet}(v) = \sum_{w: v \in \text{Pred}(s, w)} \frac{\sigma_{sv}}{\sigma_{sw}} (1 + \delta_{s\bullet}(w))$$
   Ternormalisasi untuk graf tak-berarah/berpasangan: $C_B'(v) = \frac{C_B(v)}{(n-1)(n-2)}$.
6. **Skor Iklim Sosial Kelas (0–100)**:
   $$\text{Climate} = \text{clamp}\left(65 + \min(35,\; \text{Density} \times 180) + (\text{Reciprocity} \times 0.25) - (\text{Rejected} \times 12) - (\text{Neglected} \times 6),\; 10,\; 100\right)$$
   - $\ge 70$: **Kondusif**
   - $45 - 69$: **Waspada** (Rekomendasi TPPK aktif)
   - $< 45$: **Kritis** (Prioritas intervensi darurat)
   - $0$ nominasi aktif: **Belum Terisi** (Skor $0$, sosiogram dikosongkan)

### 1.4 Temuan Tiga (3) Titik Paling Rawan Error (Bugs & Bottlenecks)
- **Bug 1 (Zero Variance / Jebakan Kolom Dislike Kosong pada Coie-Dodge)**: Pada `/src/services/snaEngine.ts` baris 81–85 dan 108–111, jika seluruh siswa hanya mengisi pilihan positif (*Likes*) dan mengosongkan kolom penolakan (*Dislikes* = 0 semua), maka nilai $\mu_D = 0, \sigma_D = 0 \implies z_D = 0$ untuk semua siswa. Kondisi ketat `zD < 0` akan gagal melabeli siswa ber-`zSP > 1.0` sebagai *Popular*. Telah ditambahkan *guard* `Math.sqrt(variance) || 1` serta kondisi `(noDislikesInClass ? zD <= 0 : zD < 0)` dan `(noLikesInClass ? zL <= 0 : zL < 0)`.
- **Bug 2 (Blank Screen & Kebocoran State Impor Excel serta Analisis Gabungan Saja di PDF)**: Pada `/src/components/ExcelUploadModal.tsx`, pengaksesan `parsedResult.students` saat `parsedResult === null` sempat menyebabkan runtime crash (*blank screen*), dan sebelumnya laporan PDF (`OfficialPDFReport.tsx`) serta Tabel Matriks Guru BK hanya menampilkan angka agregat gabungan tanpa memisahkan **Kategori Belajar (Sosio-Instrumental)** dan **Kategori Bermain (Sosio-Afektif)**. Kini telah diproteksi dengan null-guard modal, pembersihan state `useEffect`, `<AppErrorBoundary>` di `App.tsx`, serta fungsi `calculateDualCriteriaComparison()` di `snaEngine.ts` yang menyajikan perbandingan eksplisit *Belajar vs Bermain* di Sosiometri Guru BK dan Laporan Resmi PDF.
- **Bug 3 (Kebocoran Istilah Klinis Konseling ke Dashboard Orang Tua)**: Pada berkas `/src/dashboards/OrangTuaDashboard.tsx` baris 167, teks rekomendasi awalnya menampilkan `student.dssRecommendation` (yang memuat istilah *"Intervensi Konseling Krisis: Perlindungan psikologis segera"*). Hal ini berisiko menimbulkan kecemasan (*secondary panic*) bagi wali murid. Telah diperbaiki dengan mengutamakan properti `student.parentNote` yang berorientasi pada pengasuhan positif (*gentle strength-based guidance*).

---

## 2. Lembar Anotasi Kode Ground-Truth (Ground-Truth Code Anchors)

### Anotasi #A-01: Standarisasi Skor Z & Klasifikasi Coie & Dodge (1982)
- **File & Baris**: `/src/services/snaEngine.ts`, baris 84–118 (penjagaan data kosong di baris 32–37, deduplikasi di baris 52–67)
- **Fungsi / Variabel**: `calculateSNAMetrics()`, variabel `zL`, `zD`, `zSP`, `zSI`, `noDislikesInClass`, dan `status`
- **Cuplikan Kode**:
  ```typescript
  // Domain Rule: Jika data kuesioner sosiometri belum terisi (0 nominasi atau 0 pada kriteria filter aktif),
  // jangan lakukan kalkulasi semu yang menetapkan semua siswa sebagai 'Average'.
  if (nominations.length === 0 || activeNoms.length === 0) {
    return [];
  }

  const zL = (L - meanLikes) / stdLikes;
  const zD = (D - meanDislikes) / stdDislikes;

  // Coie & Dodge Formulas
  const zSP = zL - zD; // Social Preference
  const zSI = zL + zD; // Social Impact

  // Coie & Dodge 1982 Status Classification (with zero-dislike / zero-like variance guard)
  let status: CoieDodgeStatus = 'Average';
  if (zSP > 1.0 && zL > 0 && (noDislikesInClass ? zD <= 0 : zD < 0)) {
    status = 'Popular';
  } else if (zSP < -1.0 && zD > 0 && (noLikesInClass ? zL <= 0 : zL < 0)) {
    status = 'Rejected';
  } else if (zSI < -1.0 && L <= meanLikes) {
    status = 'Neglected';
  } else if (zSI > 1.0 && zL > 0 && zD > 0) {
    status = 'Controversial';
  } else {
    status = 'Average';
  }
  ```
- **Tinjauan AI**: AI menyatakan bahwa Coie-Dodge dapat diterapkan hanya dengan membandingkan selisih nilai mentah suka dan tidak suka ($L - D$). Selain itu AI awalnya membiarkan kelas kosong (0 like dan 0 dislike) dihitung sebagai populasi aktif, serta gagal mengklasifikasikan siswa `Popular` ketika seluruh kelas tidak mengisi kolom penolakan ($D = 0 \implies z_D = 0$).
- **Tinjauan Ahli Domain**: **Koreksi Terhadap AI**. Pendekatan selisih mentah cacat metodologis karena tidak memperhitungkan varians sebaran kelas. Menggunakan skor Z yang dibakukan terhadap $\mu$ dan $\sigma$ kelas (ditambah *zero-dislike guard*) menjamin komparabilitas antar-rombel sekaligus akurasi saat kuesioner hanya mengumpulkan nominasi positif. Jika kuesioner belum diisi, sosiogram wajib dikosongkan tanpa nama siswa.
- **Zona**: `✓ Konvergen (Telah Terverifikasi Penuh Sesuai Coie, Dodge, & Coppotelli 1982)`

---

### Anotasi #A-02: Matriks Silang Perilaku Sebaya (Moreno x PEI x Hawley)
- **File & Baris**: `/src/services/snaEngine.ts`, baris 129–147
- **Fungsi / Variabel**: Penentuan `behavioralStatus`
- **Cuplikan Kode**:
  ```typescript
  let behavioralStatus: BehavioralCategory = 'Average / Adaptif';
  if (status === 'Popular' && b.prosocial >= 6) {
    behavioralStatus = 'Populer-Prososial';
  } else if ((status === 'Popular' || status === 'Controversial') && b.aggressive >= 6) {
    behavioralStatus = 'Bistrategic';
  } else if (status === 'Rejected' && b.aggressive >= 6) {
    behavioralStatus = 'Aggressive Victim';
  } else if (status === 'Rejected' && (b.withdrawn >= 6 || b.victimization >= 5)) {
    behavioralStatus = 'Passive Victim';
  } else if (status === 'Neglected' && b.withdrawn >= 6) {
    behavioralStatus = 'Isolated';
  }
  ```
- **Tinjauan AI**: AI mengasumsikan siswa populer selalu memiliki perilaku positif tanpa potensi manipulasi.
- **Tinjauan Ahli Domain**: **Koreksi Terhadap AI**. Merujuk pada *Bistrategic Control Theory* (Patricia Hawley, 2003), sebagian siswa memiliki popularitas tinggi sekaligus perilaku agresif/dominan (menggunakan agresi relasional untuk mempertahankan dominasi sosial). Kategorisasi `Bistrategic` dan pemisahan antara `Passive Victim` vs `Aggressive Victim` membuktikan pemahaman mendalam tentang dinamika perundungan (*bullying dynamics*).
- **Zona**: `✓ Konvergen (Melampaui Logika AI Standar)`

---

### Anotasi #A-03: Algoritma Brandes untuk Deteksi Siswa Broker Sosial
- **File & Baris**: `/src/services/snaEngine.ts`, baris 509–576
- **Fungsi / Variabel**: `detectCommunitiesAndBrokers()`, variabel `betweenness`
- **Cuplikan Kode**:
  ```typescript
  // BRANDES' ALGORITHM FOR BETWEENNESS CENTRALITY (SHORT PATH BROKER DETECTION)
  const betweenness: Record<string, number> = {};
  students.forEach((s) => (betweenness[s.id] = 0));
  // BFS Traversal, predecessor tracking, & backward dependency accumulation
  ```
- **Tinjauan AI**: AI pada perancangan awal mengusulkan menghitung *Degree Centrality* sederhana untuk mencari siswa kunci.
- **Tinjauan Ahli Domain**: **Koreksi Terhadap AI**. Degree Centrality hanya mengukur popularitas lokal. Deteksi "jembatan sosial" (broker) yang menghubungkan sub-kelompok yang saling bermusuhan memerlukan *Betweenness Centrality* berbasis Algoritma Brandes (2001). Siswa dengan betweenness tinggi adalah kandidat terbaik untuk program *Peer Mediation*.
- **Zona**: `✓ Konvergen (Peningkatan Mandiri Peneliti)`

---

### Anotasi #A-04: Deteksi Klik Komunitas & Indeks Eksklusivitas
- **File & Baris**: `/src/services/snaEngine.ts`, baris 662–720
- **Fungsi / Variabel**: `detectCommunitiesAndBrokers()`, penghitungan `exclusivityIndex`
- **Cuplikan Kode**:
  ```typescript
  const maxInternalEdges = memberIds.length * (memberIds.length - 1) || 1;
  const internalDensity = Number((internalTiesCount / maxInternalEdges).toFixed(2));
  const totalTies = externalTiesCount + internalTiesCount;
  const exclusivityIndex =
    totalTies > 0 ? Number(((internalTiesCount - externalTiesCount) / totalTies).toFixed(2)) : 0;
  ```
- **Tinjauan AI**: Menampilkan komunitas hanya sebagai klaster warna tanpa mengukur derajat ketertutupan kelompok.
- **Tinjauan Ahli Domain**: Indeks eksklusivitas $\frac{I - E}{I + E}$ (konsep *E-I Index* Krackhardt & Stern 1988) sangat penting. Nilai $> 0.4$ menandakan *Insular Clique* (geng tertutup) yang rentan memicu polarisasi kelas, sedangkan nilai $\le 0$ menunjukkan kelompok terbuka.
- **Zona**: `✓ Konvergen`

---

### Anotasi #A-05: Smart Seating Optimizer & Pemisahan Pasangan Konflik
- **File & Baris**: `/src/services/seatingEngine.ts`, baris 45–86 & 127–181
- **Fungsi / Variabel**: `generateOptimizedSeating()`, fungsi `isCompatiblePair()`
- **Cuplikan Kode**:
  ```typescript
  const isCompatiblePair = (id1: string, id2: string): boolean => {
    if (dislikePairs.has(`${id1}->${id2}`) || dislikePairs.has(`${id2}->${id1}`)) {
      return false;
    }
    return true;
  };
  // Pasangkan Vulnerable Student dengan Prosocial Mentor di Meja Baris 1-2
  ```
- **Tinjauan AI**: Mengusulkan algoritma acak (*random shuffle*) atau pengurutan abjad.
- **Tinjauan Ahli Domain**: Penataan tempat duduk adalah intervensi sosio-spasial (*spatial nudge*). Algoritma harus: (1) secara mutlak memisahkan pasangan *mutual dislike* guna mencegah gesekan fisik/verbal, dan (2) menempatkan siswa terisolasi (*Neglected/Passive Victim*) berdampingan dengan siswa *Populer-Prososial* sebagai *peer buddy*.
- **Zona**: `✓ Konvergen`

---

### Anotasi #A-06: Evaluasi Iklim Sosial Kelas & Peringatan Dini Kebijakan TPPK
- **File & Baris**: `/src/services/snaEngine.ts`, baris 272–394 (serta `calculateDualCriteriaComparison()` di baris 750–924)
- **Fungsi / Variabel**: `calculateClassAggregate()`, variabel `density`, `reciprocityRate`, `climateScore`, `climateIndex`, `kepsekPolicyAdvice`
- **Cuplikan Kode**:
  ```typescript
  // Domain Rule: Jika data kuesioner sosiometri kosong (0 nominasi),
  // jangan tampilkan iklim semu 'Kondusif' atau skor rata-rata palsu.
  if (totalStudents === 0 || nominations.length === 0 || metrics.length === 0) {
    return {
      classId, className, periodId, periodName, totalStudents,
      density: 0, reciprocityRate: 0,
      statusCounts: { Popular: 0, Rejected: 0, Neglected: 0, Controversial: 0, Average: 0 },
      riskSummary: { highRiskCount: 0, mediumRiskCount: 0, lowRiskCount: 0 },
      climateIndex: 'Belum Terisi',
      climateScore: 0,
      dssStrategicAdvice: [`Data sosiometri rombel ${className} belum diisi untuk ${periodName}...`],
      kepsekPolicyAdvice: [`Asesmen sosiometri rombel ${className} belum terlaksana pada periode ini...`],
    };
  }

  const maxPossibleEdgesPerCriterion = totalStudents * (totalStudents - 1) || 1;
  const activeCriteriaCount = Math.max(1, new Set(nominations.map((n) => n.criteria)).size);
  const density = Number(
    Math.min(1, positiveEdges / (maxPossibleEdgesPerCriterion * activeCriteriaCount)).toFixed(3)
  );

  const rejectionPenalty = statusCounts.Rejected * 12;
  const neglectedPenalty = statusCounts.Neglected * 6;
  const densityBonus = Math.min(35, density * 180);
  const reciprocityBonus = (reciprocityRate / 100) * 25;

  let rawClimate = 65 + densityBonus + reciprocityBonus - rejectionPenalty - neglectedPenalty;
  rawClimate = Math.min(100, Math.max(10, Math.round(rawClimate)));
  ```
- **Tinjauan AI**: Mengukur iklim hanya dari rasio siswa yang mengisi kuisioner, menetapkan nilai *default* 65 (Kondusif) meskipun belum ada data terisi, serta menjumlahkan seluruh nominasi *Belajar* dan *Bermain* tanpa menormalisasi penyebut densitas dengan jumlah kriteria aktif (`activeCriteriaCount`).
- **Tinjauan Ahli Domain**: **Koreksi Terhadap AI (Koreksi Mutlak)**. Iklim sosial kelas ditentukan oleh struktur relasional: kohesi jaringan (densitas ternormalisasi per kriteria & resiprositas berbasis kriteria) sebagai faktor pelindung, serta jumlah siswa *Rejected* dan *Neglected* sebagai faktor risiko. Jika data kuesioner belum diisi, status iklim wajib ditetapkan sebagai `Belum Terisi` (Skor 0) agar kepala sekolah dan TPPK tidak salah mengira kelas yang belum disurvei sudah aman.
- **Zona**: `✓ Konvergen (Telah Diperbaiki & Diuji)`

---

### Anotasi #A-07: Isolasi Multi-Tenant, Proteksi Scoping Impor Data & Sinkronisasi Cloud Lintas Perangkat
- **File & Baris**: `/src/components/ExcelUploadModal.tsx` (baris 91–266), `/src/services/dataStorage.ts` (baris 238–350 & 714–800), `/src/services/firestoreSync.ts` (baris 337–431 & 491–537), & `/firestore.rules` (baris 1–151)
- **Fungsi / Variabel**: `handleConfirmSave()`, `saveClassImportAsync()`, `syncFromCloud()`, `replaceScopedBatch()`, `seedMissingMasterTenantsToCloud()`
- **Cuplikan Kode**:
  ```typescript
  // ExcelUploadModal.tsx — Proteksi Scoping & Commit Cloud Terverifikasi:
  if (!isOpen || !activeClass || !activePeriod) return null;
  const saveResult = await dataStorage.saveClassImportAsync({
    classId: finalClassId, periodId: activePeriod.id,
    students: finalStudents, nominations: finalNominations, behaviors: finalBehaviors,
    createdClass: createdClassObj,
  });

  // firestoreSync.ts — Clean Overwrite Berbasis Kueri Tunggal (Tanpa Ketergantungan Composite Index):
  const primaryFilter = filters.find((f) => f.field === 'classId') || filters[0];
  const existingSnap = primaryFilter
    ? await getDocs(query(collection(db, collectionName), where(primaryFilter.field, '==', primaryFilter.value)))
    : await getDocs(collection(db, collectionName));
  ```
- **Tinjauan AI**: AI awalnya mencari kelas hanya berdasarkan nama (`classes.find(c => c.name === name)`), menutup modal Excel secara optimistik tanpa menunggu *commit* Cloud Firestore, menimpa ulang kelas yang sudah diunggah dengan data *mock* pada `syncFromCloud()`, memakai dua filter `where` yang gagal karena *composite index*, serta tidak menyertakan koleksi `users` dan `password_requests` di `firestore.rules`.
- **Tinjauan Ahli Domain**: **Koreksi Terhadap AI (Telah Diperbaiki)**. Scoping multi-tenant, integritas timpa bersih (*clean overwrite*), dan persistensi lintas perangkat wajib dijaga dari lapisan UI hingga aturan keamanan Firestore (13 koleksi + `test/{docId}` dengan batas skema `isBoundedMap()` dan `isValidId()`). Sistem melayani **7 tenant satuan pendidikan** (MTsN 2 Bangka, SMA Negeri Olahraga M. Noer, MTs Daarul Abror, SMPN 1 Bakam, SMPN 7 Pangkal Pinang, SMK N 5 Pangkalpinang, serta **IAIN Syaikh Abdurrahman Siddik / IAIN SAS** dengan Prodi **PAI**, **TBI**, dan **BKPI**) menggunakan **Cloud Firestore sebagai Single Source of Truth** sehingga unggahan Guru BK otomatis sinkron ke seluruh perangkat secara *real-time*.
- **Zona**: `✓ Konvergen (Telah Diperbaiki & Terverifikasi Cloud Sync Lintas Perangkat)`

---

### Anotasi #A-08: Etika Pelabelan & Komunikasi Ramah Pengasuhan (*Non-Stigmatizing Parent Guidance*)
- **File & Baris**: `/src/dashboards/OrangTuaDashboard.tsx`, baris 163–168 & `/src/services/snaEngine.ts`, baris 197–208
- **Fungsi / Variabel**: `student.parentNote` vs `student.dssRecommendation`
- **Cuplikan Kode**:
  ```typescript
  // snaEngine.ts
  if (riskLevel === 'Tinggi') {
    parentNote =
      'Ananda sedang menghadapi fase adaptasi pertemanan yang membutuhkan dukungan penuh di rumah. Luangkan waktu 15 menit setiap hari untuk mendengarkan perasaannya tanpa menghakimi...';
  }
  // OrangTuaDashboard.tsx
  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
    {student.parentNote || student.dssRecommendation}
  </p>
  ```
- **Tinjauan AI**: AI awalnya merender `dssRecommendation` yang berisi instruksi teknis konseling krisis langsung ke hadapan orang tua.
- **Tinjauan Ahli Domain**: **Koreksi Terhadap AI (Telah Diperbaiki)**. Berdasarkan Kode Etik ABKIN, diagnosis atau terminologi krisis tidak boleh diberikan mentah kepada wali murid karena berisiko memicu histeria atau hukuman sekunder (*punitive reaction*) di rumah. Pesan wajib dikonversi menjadi panduan pengasuhan berbasis kekuatan (*strength-based parental guidance*).
- **Zona**: `✓ Telah Diperbaiki (Dahulu: AI Dangkal → Sekarang: Konvergen Sesuai Etika Konseling)`

---

## 3. Track 2: Evaluasi Domain & Standar Keilmuan

### 3.1 Landasan Teoretis Sosiometri Jacob Levy Moreno (1934)
Metode sosiometri yang dikembangkan oleh J.L. Moreno dalam karyanya *"Who Shall Survive?"* (1934) mendasari struktur directed-graph dalam Radar Sosial. Setiap siswa memberikan pilihan positif (*attraction*) dan negatif (*repulsion*) berdasarkan kriteria fungsional nyata (belajar kelompok dan bermain). Sistem menghindari pertanyaan abstrak dengan menyajikan kriteria situasional spesifik.

### 3.2 Validitas Psikometri Model Coie, Dodge, & Coppotelli (1982)
Model Coie-Dodge merupakan *gold standard* dalam psikologi perkembangan anak untuk meneliti relasi teman sebaya (*peer status*). Penggunaan dua dimensi ortogonal ($z_{SP}$ dan $z_{SI}$) mengoreksi kelemahan sosiometri satu dimensi:
- Membedakan siswa yang **tidak disukai aktif** (*Rejected*) dari siswa yang **diabaikan/tidak terlihat** (*Neglected*).
- Mengidentifikasi kelompok **Kontroversial** (siswa yang memiliki banyak pendukung setia sekaligus banyak penentang).

### 3.3 Kepatuhan Kebijakan Permendikbudristek No. 46 Tahun 2023 (PPKSP / TPPK)
Sistem Radar Sosial dirancang selaras dengan mandat pencegahan kekerasan di sekolah:
- **Deteksi Dini**: Mengidentifikasi potensi viktimisasi dan pengucilan sosial sebelum eskalasi menjadi kekerasan fisik.
- **Dukungan Kebijakan Kepala Sekolah**: Menyediakan data agregat untuk pelaporan TPPK tanpa membuka identitas mentah siswa ke publik.

### 3.4 Kode Etik Bimbingan dan Konseling Indonesia (ABKIN)
1. **Asas Kerahasiaan (Confidentiality)**: Sosiomatriks mentah (siapa memilih siapa) hanya boleh diakses oleh Guru BK bersertifikasi dan tidak pernah ditampilkan kepada sesama siswa maupun orang tua.
2. **Asas Non-Labeling**: Status sosiometrik bersifat dinamis (*state*), bukan label kepribadian permanen (*trait*). Oleh karena itu, sistem menyediakan fitur *Longitudinal Trajectory Tracking* untuk memantau pemulihan status siswa dari semester ke semester.

---

## 4. Tabel Cross-Check 4 Zona

| ID Anotasi | Klaim Teknis AI | Evaluasi Ahli Domain | Penetapan Zona | Tindakan Nyata pada Basis Kode |
| :---: | :--- | :--- | :---: | :--- |
| **#A-01** | Coie-Dodge cukup dihitung dengan selisih mentah $(L - D)$. | Selisih mentah bias terhadap ukuran rombel; wajib standarisasi skor Z $(\mu, \sigma)$. | **Konvergen** | Rumus Z-Score baku diimplementasikan penuh di `snaEngine.ts`. |
| **#A-02** | Siswa populer selalu bersifat ramah prososial. | Teori Hawley (2003) membuktikan adanya figur *Bistrategic* yang agresif namun populer. | **Konvergen** | Dibuat matriks silang 7 tipologi sosio-perilaku di `snaEngine.ts`. |
| **#A-03** | Degree centrality cukup untuk mencari siswa kunci. | Broker penghubung antar-geng membutuhkan *Betweenness Centrality* Brandes (2001). | **Konvergen** | Diimplementasikan algoritma Brandes $\mathcal{O}(\|V\| \cdot \|E\|)$ di `snaEngine.ts`. |
| **#A-04** | Komunitas klik cukup digambarkan dengan warna klaster. | Perlu E-I Index (Krackhardt) untuk membedakan geng tertutup dari kelompok terbuka. | **Konvergen** | Dihitung `exclusivityIndex` pada setiap subgrup di `snaEngine.ts`. |
| **#A-05** | Penataan tempat duduk cukup acak atau urut abjad. | Tempat duduk adalah intervensi spasial; wajib pisahkan mutual-dislike & pasangkan buddy. | **Konvergen** | Mesin heuristik penataan meja dibangun di `seatingEngine.ts`. |
| **#A-06** | Iklim kelas dihitung dari persentase pengisian angket. | Iklim kelas ditentukan kohesi jaringan & jumlah siswa rentan (Permendikbud 46/2023). | **Konvergen** | Formula indeks iklim kelas (0-100) diterapkan di `snaEngine.ts`. |
| **#A-07** | Data disimpan lokal/optimistik atau digabung dengan data seed awal saat sinkronisasi. | Merusak integritas antar-perangkat, memicu duplikasi lintas periode, serta menimpa unggahan BK. | **Telah Diperbaiki** | Cloud Firestore Single Source of Truth (`saveClassImportAsync`, `replaceScopedBatch` kueri tunggal, `firestore.rules` 13 koleksi). |
| **#A-08** | Catatan teknis konseling krisis dapat ditampilkan ke wali murid. | Melanggar etika ABKIN; menimbulkan kecemasan; wajib bahasa pengasuhan positif. | **Telah Diperbaiki** | Diganti dari `dssRecommendation` ke `parentNote` di `OrangTuaDashboard.tsx`. |

---

## 5. Lembar Verifikasi Sidang Viva Dosen

### Tanya Jawab Penguji Kritis (Viva Defense Q&A):

1. **Dosen Penguji**: *"Jelaskan mengapa Anda membagi perhitungan status sosiometri menjadi dua sumbu: Social Preference dan Social Impact, bukannya langsung memakai persentase pemilih?"*
   - **Jawaban Peneliti**: *"Jika hanya menggunakan persentase pemilih (popularitas satu dimensi), kita tidak akan pernah bisa membedakan antara siswa 'Rejected' (yang aktif ditolak) dengan siswa 'Neglected' (yang tidak disukai tetapi juga tidak dibenci, alias tidak terlihat/invisible). Dalam model Coie, Dodge, & Coppotelli (1982), Social Preference ($z_{SP} = z_L - z_D$) mengukur preferensi penerimaan, sedangkan Social Impact ($z_{SI} = z_L + z_D$) mengukur tingkat kehadiran sosial. Siswa Neglected memiliki impact sangat rendah ($z_{SI} < -1.0$) dengan $L \le \mu_L$, sedangkan siswa Rejected memiliki preference sangat negatif ($z_{SP} < -1.0$) dengan penolakan tinggi ($z_D > 0$). Intervensi BK untuk keduanya 180 derajat berbeda: siswa Rejected memerlukan perlindungan dari viktimisasi dan mediasi konflik, sedangkan siswa Neglected memerlukan pemupukan kepercayaan diri dan penugasan kooperatif."*

2. **Dosen Penguji**: *"Tunjukkan baris kode Algoritma Brandes pada berkas `snaEngine.ts`. Mengapa Anda menggunakan algoritma ini dan bagaimana kompleksitas komputasinya?"*
   - **Jawaban Peneliti**: *"Algoritma Brandes berada pada baris 509 hingga 576 berkas `src/services/snaEngine.ts`. Algoritma ini digunakan untuk menghitung Betweenness Centrality secara eksak dengan kompleksitas waktu $\mathcal{O}(|V| \cdot |E|)$, jauh lebih efisien dibandingkan Floyd-Warshall yang membutuhkan waktu $\mathcal{O}(|V|^3)$. Dalam konteks kelas beranggotakan 30-40 siswa, Brandes mengeksekusi traversal BFS dan akumulasi dependensi ke belakang dalam fraksi milidetik. Manfaat bimbingan konselingnya adalah menemukan siswa 'broker'—yaitu siswa yang memegang peran jembatan antar-kelompok tertutup (klik). Siswa broker inilah yang diberdayakan Guru BK sebagai agen perdamaian (peer mediator)."*

3. **Dosen Penguji**: *"Bagaimana algoritma Smart Seating Anda menjamin siswa korban perundungan tidak duduk bersebelahan dengan pelaku penolakan?"*
   - **Jawaban Peneliti**: *"Di berkas `src/services/seatingEngine.ts` baris 45-62 dan baris 128-133, fungsi `isCompatiblePair(id1, id2)` memeriksa himpunan pasangan penolakan (`dislikePairs`). Jika terdapat nominasi penolakan satu arah maupun dua arah antara dua siswa, fungsi mengembalikan nilai `false`, sehingga algoritma menolak penempatan keduanya di meja yang sama. Selanjutnya pada baris 137-181, siswa yang berstatus rentan (Passive Victim atau Neglected) diprioritaskan terlebih dahulu untuk dipasangkan dengan siswa berkategori 'Populer-Prososial' di baris depan (meja 1 dan 2) sebagai mitra belajar suportif (*buddy system*)."*

4. **Dosen Penguji**: *"Di mana letak koreksi paling mendasar yang Anda lakukan terhadap kode atau asumsi yang awalnya dibuat oleh AI?"*
   - **Jawaban Peneliti**: *"Terdapat tiga koreksi paling fundamental: Pertama, pada etika pelaporan ke orang tua (`OrangTuaDashboard.tsx` baris 167), AI awalnya menampilkan rekomendasi klinis teknis Guru BK ('Intervensi Konseling Krisis: Perlindungan psikologis segera') ke layar orang tua. Kami mengoreksinya agar menampilkan narasi `parentNote` yang berorientasi pengasuhan positif di rumah untuk mencegah histeria dan menyelaraskan dengan asas kode etik ABKIN. Kedua, pada level arsitektur multi-tenant & sinkronisasi Cloud (`ExcelUploadModal.tsx`, `dataStorage.ts`, `firestoreSync.ts`, `firestore.rules`), kami memastikan seluruh unggahan Excel menunggu komitmen Cloud Firestore (`saveClassImportAsync`) dengan penghapusan bersih berfilter tunggal (`replaceScopedBatch`), aturan keamanan 13 koleksi tervalidasi, serta menghilangkan injeksi ulang data dummy pada `syncFromCloud()` sehingga data Guru BK identik di semua perangkat. Ketiga, pada `snaEngine.ts` (baris 84-118, 272-356, dan 750-924), kami menambahkan zero-dislike Coie-Dodge guard, normalisasi densitas multi-kriteria, serta pemisahan komparatif Sosio-Instrumental (Belajar) vs Sosio-Afektif (Bermain) pada Sosiometri dan Laporan PDF Resmi (`OfficialPDFReport.tsx`)."*

### Checklist Kelulusan Audit Viva:
- [x] Minimal 8 anotasi kode riil dengan path berkas dan nomor baris persis.
- [x] Menguasai formula matematis skor Z, Coie-Dodge, dan matriks sentralitas graf.
- [x] Membuktikan minimal 2 titik di mana AI salah/dangkal dan berhasil dikoreksi oleh peneliti.
- [x] Memahami batasan kalkulasi psikometri pada populasi homogen atau kelas kecil ($N < 5$).
- [x] Mematuhi Kode Etik Kerahasiaan Bimbingan Konseling (ABKIN) dan regulasi TPPK Kemendikbudristek.

---

## 6. Prosedur Pemeliharaan Berkelanjutan Dokumen Audit (Maintenance Protocol)

> **Instruksi Tetap Pengembang & AI Assistant**:
> Dokumen `AUDIT_TWO_TRACK.md` ini wajib diperiksa dan diperbaharui secara berkala setiap kali terjadi perubahan mendasar pada:
> 1. Formula matematis skoring sosiometri atau ambang batas kategori di `/src/services/snaEngine.ts`.
> 2. Logika heuristik penataan tempat duduk di `/src/services/seatingEngine.ts`.
> 3. Skema penyimpanan data, hak akses, atau aturan keamanan di `firestore.rules`, `firebase-blueprint.json`, `/src/services/firestoreSync.ts`, dan `/src/services/dataStorage.ts`.
> 4. Komponen antarmuka peranan pengguna (khususnya privasi Dashboard Orang Tua dan Guru BK).
> 5. Penambahan instrumen atau kriteria nominasi baru dalam sistem.

---
*Dokumen ini diterbitkan secara resmi sebagai bukti otentisitas penguasaan algoritma (Program Comprehension) pada platform Radar Sosial.*
