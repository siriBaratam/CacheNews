# 🗄️ CacheNews — Server

The backend REST API for **CacheNews**, built with **Node.js**, **Express**, and **MongoDB**. It features a custom **LRU (Least Recently Used) Cache** implementation to serve frequently accessed news posts without hitting the database every time.

---

## 🧠 What Is This?

This server powers the CacheNews application. When a user requests news posts, the server first checks an **in-memory LRU cache**. If the data is already cached (a "hit"), it returns it instantly. If not (a "miss"), it fetches from MongoDB, stores the result in the cache, and returns it. This dramatically reduces database load and improves response speed.

---

## 📁 Folder Structure

```
server/
├── cache/
│   ├── DoublyLinkedList.js   # Core data structure used by LRU Cache
│   ├── LRUCache.js           # LRU Cache implementation (capacity: 200 items, with TTL support)
│   └── cacheMiddleware.js    # Express middleware that applies caching to GET routes
│
├── config/
│   └── db.js                 # MongoDB connection setup using Mongoose
│
├── controllers/
│   ├── authController.js     # Register & login logic, JWT token generation
│   ├── postController.js     # CRUD for news posts, search, vote, save/unsave
│   ├── commentController.js  # Add & fetch comments on a post
│   └── analyticsController.js# Returns cache hit/miss/eviction stats
│
├── middleware/
│   └── authMiddleware.js     # JWT verification — protects private routes
│
├── models/
│   ├── User.js               # Mongoose schema: username, email, password, savedPosts
│   ├── Post.js               # Mongoose schema: title, content, category, votes, comments
│   └── Comment.js            # Mongoose schema: postId, userId, text, timestamps
│
├── routes/
│   ├── authRoutes.js         # POST /api/auth/register, POST /api/auth/login
│   ├── postRoutes.js         # GET/POST/PUT/DELETE /api/posts
│   ├── commentRoutes.js      # GET/POST /api/posts/:id/comments
│   └── analyticsRoutes.js    # GET /api/analytics
│
├── .env                      # Environment variables (do NOT commit this)
├── seed.js                   # Script to populate the database with sample data
├── test_cache.js             # Script to manually test the LRU cache logic
└── server.js                 # App entry point
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create a new user account | ❌ |
| POST | `/api/auth/login` | Login and receive a JWT token | ❌ |

### Posts
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/posts` | Get all posts (cached) | ❌ |
| GET | `/api/posts/:id` | Get a single post by ID (cached) | ❌ |
| POST | `/api/posts` | Create a new post | ✅ |
| PUT | `/api/posts/:id` | Update a post | ✅ |
| DELETE | `/api/posts/:id` | Delete a post | ✅ |
| PUT | `/api/posts/:id/vote` | Upvote or downvote a post | ✅ |
| PUT | `/api/posts/:id/save` | Save or unsave a post | ✅ |

### Comments
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/posts/:id/comments` | Get all comments for a post | ❌ |
| POST | `/api/posts/:id/comments` | Add a comment to a post | ✅ |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Returns LRU cache stats (hits, misses, evictions, hit ratio) |

---

## ⚙️ Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

**Options for `MONGO_URI`:**
- **MongoDB Atlas (Cloud):** `mongodb+srv://<user>:<password>@cluster.mongodb.net/cache_news`
- **Local MongoDB:** `mongodb://127.0.0.1:27017/cache-news` *(requires MongoDB installed locally)*

---

## 🚀 How to Run

### 1. Install dependencies
```bash
npm install
```

### 2. Set up `.env`
Copy the example above and fill in your MongoDB URI and JWT secret.

### 3. Seed the database (optional)
Populates the DB with sample news posts and users:
```bash
npm run seed
```

### 4. Start the server

**Development** (auto-restarts on file changes):
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server runs at **http://localhost:5000**

---

## 🧪 Testing the Cache

Run the standalone cache test script:
```bash
node test_cache.js
```

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `dotenv` | Load environment variables from `.env` |
| `cors` | Allow cross-origin requests from the client |
| `bcryptjs` | Hash passwords before saving to DB |
| `jsonwebtoken` | Generate and verify JWT auth tokens |
| `nodemon` | Auto-restart server during development |
