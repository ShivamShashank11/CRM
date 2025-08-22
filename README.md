# 🚀 Mini CRM System

A modern CRM (Customer Relationship Management) system built with **React.js, Node.js, Express, and MySQL**.  
This project allows you to manage **Companies, Contacts, Deals, and Activities** with authentication support.

---

## 📂 Project Structure

D:\CRM
│── backend\ # Express + MySQL API
│ ├── config\ # DB connection
│ ├── routes\ # API routes (auth, companies, contacts, deals, activities)
│ ├── controllers\ # Logic for each module
│ └── server.js # Entry point
│
│── frontend\ # React + Vite + Tailwind frontend
│ ├── src
│ │ ├── pages\ # Dashboard, Companies, Contacts, Deals, Activities, Auth
│ │ ├── lib\ # api.js (API integration)
│ │ └── App.jsx # Routing + Layout
│ └── vite.config.js
│
└── README.md

---

## ⚡ Features

- 🔐 **Authentication** – Register & Login system with JWT
- 🏢 **Companies** – Add, view, update, and delete companies
- 👤 **Contacts** – Manage contacts with company associations
- 📊 **Deals** – Pipeline management with stages (New, Qualified, Proposal, Won, Lost)
- 📝 **Activities** – Track tasks, meetings, and actions
- 📱 **Responsive UI** – Works on **Mobile, Tablet, and Desktop**
- 🎨 **Modern Design** – Tailwind CSS + custom styling

---

## 🛠️ Tech Stack

**Frontend:** React.js (Vite), Tailwind CSS  
**Backend:** Node.js, Express.js  
**Database:** MySQL  
**Authentication:** JWT (JSON Web Token)

---

## 🚀 Getting Started

### 1️⃣ Clone Repository

```bash
git clone https://github.com/ShivamShashank11/CRM.git
cd CRM
2️⃣ Backend Setup

cd backend
npm install
npm run dev
Server runs on: http://localhost:5000

3️⃣ Frontend Setup

cd ../frontend
npm install
npm run dev
Frontend runs on: http://localhost:5173

🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

📧 Contact
👤 Shivam Shashank
📩 Email: shivamshashank961@gmail.com
```
