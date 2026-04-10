<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  <strong>NestJS Auth Starter</strong><br />
  A clean and scalable RESTful API starter for Authentication & Authorization.
</p>

<p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
</p>

## Description

Repository ini adalah **RESTful API Starter** yang dibangun dengan [Nest](https://github.com/nestjs/nest) framework. Project ini dirancang khusus untuk mempercepat proses pembuatan sistem autentikasi, mencakup:

- **JWT Authentication** (Access Token & Refresh Token).
- **User Management** (Registration, Login, Profile).
- **Role-based Access Control (RBAC)**.
- **Database Integration** (Sudah siap dihubungkan dengan ORM pilihanmu).

---

## Project Setup

Pastikan Anda sudah menginstal Node.js dan npm di mesin lokal Anda.

```bash
# Clone repository ini
$ git clone <url-repo-anda>

# Masuk ke folder project
$ cd <nama-folder>

# Install dependensi
$ npm install
```

## Running the App

Sebelum menjalankan, pastikan Anda telah menyalin file .env.example menjadi .env dan mengisi variabel yang diperlukan (seperti JWT_SECRET)

```bash
# development mode
$ npm run start

# watch mode (recomended for development)
$ npm run start:dev

# production mode
$ npm run start:prod
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
