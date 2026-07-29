# 💻 CacheNews — Client

The frontend for **CacheNews**, built with **React 19**, **Vite**, and **Tailwind CSS**. It's a news aggregator UI that displays posts, supports authentication, voting, saving, commenting, and shows live cache analytics from the backend.

---

## 🧠 What Is This?

This is the user-facing web application for CacheNews. It communicates with the Express backend via REST API calls (using Axios). Users can browse news posts, log in/register, vote on posts, save favorites, comment, and view a live analytics dashboard showing how the backend LRU cache is performing.

---

## 📁 Folder Structure

```
client/
├── public/                  # Static assets served directly
│
├── src/
│   ├── api/                 # Axios API call functions (talk to the backend)
│   │
│   ├── components/
│   │   ├── Navbar.jsx        # Top navigation bar with auth buttons and theme toggle
│   │   ├── PostCard.jsx      # Card component for displaying a single news post
│   │   ├── AuthModal.jsx     # Login / Register modal dialog
│   │   ├── CommentThread.jsx # Comment list and add-comment form for a post
│   │   ├── AnalyticsChart.jsx# Recharts-based chart for cache statistics
│   │   └── SpeedBadge.jsx    # Badge showing if a post was served from cache (fast) or DB
│   │
│   ├── context/
│   │   ├── AuthContext.jsx   # Global authentication state (user, token, login/logout)
│   │   └── ThemeContext.jsx  # Global dark/light mode theme state
│   │
│   ├── pages/
│   │   ├── Home.jsx          # Main feed — lists all news posts with search & filter
│   │   ├── PostDetails.jsx   # Single post view with full content and comment thread
│   │   ├── SavedPosts.jsx    # Shows posts the logged-in user has saved
│   │   └── Analytics.jsx     # Dashboard showing cache hit/miss/eviction stats + charts
│   │
│   ├── App.jsx              # Root component — sets up routing and layout
│   ├── main.jsx             # React entry point — mounts App to the DOM
│   ├── App.css              # Global component-level styles
│   └── index.css            # Base styles and Tailwind directives
│
├── index.html               # HTML shell (entry point for Vite)
├── vite.config.js           # Vite build configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── package.json
```

---

## 📄 Pages

| Page | Route | Description |
|------|-------|-------------|
| **Home** | `/` | Browse all news posts. Search by title, filter by category, vote on posts |
| **Post Details** | `/posts/:id` | Read full post content, see and add comments |
| **Saved Posts** | `/saved` | View posts you've bookmarked (requires login) |
| **Analytics** | `/analytics` | Live dashboard: LRU cache hits, misses, evictions, hit ratio, memory usage |

---

## 🧩 Components

| Component | What It Does |
|-----------|-------------|
| `Navbar` | Navigation links, login/logout button, dark mode toggle |
| `PostCard` | Renders a news post preview with title, category, vote count, save button, and SpeedBadge |
| `AuthModal` | Popup form to login or register — switches between modes |
| `CommentThread` | Shows all comments on a post and a form to submit a new one |
| `AnalyticsChart` | Displays a bar/line chart of cache performance data using Recharts |
| `SpeedBadge` | Shows a ⚡ "Cached" or 🗄️ "DB" badge indicating where the data came from |

---

## 🌐 Context (Global State)

| Context | What It Manages |
|---------|----------------|
| `AuthContext` | Logged-in user info, JWT token, login() and logout() functions |
| `ThemeContext` | Current theme (dark/light), toggle function |

---

## 🚀 How to Run

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```

Opens at **http://localhost:5173**

> ⚠️ Make sure the backend server is running at `http://localhost:5000` before starting the client.

### 3. Other commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server with hot reload |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint to check for code issues |

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `react` + `react-dom` | UI framework (v19) |
| `axios` | HTTP client for API requests to the backend |
| `recharts` | Chart library for the analytics dashboard |
| `lucide-react` | Icon library used throughout the UI |
| `vite` | Fast build tool and dev server |
| `tailwindcss` | Utility-first CSS framework for styling |

---

## 🔗 Backend Connection

The client talks to the backend at `http://localhost:5000` by default.  
All API functions are in the `src/api/` directory.

Make sure the **server is running** before starting the client, or API calls will fail.
