# InsureVision MERN Stack

A full-stack insurance management application built with MERN (MongoDB, Express, React, Node.js).

## Project Structure

```
InsureVision3/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── assets/          # Static files
│   │   ├── components/      # Reusable components
│   │   ├── controllers/     # Custom hooks and logic
│   │   ├── models/          # Data models/types
│   │   ├── services/        # API communication
│   │   ├── utils/           # Utility functions
│   │   ├── views/           # Page components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                 # Environment variables
│   └── package.json
│
└── backend/                  # Express + Node.js API
    ├── config/              # Configuration files
    ├── controllers/         # Route handlers
    ├── middleware/          # Custom middleware
    ├── models/              # Database models
    ├── routes/              # API routes
    ├── utils/               # Utility functions
    ├── .env                 # Environment variables
    ├── server.js            # Main server file
    └── package.json
```

## Getting Started

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/insurevision
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## API Structure

- All API endpoints are prefixed with `/api`
- Test endpoint: `GET /api/test`

## Next Steps

1. **Models**: Define your MongoDB schemas in `backend/models/`
2. **Controllers**: Create route handlers in `backend/controllers/`
3. **Routes**: Add API routes in `backend/routes/`
4. **Views**: Create page components in `frontend/src/views/`
5. **Services**: Add API calls in `frontend/src/services/`

## Tech Stack

- **Frontend**: React 18, Vite, Fetch API
- **Backend**: Express.js, Node.js
- **Database**: MongoDB
- **Architecture**: MVC Pattern

Ready to start coding! 🚀
