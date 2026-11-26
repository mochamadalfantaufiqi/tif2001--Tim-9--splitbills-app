# Splitbill API Specification (v1)

Base URL: `/api/v1`
Auth: header `Authorization: Bearer <token>` (JWT, berlaku 24 jam)
Semua nominal uang = **bilangan bulat rupiah**. Semua field JSON memakai camelCase.

## Format Respons

Sukses:

```json
{ "success": true, "message": "...", "data": {}, "meta": {} }
```

Galat:

```json
{
  "success": false,
  "message": "...",
  "errors": [{ "field": "email", "message": "Format email tidak valid" }]
}
```

| Kode | Arti |
|------|------|
| 200 / 201 | Sukses |
| 400 | Validasi gagal |
| 401 | Belum login / token salah atau kedaluwarsa |
| 403 | Bukan pemilik sumber daya |
| 404 | Tidak ditemukan |
| 409 | Duplikat (email / nama peserta) |
| 422 | Aturan bisnis dilanggar |
| 502 | Gagal ke layanan eksternal (storage) |

---

## 1. Auth

### POST `/auth/register` (tanpa auth)

Request:

```json
{ "name": "Andi", "email": "andi@mail.com", "password": "rahasia123" }
```

Sukses `201`:

```json
{ "success": true, "message": "Registrasi berhasil",
  "data": { "id": "uuid", "name": "Andi", "email": "andi@mail.com" } }
```

Galat: `400` validasi, `409` email sudah terdaftar. Field `password` tidak pernah dikembalikan.

### POST `/auth/login` (tanpa auth)

Request:

```json
{ "email": "andi@mail.com", "password": "rahasia123" }
```

Sukses `200`:

```json
{ "success": true, "message": "Login berhasil",
  "data": { "token": "<jwt>", "user": { "id": "uuid", "name": "Andi", "email": "andi@mail.com", "role": "user" } } }
```

Galat: `400` validasi, `401` "Email atau kata sandi salah" (pesan sama untuk email salah maupun sandi salah).
Rate limit: maks 10 percobaan / 15 menit / IP.

### GET `/auth/me` (auth)

Sukses `200`:

```json
{ "success": true, "data": { "id": "uuid", "name": "Andi", "email": "andi@mail.com", "role": "user" } }
```

Galat: `401`.

---

## 2. Bills

### GET `/bills` (auth)

Query: `search` (ILIKE judul/kafe), `status` (`draft|finalized`), `page` (min 1, default 1), `limit` (1-50, default 10).

Sukses `200`:

```json
{ "success": true,
  "data": [ { "id": "uuid", "title": "Makan Malam", "venueName": "Kafe A", "billDate": "2026-09-01", "status": "draft", "createdAt": "..." } ],
  "meta": { "totalRows": 25, "totalPages": 3, "currentPage": 1 } }
```

Galat: `400`, `401`.

### POST `/bills` (auth)

Request:

```json
{ "title": "Makan Malam", "venueName": "Kafe A", "billDate": "2026-09-01",
  "taxMode": "percent", "taxValue": 10,
  "serviceMode": "percent", "serviceValue": 0, "serviceSplit": "proportional" }
```

Sukses `201`: detail tagihan. Galat: `400`, `401`.

### GET `/bills/:id` (auth, hanya pemilik)

Sukses `200`: tagihan + `participants[]` + `items[]` (setiap item memuat `assigneeIds[]`).
Galat: `401`, `403`, `404`.

### PUT `/bills/:id` (auth, hanya pemilik)

Request: field boleh sebagian. Sukses `200`.
Galat: `400`, `403`, `404`, `422` jika tagihan sudah `finalized`.

### DELETE `/bills/:id` (auth, hanya pemilik)

Sukses `200`. Galat: `403`, `404`.

### POST `/bills/:id/receipt` (auth, hanya pemilik)

`multipart/form-data`, field `receipt` (jpeg/png/webp, maks 2 MB).

Sukses `200`:

```json
{ "success": true, "data": { "receiptUrl": "https://..." } }
```

Galat: `400` tipe/ukuran salah, `403`, `404`, `502`.

### POST `/bills/:id/finalize` (auth, hanya pemilik)

Mengunci tagihan dan membuat `shareCode`.
Sukses `200`: `{ "data": { "shareCode": "abc123xyz" } }`. Galat: `403`, `404`, `422` tidak valid (mis. belum ada peserta/item).

---

## 3. Participants

### POST `/bills/:billId/participants` (auth)

Request: `{ "name": "Budi" }`. Sukses `201`. Galat: `400`, `403`, `404`, `409` nama kembar dalam satu tagihan.

### PATCH `/participants/:id` (auth)

Request: `{ "name": "Budi S." }`. Sukses `200`. Galat: `400`, `403`, `404`, `409`.

### DELETE `/participants/:id` (auth)

Sukses `200`. Galat: `403`, `404`.

---

## 4. Items

### POST `/bills/:billId/items` (auth)

Request:

```json
{ "name": "Pizza", "price": 60000, "qty": 1, "assigneeIds": ["p1", "p2"] }
```

Sukses `201`. Galat: `400`, `403`, `404`, `422` jika `assigneeIds` kosong atau bukan peserta tagihan ini.

### PUT `/items/:id` (auth)

Request: sama seperti POST (boleh sebagian). Sukses `200`. Galat: `400`, `403`, `404`, `422`.

### DELETE `/items/:id` (auth)

Sukses `200`. Galat: `403`, `404`.

---

## 5. Summary (sumber kebenaran angka)

### GET `/bills/:id/summary` (auth)

Pajak dibagi **rata** ke semua peserta. Sisa pembulatan dibagi 1 rupiah per orang mengikuti `sort_order`. Invarian: jumlah `total` semua orang = `grandTotal`.

Sukses `200`:

```json
{
  "success": true,
  "data": {
    "subtotal": 80000, "taxTotal": 8000, "serviceTotal": 0, "grandTotal": 88000,
    "taxRule": "equal",
    "perPerson": [
      { "participantId": "p1", "name": "Andi", "subtotal": 40000, "tax": 2667, "service": 0, "total": 42667 },
      { "participantId": "p2", "name": "Budi", "subtotal": 25000, "tax": 2667, "service": 0, "total": 27667 },
      { "participantId": "p3", "name": "Cici", "subtotal": 15000, "tax": 2666, "service": 0, "total": 17666 }
    ]
  }
}
```

Galat: `401`, `403`, `404`, `422` belum ada peserta.

---

## 6. Public (read-only)

### GET `/public/bills/:shareCode` (tanpa auth)

Sukses `200`: tampilan read-only (tanpa email pemilik). Galat: `404`.

---

## 7. Dashboard

### GET `/dashboard/stats` (auth)

Sukses `200`:

```json
{ "success": true,
  "data": { "totalBills": 5, "totalSpending": 450000, "totalTaxSplit": 45000, "recent": [] } }
```

Galat: `401`.
