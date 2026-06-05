# WhatsApp Bot Platform

A complete, production-ready WhatsApp Bot Platform with advanced features including multi-account management, auto-reply, scheduled messages, anti-spam, analytics, and more.

## Features

### Core Features
- ✅ QR Code Login with Baileys
- ✅ Multi-Device Support
- ✅ Multi-Account Management
- ✅ Session Management & Auto-Reconnect
- ✅ Real-time WebSocket Connection

### Message Features
- ✅ Auto Reply System
- ✅ Welcome & Goodbye Messages
- ✅ Scheduled Messages
- ✅ Broadcast Messages
- ✅ Message Templates

### Safety Features
- ✅ Anti-Link Detection & Removal
- ✅ Anti-Spam System
- ✅ Content Moderation
- ✅ Rate Limiting

### Admin Features
- ✅ Group Moderation Tools
- ✅ Admin Management
- ✅ User Permissions
- ✅ Audit Logs

### Dashboard Features
- ✅ Analytics Dashboard
- ✅ Real-time Monitoring
- ✅ Activity Logs Viewer
- ✅ Connection Status
- ✅ Dark Mode UI
- ✅ Mobile Responsive

### API Features
- ✅ RESTful API
- ✅ JWT Authentication
- ✅ Rate Limiting
- ✅ API Key Management

## Tech Stack

### Backend
- Node.js
- Express.js
- Socket.IO
- Baileys (WhatsApp API)
- JWT Authentication
- SQLite & PostgreSQL
- Node-cron for Scheduling

### Frontend
- React.js
- Vite
- TailwindCSS
- Socket.IO Client
- Axios
- Chart.js
- React Query

### DevOps
- Docker & Docker Compose
- GitHub Actions CI/CD
- Railway Deployment
- Render Deployment

## Project Structure

```
├── backend/                 # Node.js Express Server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Custom middleware
│   │   ├── sockets/         # WebSocket handlers
│   │   └── utils/           # Utility functions
│   ├── migrations/          # Database migrations
│   └── data/                # Database files
├── frontend/                # React.js Dashboard
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── context/         # Context providers
│   │   ├── services/        # API & Socket services
│   │   └── utils/           # Utility functions
│   └── public/              # Static files
└── .github/workflows/       # CI/CD workflows
```

## Quick Start

### Prerequisites
- Node.js >= 16
- Docker & Docker Compose (optional)

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/MSLOADERSHOP/whatsapp-bot-platform.git
cd whatsapp-bot-platform
```

2. **Using Docker Compose (Recommended)**
```bash
docker-compose up -d
```

3. **Manual Setup**

**Backend:**
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## License

MIT License - see LICENSE file for details
