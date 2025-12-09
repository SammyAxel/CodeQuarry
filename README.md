<div align="center">
  <br />
  <h1>CodeQuarry ⛏️</h1>
  <strong>An interactive, gamified learning platform to master programming fundamentals.</strong>
  <br />
  <br />
</div>

## About The Project

CodeQuarry is a web-based application designed to make learning to code an engaging and rewarding experience. Instead of passive reading, users "mine" for knowledge by completing interactive coding challenges directly in the browser. The app features a custom-built code editor, a live execution environment for multiple languages, and a persistent progress system, all wrapped in a fun, thematic "mining" UI.

Deployed preview may be accessed using this link: https://codequarry-9xk.pages.dev

This app is made for COMP6100001 - LC09 - Software Engineering class of Binus University 2025/2026 Odd Year.

### Features

*   **Interactive Code Editor**: A custom-built, syntax-highlighted code editor with Tab indentation, auto-pairing, and smart Enter handling.
*   **Live Code Execution**: Run Python, JavaScript, and C code directly in the browser.
    - **Python**: Powered by Pyodide (v0.25.0)
    - **JavaScript**: Native browser execution
    - **C**: Real compilation via Piston API (gcc backend)
*   **Gamified Learning Path**: A structured syllabus with locked/unlocked modules to guide users through courses.
*   **Persistent User Progress**: Client-side progress tracking using `localStorage` to save completed lessons for each user.
*   **Thematic UI**: A unique "CodeQuarry" theme with custom icons, glowing effects, and mining-related decorations.
*   **Markdown-Powered Lessons**: Easily create and display lesson content, including rich text and code blocks.
*   **User Accounts & Authentication**: Secure login system with persistent sessions and progress tracking.
*   **Cosmetics System**: Earn gems and customize your profile with themes, titles, and name colors.
*   **Admin Dashboard**: Full user management, progress reset, and course administration tools.
*   **Refinery System**: Advanced challenges that award bonus gems for high-performance solutions.

---

### Built With

This project is built with a modern frontend and backend stack:

**Frontend:**
*   **React**: For building the user interface.
*   **Vite**: As the build tool for a fast development experience.
*   **Tailwind CSS**: For utility-first styling.
*   **highlight.js**: For robust and accurate syntax highlighting.

**Backend:**
*   **Node.js + Express**: Modular backend with route-based architecture
*   **PostgreSQL**: Persistent database for user accounts, progress, and cosmetics
*   **Piston API**: Free, reliable C compilation (gcc backend)
*   **bcryptjs**: Secure password hashing and authentication
*   **CORS & Security**: Built-in authentication middleware and session management

**Execution Engines:**
*   **Python**: Pyodide (v0.25.0) - runs in browser
*   **JavaScript**: Native browser evaluation
*   **C**: Piston API + gcc compiler (server-side)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v16+) with npm installed
*   PostgreSQL database (local or cloud instance)
*   Environment variables configured (see Installation section)

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/SammyAxel/codequarry.git
    cd codequarry
    ```

2.  Install NPM packages
    ```sh
    npm install
    ```

3.  Set up environment variables
    Create a `.env` file in the project root:
    ```env
    DATABASE_URL=postgresql://user:password@localhost:5432/codequarry
    ADMIN_PASSWORD=your_admin_password
    MOD_PASSWORD=your_mod_password
    PORT=5000
    CORS_ORIGIN=http://localhost:4000
    NODE_ENV=development
    ```

4.  Start the backend server (Terminal 1)
    ```sh
    npm run server
    ```
    The backend will run on `http://localhost:5000`

5.  Start the frontend development server (Terminal 2)
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:4000`

### Running Both Servers Simultaneously

You can run both servers in one command:
```sh
npm run dev:all
```
This uses `concurrently` to run both servers in parallel.

---

## Project Architecture

CodeQuarry uses a modern, modular architecture that separates concerns into focused, maintainable components.

### Backend Structure

```
server/
├── index.js                    # Main entry point
├── config/
│   └── constants.js           # Environment configuration
├── middleware/
│   └── auth.middleware.js     # Authentication & session management
└── routes/
    ├── auth.routes.js         # Admin/mod authentication
    ├── users.routes.js        # User registration, login, profile
    ├── progress.routes.js     # Progress tracking & stats
    ├── courses.routes.js      # Course CRUD operations
    ├── cosmetics.routes.js    # Shop, inventory, equipping
    ├── admin.routes.js        # Admin user management
    ├── translations.routes.js # Internationalization support
    └── compile.routes.js      # Code compilation endpoints

database/
├── connection.js              # PostgreSQL pool configuration
├── index.js                   # Database initialization & exports
└── models/
    ├── User.js               # User auth, profiles, sessions
    ├── Progress.js           # Module progress, stats, refinery
    ├── Cosmetic.js           # Gems, cosmetics, inventory
    ├── Course.js             # Course CRUD, translations
    └── Admin.js              # Admin operations
```

### Key Design Patterns

- **Route Modules**: Each feature area has its own router file
- **Model-Based Database**: Functions grouped by domain (User, Progress, etc.)
- **Middleware Pattern**: Reusable auth and verification middleware
- **Environment Management**: Centralized configuration via constants
- **Connection Pooling**: PostgreSQL pool for performance
- **Transaction Support**: ACID-compliant operations for data integrity

### Database Schema

The application uses 11 PostgreSQL tables:
- `users` - User accounts and authentication
- `user_sessions` - Session tokens and expiration
- `module_progress` - Individual module completion tracking
- `user_stats` - Aggregated user statistics
- `activity_log` - User activity history
- `refinery_progress` - Advanced challenge achievements
- `cosmetics_inventory` - User cosmetics ownership
- `user_cosmetics` - Currently equipped cosmetics
- `courses` - Course definitions and content
- `course_translations` - Multi-language support

