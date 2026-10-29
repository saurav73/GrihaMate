# GrihaMate

A room rental platform for Nepal that connects verified landlords with seekers. Users verify with citizenship/KYC documents, browse property listings, and pay rent through integrated payment gateways. An admin panel handles verifications.

Live stack: **Spring Boot backend** + **React frontend**.

## Features

- **Three roles** — SEEKER (browse & rent), LANDLORD (list & manage properties), ADMIN (verify users, manage properties)
- **Verification system** — seekers verify with citizenship; landlords with KYC + property documents
- **Property listings** — CRUD, detail pages, premium listings
- **Payments** — eSewa integration + Stripe card-payment endpoints (`/stripe/initiate`, `/stripe/process` in `PaymentController`)
- **AI features** — natural-language property search (text input, optional voice) powered by Gemini (see `griha-mate-react/AI_FEATURES.md`)
- **Uploads** — Cloudinary for property images and verification documents
- **Auth** — JWT, email verification with resend

## Structure

| Path | What it is |
|---|---|
| `griha-mate-backend/` | Spring Boot 3.2.0 / Java 17 API (JWT, MySQL, Cloudinary, eSewa) |
| `griha-mate-react/` | React 19 + Vite 7 frontend |
| `griha-mate-react/.env.example` | Frontend env template (`VITE_API_URL`, numbered `VITE_GEMINI_API_KEY_1/2/3` plus the legacy `VITE_GEMINI_API_KEY` fallback) — copy to `.env.local` |
| `DOCUMENTATION.md` | Full platform documentation |
| `COMPLETION_STATUS.md` | Build completion status |
| `IMPLEMENTATION_SUMMARY.md` | Implementation notes |
| `REACT_MIGRATION_SUMMARY.md` | React migration notes |
| `CHANGELOG.md` | Dated build history |

## Setup

**Backend** (runs on `http://localhost:8081`):
```bash
cd griha-mate-backend
# configure MySQL, JWT secret, Cloudinary, eSewa, Gmail SMTP in application.properties
mvn spring-boot:run
```

**Frontend**:
```bash
cd griha-mate-react
npm install
# copy .env.example to .env.local and set VITE_API_URL=http://localhost:8081/api
npm run dev
```

## Docs

Start with `DOCUMENTATION.md` — it covers every feature, role, and setup step.
