<div align="center">
  <br />
  <h1>CodeQuarry ⛏️</h1>
  <strong>An interactive, gamified learning platform to master programming fundamentals.</strong>
  <br />
  <br />
</div>

## About The Project

CodeQuarry is a web-based application designed to make learning to code an engaging and rewarding experience. Instead of passive reading, users "mine" for knowledge by completing interactive coding challenges directly in the browser. The app features a custom-built code editor, a live execution environment for multiple languages, and a persistent progress system, all wrapped in a fun, thematic "mining" UI.

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

---

### Built With

This project is built with a modern frontend and backend stack:

**Frontend:**
*   **React**: For building the user interface.
*   **Vite**: As the build tool for a fast development experience.
*   **Tailwind CSS**: For utility-first styling.
*   **highlight.js**: For robust and accurate syntax highlighting.

**Backend:**
*   **Node.js + Express**: Backend server for code compilation
*   **Piston API**: Free, reliable C compilation (gcc backend)
*   **Pyodide**: To run Python code in the browser.

**Execution Engines:**
*   **Python**: Pyodide (v0.25.0) - runs in browser
*   **JavaScript**: Native browser evaluation
*   **C**: Piston API + gcc compiler (server-side)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (which includes npm) installed on your machine.

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/SammyAxel/codequarry.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Start the backend server (Terminal 1)
    ```sh
    node server.js
    ```
    The backend will run on `http://localhost:5000`

4.  Start the development server (Terminal 2)
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

