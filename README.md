# StockTracker Pro - Stock Broker Dashboard

A real-time stock monitoring dashboard that allows users to subscribe to and track their favorite stocks.

## Features

- **User Authentication**: Secure email/password authentication with Supabase
- **Stock Subscriptions**: Subscribe to up to 5 supported stocks (GOOG, TSLA, AMZN, META, NVDA)
- **Real-time Updates**: Stock prices update every second without page refresh
- **Multi-user Support**: Multiple users can have different subscriptions updating independently
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js (React)
- **Styling**: CSS / Tailwind CSS
- **State Management**: React Hooks
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time Logic**: JavaScript (`setInterval`)
- **Deployment**: Vercel

## Setup

- **Database Setup**:
  - Run the SQL scripts in the `scripts` folder
  - `001_create_subscriptions_table.sql` – Creates the subscriptions table
  - `002_auto_confirm_users.sql` – Auto-confirms new users (development only)

- **Environment Configuration**:
  - Create a `.env.local` file
  - Add:
    ```
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

- **Install Dependencies**:
 - `npm install`

- **Run the Application**:
 - `npm run dev`

- **Sign Up**:
- Create an account using email and password

- **Start Trading**:
- Subscribe to stocks and watch prices update in real time

## Supported Stocks

- GOOG (Google)
- TSLA (Tesla)
- AMZN (Amazon)
- META (Meta)
- NVDA (NVIDIA)

## Development Note

- Stock prices are simulated and update every second with random fluctuations (±2%)
- No real stock market API is used

## Security

- Row Level Security (RLS) enabled on the subscriptions table
- Users can only view and manage their own subscriptions
- Authentication handled securely by Supabase
