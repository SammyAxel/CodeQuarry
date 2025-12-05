# CodeQuarry - C Compiler Setup

## Running the Application

The application requires TWO servers running simultaneously:

### 1. **Vite Development Server** (Port 4000)
```bash
npm run dev
```
This serves the frontend React application.

### 2. **C Compiler Backend** (Port 5000)
```bash
npm run server
```
This enables real C code compilation and execution.

### **Or Run Both At Once:**
```bash
npm run dev:all
```
This uses `concurrently` to run both servers in the same terminal.

---

## How C Compilation Works

1. **Frontend** (React): When you click "Run Code" on a C exercise, the code is sent to the backend
2. **Backend** (Node.js): Receives C code, compiles with `gcc`, and executes
3. **Output**: Returns stdout to display in the terminal

### Fallback Mode
If the backend is unavailable, the app automatically falls back to a **printf parser** that:
- Extracts printf statements from your code
- Simulates output by parsing the string arguments
- Still validates your code correctness

---

## Requirements

- **gcc** must be installed on your system (for C compilation)
  - Windows: Install MinGW or use WSL
  - Mac: `xcode-select --install`
  - Linux: `sudo apt install build-essential`

---

## Troubleshooting

### "Backend not available" message
- Make sure you ran `npm run server` in a separate terminal
- Check that port 5000 is not in use: `netstat -ano | findstr :5000`

### "gcc: command not found"
- You need to install a C compiler on your system
- Add gcc to your system PATH

### Temporary files not cleaning up
- Check `.tmp-c/` directory and manually clean if needed

---

## Testing C Code

Example code that should work:

```c
#include <stdio.h>

int main() {
    printf("Hello World");
    return 0;
}
```

Expected output: `Hello World`
