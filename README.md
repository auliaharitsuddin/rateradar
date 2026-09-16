# RateRadar

**Live demo:** https://auliaharitsuddin.github.io/rateradar/ (static build, fully functional — search, hotel pages, and the Pro dashboard all run on the same pricing logic as the live app)

A hotel-price meta-comparison web app for Indonesia. RateRadar shows the
final, all-in price of the same hotel room across multiple OTAs
(Booking.com, Agoda, Traveloka, tiket.com) side by side, so travelers don't
have to open four tabs to find out which one is actually cheapest — and
includes a companion **RateRadar Pro** dashboard for hoteliers to monitor
competitor pricing and rate-parity breaches.

## Functions

- **B2C metasearch**: search a city + dates + guests/rooms, and see every
  hotel's price normalized to a comparable all-in rate per room per night
  across all sources, with the cheapest one highlighted and the price
  spread shown.
- **Affiliate hand-off**: clicking a price redirects the user to the OTA's
  own site carrying an affiliate tag — RateRadar never takes payment or
  books on the user's behalf, it only refers.
- **B2B rate intelligence (RateRadar Pro)**: for a hotelier's own property,
  shows their ADR (average daily rate) trend per OTA over the last 30 days,
  how it compares to a competitive set of nearby same-star hotels, a price
  ranking, and automatic detection of **rate parity violations** (an OTA
  selling below the property's floor rate).

## All features

- **Home page** (`/`) — hero with a live "biggest price gap in Bali today"
  preview, a search form, an explanation of how the comparison works, a
  grid of the 4 monitored cities (with property counts), and a cross-sell
  into RateRadar Pro.
- **Search page** (`/search`) — full results list of hotels for a
  city/date/guest/room query, each with per-source price quotes.
- **Hotel detail page** (`/hotel/[id]`) — a single hotel's price history
  over time across sources.
- **RateRadar Pro dashboard** (`/pro`) — property picker, KPI tiles (your
  ADR, market ADR with delta, price rank, parity-issue count with
  trend), a multi-series trend chart of your rate across OTAs, a
  competitor rate table, and a rate-parity issue list (critical/warning
  severity).
- **API routes**:
  - `GET /api/search` — hotel search by `city`, `checkIn`, `checkOut`,
    `guests`, `rooms` (validates dates as `YYYY-MM-DD`, guests 1–20,
    rooms 1–10; returns 400/404 on bad input); response is cached
    (`Cache-Control: public, max-age=300, stale-while-revalidate=600`).
  - `GET /api/hotel/[id]` — a hotel's price history for a `days` window
    (7–90, default 30); cached for 10 minutes.
  - `GET /api/pro/[id]` — the RateRadar Pro summary payload for one
    property.
  - `GET /go/[source]` — affiliate redirect endpoint; builds the deep
    link for `booking`, `agoda`, `traveloka`, or `tiket` and 302-redirects
    the user, carrying the affiliate tag.
- **Data model**: 4 source adapters behind one interface
  (`lib/sources.ts`), each declaring whether it exposes a real price API
  or is deep-link/affiliate-only, and its tax display convention
  (inclusive/exclusive of the ~21% Indonesian hotel tax + service
  charge). Prices are deterministically simulated (seeded, not scraped
  live) across 4 cities — Bali, Jakarta, Bandung, Yogyakarta — covering
  tens of thousands of nominal properties per city in the seed data.
- **Reusable chart components**: `TrendChart` (multi-series line chart),
  `CompareBars`, `StatTile` (KPI card with delta), `CompetitorTable`,
  `PropertyPicker`, `SearchForm`, `ResultsList`, `HotelCard`.
- **Indonesian/English language toggle** (`lib/language.tsx`, `messages/`)
  in the header, persisted in `localStorage`. Covers the nav, footer, demo
  banner, and the home page. The Search, Hotel detail, and Pro dashboard
  pages don't read from it yet and still show Indonesian text regardless
  of the toggle.

## Terminology

| Term | Meaning |
|---|---|
| ADR | Average Daily Rate — the average price per room per night over a given window. |
| Rate parity | The expectation that a hotel's price is the same everywhere it's sold; a "parity issue" is an OTA selling below the property's own floor rate. |
| Floor rate | The minimum price a property has agreed a room should never be sold below. |
| Spread | The Rupiah (and %) difference between the cheapest and most expensive quote for the same room across sources. |
| Source / OTA | One of the online travel agencies compared: Booking.com, Agoda, Traveloka, tiket.com. |
| Deep link vs. price API | Some OTAs (Traveloka, tiket.com in this app) are affiliate deep-link only — no comparable price is fetched, just a referral link; others (Booking.com, Agoda) simulate a real price-API quote. |
| Competitive set | The group of nearby, similarly-starred hotels a property is benchmarked against in RateRadar Pro. |

## How to use

Requires [Node.js](https://nodejs.org/) 20+.

```bash
npm install
npm run dev      # start the dev server at http://localhost:3000
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint
```

No environment variables or API keys are required — all hotel/price data
in this app is deterministically simulated (`lib/seed.ts`, `lib/pricing.ts`),
not fetched from any live external API.

- Home: `http://localhost:3000/`
- Search: `http://localhost:3000/search?city=Bali`
- RateRadar Pro: `http://localhost:3000/pro`

---

## Bahasa Indonesia

**Demo live:** https://auliaharitsuddin.github.io/rateradar/ (versi statis, berfungsi penuh — pencarian, halaman hotel, dan dashboard Pro semuanya berjalan dengan logika harga yang sama seperti aplikasi live)

Aplikasi web pembanding harga hotel untuk Indonesia. RateRadar menampilkan
harga akhir (all-in) dari kamar hotel yang sama di berbagai OTA
(Booking.com, Agoda, Traveloka, tiket.com) secara berdampingan, sehingga
wisatawan tidak perlu membuka empat tab untuk mengetahui mana yang benar-
benar termurah — dan dilengkapi dashboard pendamping **RateRadar Pro** bagi
pemilik hotel untuk memantau harga kompetitor dan pelanggaran rate parity.

## Fungsi

- **Metasearch B2C**: cari berdasarkan kota + tanggal + jumlah
  tamu/kamar, dan lihat harga tiap hotel yang sudah dinormalkan menjadi
  harga all-in per kamar per malam yang bisa dibandingkan lintas sumber,
  dengan yang termurah disorot dan selisih harga ditampilkan.
- **Hand-off afiliasi**: klik harga akan mengarahkan pengguna ke situs OTA
  itu sendiri dengan tag afiliasi — RateRadar tidak pernah menerima
  pembayaran atau memesan atas nama pengguna, hanya mereferensikan.
- **Rate intelligence B2B (RateRadar Pro)**: untuk properti milik hoteliers
  sendiri, menampilkan tren ADR (rata-rata harga harian) per OTA selama
  30 hari terakhir, perbandingan dengan competitive set hotel sekitar
  yang setara bintangnya, peringkat harga, dan deteksi otomatis
  **pelanggaran rate parity** (OTA menjual di bawah harga dasar properti).

## Semua fitur

- **Halaman Home** (`/`) — hero dengan preview live "selisih harga terbesar
  di Bali hari ini", form pencarian, penjelasan cara kerja perbandingan,
  grid 4 kota yang dipantau (dengan jumlah properti), dan cross-sell ke
  RateRadar Pro.
- **Halaman Search** (`/search`) — daftar hasil lengkap hotel untuk query
  kota/tanggal/tamu/kamar, masing-masing dengan kutipan harga per sumber.
- **Halaman detail hotel** (`/hotel/[id]`) — riwayat harga satu hotel dari
  waktu ke waktu lintas sumber.
- **Dashboard RateRadar Pro** (`/pro`) — pemilih properti, kartu KPI (ADR
  Anda, ADR pasar dengan delta, peringkat harga, jumlah pelanggaran
  parity dengan tren), grafik tren multi-seri harga Anda lintas OTA,
  tabel harga kompetitor, dan daftar isu rate parity (severity
  kritis/perhatian).
- **API routes**:
  - `GET /api/search` — pencarian hotel berdasarkan `city`, `checkIn`,
    `checkOut`, `guests`, `rooms` (validasi tanggal format `YYYY-MM-DD`,
    guests 1–20, rooms 1–10; mengembalikan 400/404 untuk input tidak
    valid); response di-cache
    (`Cache-Control: public, max-age=300, stale-while-revalidate=600`).
  - `GET /api/hotel/[id]` — riwayat harga hotel untuk rentang `days`
    (7–90, default 30); di-cache 10 menit.
  - `GET /api/pro/[id]` — payload ringkasan RateRadar Pro untuk satu
    properti.
  - `GET /go/[source]` — endpoint redirect afiliasi; membangun deep link
    untuk `booking`, `agoda`, `traveloka`, atau `tiket` dan me-redirect
    302 pengguna dengan membawa tag afiliasi.
- **Model data**: 4 adapter sumber di balik satu interface
  (`lib/sources.ts`), masing-masing menyatakan apakah menyediakan price
  API sungguhan atau hanya deep-link/afiliasi, dan konvensi tampilan
  pajaknya (termasuk/tidak termasuk pajak hotel + service charge
  Indonesia ~21%). Harga disimulasikan secara deterministik (dari seed,
  bukan scraping live) di 4 kota — Bali, Jakarta, Bandung, Yogyakarta —
  mencakup puluhan ribu properti nominal per kota dalam data seed.
- **Komponen chart yang dapat dipakai ulang**: `TrendChart` (grafik garis
  multi-seri), `CompareBars`, `StatTile` (kartu KPI dengan delta),
  `CompetitorTable`, `PropertyPicker`, `SearchForm`, `ResultsList`,
  `HotelCard`.
- **Toggle bahasa Indonesia/Inggris** (`lib/language.tsx`, `messages/`) di
  header, tersimpan di `localStorage`. Mencakup nav, footer, banner demo,
  dan halaman beranda. Halaman Search, Detail Hotel, dan dashboard Pro
  belum membaca setting ini dan masih tampil dalam Bahasa Indonesia apa
  pun pilihan togglenya.

## Istilah

| Istilah | Arti |
|---|---|
| ADR | Average Daily Rate — rata-rata harga per kamar per malam dalam suatu rentang waktu. |
| Rate parity | Ekspektasi bahwa harga hotel sama di mana pun dijual; "pelanggaran parity" berarti sebuah OTA menjual di bawah harga dasar properti. |
| Floor rate (harga dasar) | Harga minimum yang disepakati properti agar kamar tidak dijual di bawahnya. |
| Spread (selisih) | Selisih Rupiah (dan %) antara kutipan termurah dan termahal untuk kamar yang sama lintas sumber. |
| Source / OTA | Salah satu agen perjalanan online yang dibandingkan: Booking.com, Agoda, Traveloka, tiket.com. |
| Deep link vs. price API | Sebagian OTA (Traveloka, tiket.com di aplikasi ini) hanya afiliasi deep-link — tidak ada harga yang bisa dibandingkan, hanya tautan referral; lainnya (Booking.com, Agoda) mensimulasikan kutipan price-API sungguhan. |
| Competitive set | Kelompok hotel terdekat dengan bintang serupa yang menjadi acuan pembanding properti di RateRadar Pro. |

## Cara menggunakan

Membutuhkan [Node.js](https://nodejs.org/) 20+.

```bash
npm install
npm run dev      # jalankan dev server di http://localhost:3000
npm run build    # build produksi
npm run start    # jalankan hasil build produksi
npm run lint     # eslint
```

Tidak diperlukan environment variable atau API key — semua data
hotel/harga di aplikasi ini disimulasikan secara deterministik
(`lib/seed.ts`, `lib/pricing.ts`), bukan diambil dari API eksternal live.

- Home: `http://localhost:3000/`
- Search: `http://localhost:3000/search?city=Bali`
- RateRadar Pro: `http://localhost:3000/pro`
