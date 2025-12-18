# Post Data Manager - Frontend Documentation

Dokumentasi teknis untuk aplikasi Post Data Manager. Aplikasi ini dibangun menggunakan **Vue 3** dan **Tailwind CSS**.

## 🛠 Tech Stack & Libraries

Berikut adalah teknologi dan library utama yang digunakan dalam proyek ini:

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API via `<script setup>`)
- **Build Tool**: [Vite](https://vitejs.dev/) (Cepat & Ringan)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) (Utility-first CSS)
- **Routing**: [Vue Router 4](https://router.vuejs.org/)
- **State Management**: Vue Reactive (`ref`, `reactive`) & `stores/` pattern
- **HTTP Client**: [Axios](https://axios-http.com/) (dengan Interceptors untuk Token Auth)

### 📦 Key Libraries (3rd Party)

- **`lucide-vue-next`**: Koleksi icon SVG modern, bersih, dan ringan.
- **`@vuepic/vue-datepicker`**: Komponen input tanggal & range picker yang powerful.
- **`vue-chartjs` & `chart.js`**: Untuk visualisasi data grafik di Dashboard.
- **`date-fns`**: Utility untuk manipulasi dan format tanggal.
- **`vitest`**: Unit testing framework.

---

## 📂 Penjelasan Struktur Folder (`src/`)

Berikut adalah fungsi dari setiap direktori di dalam folder `src`:

### 1. `assets/`

Berisi file statis seperti gambar, font, dan file CSS global (`style.css`).

### 2. `components/`

Berisi komponen Vue yang **reusable** (dapat digunakan kembali di berbagai halaman).

- **`AlertDialog.vue`**: Modal notifikasi custom (pengganti `alert()` bawaan browser).
- **`ConfirmDialog.vue`**: Modal konfirmasi custom (pengganti `confirm()` bawaan browser).

### 3. `composables/`

Berisi logic/fungsi yang dapat dishare (Vue Composables / Hooks).

- **`useDialog.js`**: Mengatur state global untuk dialog (agar bisa dipanggil dari mana saja tanpa props drilling).

### 4. `services/`

Layer khusus untuk komunikasi dengan Backend API.

- **`api.js`**: Konfigurasi Axios centralized. Mengatur Base URL, Header, dan Auto-logout jika token expired (401).

### 5. `stores/`

Pusat manajemen state aplikasi (sederhana).

- **`auth.js`**: Mengelola status login user, token/session storage, dan fungsi login/logout/register.

### 6. `router/`

Konfigurasi navigasi halaman (URL mapping ke Component).

### 7. `Views` (Langsung di `src/`)

Halaman utama aplikasi:

- **`App.vue`**: Root component. Berisi Layout utama, Navbar, dan container Dialog global.
- **`main.js`**: Entry point aplikasi (mount Vue app).
- **`Login.vue`**: Halaman login user.
- **`Dashboard.vue`**: Halaman dashboard analitik dengan visualisasi data.
- **`Post.vue`**: Halaman manajemen data (CRUD) dengan tabel dan filter.

---

## ⚙️ Konfigurasi Root

File konfigurasi di root folder:

- **`.env`**: Menyimpan variabel environment (URL API, Nama App). **JANGAN dicommit ke git.**
- **`.env.example`**: Template konfigurasi (aman untuk dicommit).
- **`vite.config.js`**: Konfigurasi server Vite dan plugin (termasuk optimasi dependency).
- **`tailwind.config.js`**: Konfigurasi tema Tailwind (warna custom, font, plugin).

---

## 🚀 Cara Menjalankan Project

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Setup Environment**
   Salin file contoh env:

   ```bash
   cp .env.example .env
   ```

   Lalu edit `.env` sesuai kebutuhan (misal `VITE_API_URL`).

3. **Jalankan Mode Dev**

   ```bash
   npm run dev
   ```

   Akses di browser: `http://localhost:5173/`

4. **Build untuk Production**
   ```bash
   npm run build
   ```

## 🔐 Akun Demo (Default)

- **Email**: `admin@example.com`
- **Password**: `password`
