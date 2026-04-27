# Voyagers Tribute — Maritime Supply Chain Intelligence Platform

> Google Solution Challenge 2026

A real-time maritime supply chain intelligence platform that tracks global shipments, detects disruptions, and provides AI-powered recommendations powered by Google Gemini 2.0 Flash.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 · React 18 · TypeScript · Tailwind CSS · Framer Motion |
| Backend | Node.js · Express · TypeScript · WebSocket |
| Database | PostgreSQL 16 |
| Maps | Mapbox GL JS |
| AI | Google Gemini 2.0 Flash |
| Auth | JWT · bcrypt |

## 🎨 Design

Dark neon theme with cyan (#00d4ff) and magenta (#ff006e) accents on a deep navy background (#0a0e27).

## 📁 Project Structure

```
├── backend/          Express + TypeScript API (port 3001)
│   ├── src/
│   │   ├── controllers/   (auth, shipments, disruptions, recommendations, simulation)
│   │   ├── services/      (Gemini AI, simulation engine)
│   │   ├── routes/
│   │   ├── middleware/    (JWT auth, error handler)
│   │   └── websocket/     (real-time updates)
│   ├── migrations/   (PostgreSQL schema)
│   └── seeds/        (mock data: 10 ports, 11 users, 3 vessels, 3 shipments)
├── frontend/         Next.js 14 App Router (port 3000)
│   └── src/
│       ├── app/      (login, dashboard, shipments, captain report)
│       ├── components/
│       └── hooks/    (useAuth, useWebSocket, useSimulation)
└── docker-compose.yml  (PostgreSQL)
```

## ⚡ Quick Start

### 1. Start the database
```bash
docker-compose up -d
```

### 2. Configure environment
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Edit both files with your API keys
```

### 3. Backend
```bash
cd backend
npm install
npm run seed     # Load demo data
npm run dev      # Starts on :3001
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev      # Starts on :3000
```

## 🔑 Demo Credentials (all use `password123`)

| Role | Email |
|------|-------|
| Buyer | import@globaltrade.com |
| Seller | export@shanghaiexports.com |
| Captain | capt.zhang@vessel1.com |

## 🗂 API Endpoints

- `POST /api/auth/login` — Login
- `GET  /api/shipments` — List shipments
- `GET  /api/shipments/:id` — Shipment detail
- `GET  /api/disruptions?shipment_id=` — Disruptions
- `GET  /api/recommendations?shipment_id=` — AI Recommendations
- `PUT  /api/recommendations/:id/approve` — Approve recommendation
- `POST /api/captain-reports` — Submit captain report (triggers Gemini)
- `POST /api/simulation/:id/advance` — Advance simulation
- `GET  /api/ports` — All 10 global ports
- `WS   ws://localhost:3001?token=JWT` — Real-time updates

## 🌍 Global Ports

Shanghai · Rotterdam · Singapore · Dubai · Los Angeles · Hamburg · Hong Kong · Port Said · Mumbai · Sydney

## 📊 Demo Shipments

| ID | Route | Status |
|----|-------|--------|
| SHIP-2026-001 | Shanghai → Rotterdam | IN_TRANSIT (60%) |
| SHIP-2026-002 | Dubai → Los Angeles | DELAYED (30%) |
| SHIP-2026-003 | Singapore → Hong Kong | DELIVERED (100%) |
Maritime Supply Chain Intelligence Platform : Real-time maritime visibility. Global shipments, unified control.
