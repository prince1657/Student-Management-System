# EduPulse - Full-Stack Student Management System

A unified **Student Management System** combining the **Frontend** (4 Role-Based Portals for **Admin**, **Teacher**, **Student**, and **Parent**), **Backend** (Node.js & Express.js REST API), and **Database** (MongoDB with Mongoose models) inside a single **`System`** folder.

---

## 📂 Combined Folder Layout (`System`)

```
System/
├── package.json         # Unified project dependencies & scripts (start, seed)
├── server.js            # Express server (Serves both REST API & Static Frontend on port 5000)
├── seed.js              # MongoDB database seeder script
├── .env                 # Environment variables (PORT=5000, MONGO_URI, JWT_SECRET)
├── index.html           # Main HTML5 application entry point
├── css/
│   └── styles.css       # Glassmorphism design system & dark mode
├── js/
│   ├── api.js           # Hybrid REST API client
│   ├── app.js           # Navigation & view router
│   ├── auth.js          # Auth context & role switcher
│   ├── charts.js        # Dynamic SVG chart generator
│   ├── db.js            # Relational fallback database
│   ├── ui.js            # Modals & toast alerts
│   └── views/           # Admin, Teacher, Student, & Parent portal views
├── models/              # Mongoose schemas (User, Student, Teacher, Class, Fee, Notice, etc.)
├── controllers/         # Express API controllers
├── routes/              # Express API endpoints (/api/students, /api/fees, etc.)
└── middleware/          # JWT authentication middleware
```

---

## 🚀 How to Run

Inside the [System](file:///C:/Users/sachi/.gemini/antigravity/scratch/System) folder:

```bash
# 1. Install dependencies
npm install

# 2. Seed sample data into MongoDB
npm run seed

# 3. Start the application
npm start
```

Then open **`http://localhost:5000`** in your browser!
"# Student-Management-System" 
