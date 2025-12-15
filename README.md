# 📈 Stock Broker Client Web Dashboard

A real-time stock monitoring web dashboard that allows users to subscribe to selected stocks and view continuously updating prices without refreshing the page. The application demonstrates real-time UI updates, multi-user simulation, and modern frontend development practices.

## 🔍 Project Overview

The Stock Broker Client Web Dashboard is a web-based application designed to simulate real-time stock price updates for different users. Each user can log in, subscribe to supported stocks, and observe asynchronous price changes generated dynamically on the client side.

This project focuses on frontend real-time behavior, state management, UI responsiveness, and secure authentication, without relying on live market APIs.

## 🎯 Key Features

- User login using email authentication
- Subscribe to supported stock tickers:
  - GOOG
  - TSLA
  - AMZN
  - META
  - NVDA
- Real-time stock price updates (every second)
- Live UI updates without page refresh
- Multi-user support with independent subscriptions
- Asynchronous updates per active dashboard
- Clean, modern, and responsive user interface

## 🧠 Project Objectives

- Demonstrate real-time data handling on the client side
- Practice state management and component-based architecture
- Simulate stock market behavior using random price fluctuations
- Build an interview-ready full-stack project
- Understand asynchronous updates and UI reactivity

## 🛠️ Tech Stack

- Frontend: Next.js (React)
- Styling: CSS / Tailwind CSS
- State Management: React Hooks
- Backend: Supabase (PostgreSQL + Auth)
- Authentication: Supabase Auth
- Real-Time Logic: JavaScript Timers (`setInterval`)
- Deployment: Vercel

## ⚙️ How It Works

- User logs in using an email address
- User selects one or more supported stock tickers
- Subscriptions are stored securely in Supabase
- Stock prices update every second using a random price generator
- UI updates dynamically without page reload
- Multiple users can use the app simultaneously with independent data

## 🚀 Live Demo

Deployed Application:  
https://stock-broker-0j-sjgk.vercel.app/dashboard

## 🧩 Installation & Setup

### Clone the Repository
`
git clone https://github.com/OM-MUDDAPUR/stock-broker-dashboard.git
cd stock-broker-dashboard`


### Install Dependencies
`npm install`


### Environment Variables

Create a `.env.local` file and add:
`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url`
`NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`


### Run the Development Server
`npm run dev`


## 📂 Project Structure
`
src/
├── components/
│ ├── Login.jsx
│ ├── StockCard.jsx
│ └── Dashboard.jsx
├── utils/
│ └── priceGenerator.js
├── pages/
│ ├── index.js
│ └── dashboard.js
└── styles/
`


## 🧪 Limitations

- Uses simulated stock prices (no real market data)
- Real-time updates are timer-based, not WebSocket-based
- Portfolio analytics not implemented
- Designed intentionally without external stock APIs

## 🔮 Future Enhancements

- Integrate real stock APIs (Alpha Vantage / Yahoo Finance)
- WebSocket-based real-time updates
- Stock price history and charts
- Portfolio valuation and analytics
- Alerts and notifications
- Role-based user access

## 📚 Learning Outcomes

- Building real-time UIs using Next.js
- Secure authentication using Supabase
- Client–backend integration
- Managing asynchronous state updates
- Deploying full-stack apps on Vercel

## 👨‍💻 Author

Om Muddapur  
B.E. Computer Science Engineering  
Frontend & Full-Stack Development Enthusiast

## 📜 License

This project is developed for educational and demonstration purposes only.
