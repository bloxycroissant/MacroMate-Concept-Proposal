# 🥗 MacroMate — Web-Based Lifestyle Tracker

> **SDG 3: Good Health and Well-Being**  
> *"Small steps matter. Your healthy rhythm grows one day at a time."*

---

## 📌 Project Overview

**MacroMate** is an intuitive, web-based lifestyle and nutrition tracking application built to promote long-term wellness and healthy habit formation. The name **MacroMate** combines **"Macro"** (referring to essential macronutrients: Calories, Protein, Carbohydrates, and Fats) with **"Mate"** (representing a supportive, non-judgmental digital companion).

Designed with accessibility and ease-of-use at its core, MacroMate allows users to easily log meals, track health check-ins (water intake, mood, energy, sleep), customize daily goals, and observe visual progress over time.

---

## 🎯 Alignment with UN SDG 3

MacroMate directly supports **UN Sustainable Development Goal 3 (Good Health and Well-Being)** by:
- **Encouraging Preventative Health Care:** Providing accessible daily tracking for nutrition, hydration, mood, and sleep.
- **Fostering Sustainable Habits:** Prioritizing gradual progress and positive reinforcement over strict, overwhelming diets.
- **Ensuring Universal Accessibility:** Featuring high-contrast modes, reduced motion toggles, and enhanced focus states for users of all abilities.

---

## ✨ Key Features

- 📓 **Daily & Overall Food Journal:** Categorized meal tracking (Breakfast, Lunch, Dinner, Snacks) with immediate macro updates.
- 🩺 **Health Journal:** Track mood scores, energy levels, sleep duration, and daily water intake in glasses.
- 🎯 **Custom Goal Checklists:** Set daily target macros and flexible checklist items (e.g., activity targets, reflections).
- 📊 **Weekly Progress Visualizations:** Interactive SVG charts mapping 7-day calorie trends against daily goals.
- ♿ **Inclusive Accessibility Suite:** Custom UI preferences including high-contrast mode, reduced motion, and enhanced focus indicators.
- 🔄 **Real-Time Synchronized State:** Instant topbar profile and avatar updates across all screens without reloading.
- ⚡ **Offline Resilience:** Local storage fallback mechanism ensures goal data persists cleanly even during backend migrations or offline state.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React.js (Vite)
- **Styling & Icons:** CSS3 (Custom Variables, Flexbox/Grid, Keyframe Animations), FontAwesome 6
- **Backend & Authentication:** Supabase Cloud (PostgreSQL database, RLS policies, Auth Context)
- **State & Storage:** React Hooks (`useState`, `useMemo`, `useEffect`), Browser `localStorage` / `sessionStorage` fallback
- **Version Control:** Git & GitHub

---

## 📁 Project Structure

```text
Frontend/
├── public/
│   └── assets/           # MacroMate logos, icons, and graphic assets
├── src/
│   ├── components/       # Reusable UI components (FoodEntryForm, Modals, etc.)
│   ├── hooks/            # Custom hooks (useFoodEntries, useWellness)
│   ├── pages/            # Page views (Overview, FoodJournal, HealthJournal, Profile, Accessibility, etc.)
│   ├── supabase/         # Supabase client configuration & auth context
│   ├── utils/            # Utility helpers (date formatters, shift dates)
│   ├── App.jsx           # Main application hub & router logic
│   ├── App.css           # Global layout & keyframe animations
│   └── main.jsx          # Application entry point
├── supabase/
│   └── migrations/       # SQL schema migration scripts
├── package.json          # Dependency configurations
└── README.md             # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.0 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bloxycroissant/MacroMate-Concept-Proposal.git
   cd MacroMate-Concept-Proposal/Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root of your `Frontend` folder and supply your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser to view the app.

---

## 🗄️ Database Schema & Migrations

If setting up your own Supabase instance, execute the SQL migration script located at `supabase/migrations/202611020003_customize_daily_checklist_goals.sql` in your **Supabase SQL Editor**:

```sql
-- Remove legacy check constraints to enable custom user goals
ALTER TABLE daily_checkins 
DROP CONSTRAINT IF EXISTS daily_checkins_completed_goals_check;

-- Add JSONB support for custom checklist goals
ALTER TABLE daily_checkins 
ADD COLUMN IF NOT EXISTS checklist_goals JSONB DEFAULT '[]'::jsonb;
```

---

## 👥 Authors & Team

- **Developer / Contributor:** BloxyCroissant & Group 8 Members
- **Project:** MacroMate Concept Proposal

---

## 📄 License

This project is created for academic and development purposes under Group 8.
