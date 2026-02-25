# How to Create a Great Course on CodeQuarry

> **Who this guide is for:** Admins and content creators who want to build engaging, well-structured courses for CodeQuarry learners.

---

## Table of Contents

1. [Before You Start](#before-you-start)
2. [Course Structure Overview](#course-structure-overview)
3. [Plan Your Course](#plan-your-course)
4. [Create the Course in Admin Panel](#create-the-course-in-admin-panel)
5. [Build Practice Modules](#build-practice-modules)
6. [Build Article Modules](#build-article-modules)
7. [Build Video Modules](#build-video-modules)
8. [Add Refinery Challenges](#add-refinery-challenges)
9. [Writing Good Instructions](#writing-good-instructions)
10. [Writing Good Theory](#writing-good-theory)
11. [Writing Good Hints](#writing-good-hints)
12. [Choosing the Right Tier](#choosing-the-right-tier)
13. [Course Layout Patterns](#course-layout-patterns)
14. [Quality Checklist](#quality-checklist)
15. [Common Mistakes](#common-mistakes)
16. [Example - Building a Python Basics Course](#example---building-a-python-basics-course)

---

## Before You Start

You need:
- An **admin account** on CodeQuarry
- A clear idea of the **topic** and **target audience**
- The **programming language** the course will use (Python, JavaScript, or C)

Ask yourself:
- What should the student know **before** this course?
- What should the student be able to do **after** this course?
- How many modules will it take? (aim for 5–12)

---

## Course Structure Overview

A CodeQuarry course is a **linear sequence of modules**. Each module is one of three types:

| Type | Purpose | When to use |
|---|---|---|
| **Practice** | Student writes code to solve a problem | Core learning — should be 60–80% of your course |
| **Article** | Student reads a markdown-formatted explanation | Introduce theory, explain concepts between practice sessions |
| **Video** | Student watches an embedded video | Demonstrate complex workflows, walkthroughs, or motivational content |

Students progress through modules in order. Each practice module rewards gems on completion.

---

## Plan Your Course

Before touching the admin panel, **outline on paper**:

```
Course: Python Basics
Tier: Copper (Foundational)
Language: Python
Modules:
  1. [Article] What is Python?
  2. [Practice] Hello World — print()
  3. [Practice] Variables — assignment
  4. [Article] Data Types Explainer
  5. [Practice] Strings — concatenation, f-strings
  6. [Practice] Numbers & Math — operators
  7. [Practice] User Input — input()
  8. [Practice] Conditionals — if/elif/else
  9. [Practice] Loops — for, while
  10. [Article] What's Next? — Recap & resources
```

**Golden rules:**
- Start with an article or video to set context.
- Alternate theory and practice — never have 3+ articles in a row.
- End with a capstone practice or a summary article.
- Each practice module should teach **one concept** only.

---

## Create the Course in Admin Panel

1. Log in → click **Admin** in the navbar → you're in the Admin Dashboard.
2. Go to the **Drafts** tab.
3. Click **+ New Course**.
4. Fill in:

| Field | Guidance |
|---|---|
| **Title** | Short, clear. Good: `Python Basics`, `JavaScript Functions`. Bad: `Learn All About the Fundamentals of Python Programming Language` |
| **Description** | 1–2 sentences. What will the student learn and why it matters? |
| **Level / Tier** | See [§12: Choosing the Right Tier](#choosing-the-right-tier) |
| **Icon** | Pick an emoji (e.g. `🐍` for Python) or upload an image. Keep it recognizable at small sizes. |
| **Language** | Default programming language for practice modules (can override per module) |

5. Click **Save Draft**. The course now appears in your drafts list.

---

## Build Practice Modules

Practice modules are the heart of every course. Each one has:

### Required Fields

| Field | What it does | Example |
|---|---|---|
| **Title** | Short module name | `Variables & Assignment` |
| **Theory** | Markdown explanation shown in the sidebar | See [§10](#writing-good-theory) |
| **Instruction** | Step-by-step task the student must complete | See [§9](#writing-good-instructions) |
| **Initial Code** | What appears in the editor when the student starts | `# Write your code below\n` |
| **Expected Output** | The exact text the student's code must print | `Hello, Alice!\nYou are 25 years old.` |
| **Language** | `python`, `javascript`, or `c` | `python` |

### Optional but Recommended

| Field | What it does |
|---|---|
| **Hints** | Progressive hints (shown one at a time). See [§11](#writing-good-hints) |
| **Solution** | Full working code. Shown as last resort. |
| **Required Syntax** | Regex the code must match (e.g. `/for\s+\w+\s+in/` to require a for loop) |
| **Required Code** | Exact strings the code must contain |
| **Step Requirements** | Per-step validation — checks each step is completed |
| **Difficulty** | `easy`, `medium`, or `hard` |
| **Gem Reward** | How many gems the student earns (default: 10) |
| **Estimated Time** | In minutes |

### Example Practice Module

```
Title: User Input
Theory:
  ## The input() Function
  Python's `input()` function reads text from the user.
  ```python
  name = input("What's your name? ")
  print(f"Hello, {name}!")
  ```
  The input is always a **string**. To use it as a number, convert it:
  ```python
  age = int(input("Your age: "))
  ```

Instruction:
  Step 1: Use input() to ask the user for their name and store it in a variable called `name`.
  Step 2: Use input() to ask for their age and store it in `age`.
  Step 3: Print "Hello, <name>! You are <age> years old." using an f-string.

Initial Code:
  # Ask the user for their name and age

Expected Output:
  Hello, Alice! You are 25 years old.

Hints:
  1. "Start with: name = input('What is your name? ')"
  2. "For age: age = input('How old are you? ')"
  3. "Use an f-string: print(f'Hello, {name}! ...')"

Solution:
  name = input("What is your name? ")
  age = input("How old are you? ")
  print(f"Hello, {name}! You are {age} years old.")
```

```

## Build Article Modules

Articles are for **explaining concepts** that practice modules can't cover well (diagrams, comparisons, history, motivation).

### Fields

| Field | What it does |
|---|---|
| **Title** | Module name |
| **Content** | Markdown or HTML. Supports headings, code blocks, lists, bold, italic, links. |
| **Read Time** | Estimated reading time (e.g. `3 min`) |

### Tips

- Keep articles under **500 words** — students came here to code, not read essays.
- Use plenty of **code examples** inside articles (fenced code blocks with language).
- Use articles to _bridge_ two practice modules. Example: after a `for loop` practice, add an article on "for vs while — when to use which" before the `while loop` practice.
- Use the markdown toolbar in the editor for quick formatting.

---

## Build Video Modules

Videos work best for:
- Course introductions / welcomes
- Complex visual concepts (how memory works, how the web works)
- Live coding walkthroughs
- Motivational / "why this matters" segments

### Fields

| Field | What it does |
|---|---|
| **Title** | Module name |
| **Video URL** | Direct link to video file or embeddable URL |
| **Duration** | Length in `m:ss` format (e.g. `5:30`) |
| **Description** | Brief text shown below the video player |

### Tips

- Keep videos **under 10 minutes**. If longer, split into parts.
- Always follow a video module with a practice module that applies what was shown.
- Don't put critical information _only_ in a video — some students skip them. Repeat key points in the subsequent practice module's theory section.

---

## Add Refinery Challenges

Refinery challenges are **optional bonus problems** attached to practice modules. They reward extra gems and encourage code optimization.

Each challenge has:
- **Title** and **Description**
- **Test cases** (input → expected output)
- **Constraints**: max lines, forbidden patterns, required patterns
- **Base gems** reward

Use refinery challenges for:
- "Can you solve it in fewer lines?"
- "Solve without using a for loop"
- "Must use recursion"

See the [Refinery Guide](REFINERY.md) for full field reference.

**Rule of thumb:** Add refinery challenges only to modules that have a clear optimization angle. Not every module needs one.

---

## Writing Good Instructions

Instructions tell the student _what to do_. They are the most important part of a practice module.

### Format

Always use numbered steps:

```
Step 1: Create a variable called `greeting` and assign it the value "Hello".
Step 2: Create a variable called `name` and assign it "World".
Step 3: Print the greeting and name together, separated by a comma and space.
```

### Rules

1. **One action per step.** Bad: `Step 1: Create two variables and print them.` Good: Split into 3 steps.
2. **Be specific.** Bad: `Step 1: Make a variable.` Good: `Step 1: Create a variable called 'x' and set it to 10.`
3. **Use exact names.** If you say `name`, the student must use `name` — don't say "a variable" when you need a specific name.
4. **Match the expected output.** Every step should build toward what `Expected Output` expects. Test your instructions yourself before publishing.
5. **3–5 steps per module** is the sweet spot. More than 7 steps means the module is too complex — split it.

### Anti-patterns

| Bad | Why | Better |
|---|---|---|
| `Step 1: Do the thing.` | Too vague | `Step 1: Call print() with the string "Hello".` |
| `Step 1: Create a variable. Step 2: Create another variable. Step 3: Create a third variable.` | Boring, repetitive | Collapse into one step if they're related, or add context. |
| `Step 1: Write a function that takes a list, sorts it, filters evens, and returns the sum.` | Way too much in one step | Split into 4 steps. |

---

## Writing Good Theory

Theory appears in the sidebar while the student is coding. It's their reference material.

### Structure

````markdown
## [Concept Name]

[1-2 sentence explanation of what this concept is and why it matters.]

```python
# Simple example showing the concept
example_code_here()
```

[Optional: 1-2 sentences on common mistakes or edge cases.]

### Key Points
- Point 1
- Point 2
````

### Rules

1. **Lead with a code example** — students learn fastest by reading code, not prose.
2. **Under 200 words** — this is a reference, not a textbook chapter.
3. **Use the same variable names** as your instruction steps. If the theory shows `name = "Alice"` but the instructions say "create a variable called `user`," students get confused.
4. **Highlight gotchas.** If `input()` always returns a string, say so explicitly.

---

## Writing Good Hints

Hints are revealed one at a time when the student gets stuck. They should form a **progressive reveal**:

| Hint # | What it should do | Example |
|---|---|---|
| **1** | Nudge in the right direction (don't give code) | `"Think about which function prints text to the screen."` |
| **2** | Give partial syntax | `"Start with: print( ... )"` |
| **3** | Give nearly the answer | `"Try: print('Hello, ' + name)"` |

### Rules

- **3 hints per module** is ideal for Copper/Silver. 1–2 for Gold. 0–1 for Platinum.
- **Always provide a solution** as the final fallback — even if hints are generous.
- Hints should **never** reference step numbers. If you reorder steps, the hints break.
- Write hints as if you're sitting next to the student. Friendly, not clinical.

---

## Choosing the Right Tier

| Tier | Badge | Who is it for? | Module count | Hints per module |
|---|---|---|---|---|
| 🥉 **Copper** | Foundational | Absolute beginners, zero experience | 3–5 | 3 + solution |
| ⚪ **Silver** | Intermediate | Knows basics, building skills | 5–8 | 2 |
| 🟡 **Gold** | Advanced | Experienced, ready for real-world problems | 5–10 | 1–2 |
| 💎 **Platinum** | Expert | Competitive/expert-level | 5–15 | 0–1 |

**If in doubt, set the tier one level lower** than you think. It's better for a student to feel confident than frustrated.

See [TIER_SYSTEM.md](TIER_SYSTEM.md) for full details on tier colors, UI presentation, and content tips per tier.

---

## Course Layout Patterns

### Pattern A: The Classic (recommended for Copper/Silver)

```
1. [Article] Introduction — what we'll learn
2. [Practice] Basic concept
3. [Practice] Build on concept
4. [Article] Deeper explanation / comparison
5. [Practice] Intermediate challenge
6. [Practice] Intermediate challenge
7. [Practice] Capstone — combines everything
```

### Pattern B: Video-Led (good for visual subjects)

```
1. [Video] Course intro & motivation
2. [Article] Setup / prerequisites
3. [Practice] First hands-on
4. [Video] Deep dive demonstration
5. [Practice] Apply what was shown
6. [Practice] Independent challenge
```

### Pattern C: Challenge Sprint (Gold/Platinum)

```
1. [Article] Brief concept recap (assumes prior knowledge)
2. [Practice] Challenge 1
3. [Practice] Challenge 2
4. [Practice] Challenge 3 (harder)
5. [Practice] Challenge 4 (hardest)
```

---

## Quality Checklist

Before publishing, verify every module:

- [ ] **Title** is clear and concise (3–7 words)
- [ ] **Theory** has at least one code example
- [ ] **Instructions** use numbered steps (`Step 1:`, `Step 2:`, ...)
- [ ] **Expected output** exactly matches what the solution produces (including spaces, newlines, capitalization)
- [ ] **Solution** is provided and actually works
- [ ] **Initial code** gives a helpful starting comment (not just an empty editor)
- [ ] **Hints** are progressive (nudge → partial code → near-answer)
- [ ] **Language** is set correctly (Python/JavaScript/C)
- [ ] **Difficulty** is set appropriately
- [ ] You've tested the module yourself — run the solution and verify it matches the expected output character-for-character

And for the course as a whole:

- [ ] First module is welcoming (article or easy practice)
- [ ] Modules build on each other — no sudden jumps in difficulty
- [ ] No 3+ articles/videos in a row without a practice module
- [ ] Tier is appropriate for the content difficulty
- [ ] Total module count is reasonable (5–12 for most courses)
- [ ] Description accurately reflects what the course covers

---

## Common Mistakes

| Mistake | Why it's bad | Fix |
|---|---|---|
| Expected output has trailing newline but solution doesn't | Student's code is correct but fails validation | Run solution, copy output exactly |
| Using `input()` but not documenting what to type | Student doesn't know what input to provide | State the test input in the instructions or theory |
| Theory uses Python 2 syntax | Confuses students, code won't run | Always use Python 3 (`print()` with parens, `input()` not `raw_input()`) |
| Steps reference concepts not yet taught | Student can't complete the module | Reorder modules or add a theory article first |
| Solution uses a different approach than the instructions suggest | Hints and steps don't match the "correct" answer | Rewrite hints/steps to match the solution, or vice versa |
| Too many modules (20+) | Students lose motivation | Split into two courses (Part 1 / Part 2) |
| Required syntax regex is too strict | Rejects valid solutions | Test the regex against 2–3 different valid approaches |
| No hints on a Copper course | Beginners get stuck with no help | Always add 3 hints + solution for Copper |

---

## Example - Building a Python Basics Course

Here's what a complete Copper-tier Python Basics course might look like:

### Course Metadata
- **Title:** Python Basics
- **Description:** Learn Python from scratch — variables, input/output, conditions, and loops.
- **Tier:** Copper (Foundational)
- **Icon:** 🐍
- **Language:** Python

### Module Outline

| # | Type | Title | Key Concept |
|---|---|---|---|
| 1 | Article | Welcome to Python | What is Python, why learn it, how this course works |
| 2 | Practice | Hello World | `print()` |
| 3 | Practice | Variables | Assignment, variable naming |
| 4 | Article | Data Types | int, float, str, bool — when to use each |
| 5 | Practice | Strings | Concatenation, f-strings, `.upper()`, `.lower()` |
| 6 | Practice | Numbers & Math | Arithmetic operators, `int()`, `float()` |
| 7 | Practice | User Input | `input()`, type conversion |
| 8 | Practice | Conditionals | `if`, `elif`, `else` |
| 9 | Practice | Loops | `for`, `while`, `range()` |
| 10 | Article | What's Next? | Recap, suggest next course (Silver tier) |

### Module 2 — "Hello World" (full example)

```
Title: Hello World
Type: Practice
Difficulty: Easy
Language: Python
Gem Reward: 10
Estimated Time: 5

Theory:
  ## The print() Function
  `print()` displays text on the screen.
  ```python
  print("Hello, World!")
  ```
  Text inside quotes is called a **string**.
  You can use single quotes `'...'` or double quotes `"..."` — both work.

Instruction:
  Step 1: Use the print() function to display "Hello, World!" on the screen.
  Step 2: Add a second print() call on the next line to display "Welcome to Python!".

Initial Code:
  # Your first Python program!

Expected Output:
  Hello, World!
  Welcome to Python!

Required Syntax: /print\s*\(/

Hints:
  1. "The function to display text is called print()"
  2. "Put your text inside quotes inside the parentheses: print('...')"
  3. "print('Hello, World!')\nprint('Welcome to Python!')"

Solution:
  print("Hello, World!")
  print("Welcome to Python!")
```

---

*This guide covers course creation as of the February 2026 release. For certificate issuance, see [CERTIFICATE_GUIDE.md](CERTIFICATE_GUIDE.md). For refinery challenge details, see [REFINERY.md](REFINERY.md). For tier system specifics, see [TIER_SYSTEM.md](TIER_SYSTEM.md).*
