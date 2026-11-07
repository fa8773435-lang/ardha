# Birthday Letter for Mas Ardha 🤎

Website ulang tahun digital dengan 8 scene interaktif: opening dengan kucing & efek hati, permainan tanggal, foto, ucapan, cerita jarak Jepang–Kediri, tiga alasan, kalender November 2001 (tanggal 7 berbentuk hati), dan surat penutup.

## Struktur proyek

```text
birthday-letter-mas-ardha/
├── index.html
├── style.css
├── script.js
├── assets/
│   ├── ardha-photo.jpg
│   └── birthday-music.mp3
└── fallback/                (cadangan otomatis, jangan dihapus)
    ├── photo-fallback.js
    └── music-fallback.js
```

## Menjalankan website
1. Ekstrak zip, lalu buka folder `birthday-letter-mas-ardha` yang **langsung berisi `index.html`**.
2. Buka folder itu di VS Code → klik kanan `index.html` → **Open with Live Server**.
   (Bisa juga langsung klik dua kali `index.html`.)
3. Klik **Mulai kejutan** — musik menyala otomatis setelah klik pertama (aturan browser). Tombol ♫ di kanan atas untuk mematikan/menyalakan.

## Foto & musik selalu bisa diakses
- Foto dan musik dimuat dari `assets/`. Jika gagal, script mencoba lokasi lain, lalu otomatis memakai cadangan di folder `fallback/` (foto & musik tertanam), jadi tetap tampil walau struktur folder berubah.
- Mengganti foto/musik: timpa `assets/ardha-photo.jpg` / `assets/birthday-music.mp3`. Jika ingin cadangannya ikut berubah, hapus folder `fallback/` (script tetap berjalan normal selama `assets/` benar).

## Efek hati, kucing & animasi
- **Halaman 1:** kucing bertopi ulang tahun berukuran besar di sisi kanan. Pupilnya mengikuti kursor, ia berkedip, ekornya bergoyang, sesekali mengeluarkan hati kecil, dan melompat kalau diklik (sambil menyapa lewat gelembung ucapan).
- **Animasi masuk tiap halaman** (halus, berurutan): judul muncul kata per kata, kartu naik pelan, foto "mendarat" lalu berkilau sekali, rute peta tergambar, kartu alasan muncul bergantian, hati tanggal 7 muncul dengan cincin ajakan klik, dan bunga di halaman penutup tumbuh lalu mekar.
- **Hati:** melayang di setiap halaman (jumlah & arah berbeda), berhamburan saat tombol mulai, kunci terbuka, klik tanggal 7, dan halaman penutup. Di peta, hati berjalan dari Kediri ke Jepang.
- Animasi otomatis dikurangi/dimatikan untuk pengguna yang mengaktifkan "reduce motion".

## Catatan teknis
- Kunci permainan yang benar adalah `151225`.
- 7 November 2001 jatuh pada hari Rabu.
- Google Fonts memerlukan internet; tersedia font cadangan jika offline.
- Untuk publikasi, unggah seluruh folder ke GitHub Pages atau Netlify.
