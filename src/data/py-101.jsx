import React from 'react';
import { Terminal } from 'lucide-react';

export const pyCourse = {
  id: 'py-101',
  title: 'Python Snakes',
  description: 'From zero to hero. Master the language that powers AI, Data Science, and the Backend.',
  icon: <Terminal className="w-8 h-8 text-blue-400" />, 
  level: 'Beginner',
  modules: [
    {
        id: 'py-m0',
        title: 'The Python Philosophy',
        type: 'video',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Placeholder video
        duration: '5:00',
        description: 'Why Python? It is not just about code; it is about writing logic that reads like English. Understand the Zen of Python before you type a single line.'
    },
    {
        id: 'py-m1',
        title: 'Setting the Stage',
        type: 'article',
        readTime: '4 min',
        content: `
<h2>Why are we here?</h2>
<p>Python is the "Swiss Army Knife" of programming. It is used by:</p>
<ul class="list-disc pl-5 space-y-2 my-4 text-gray-300">
  <li><strong>NASA</strong> for analyzing space data.</li>
  <li><strong>Netflix</strong> for recommending movies.</li>
  <li><strong>Google</strong> for... well, everything.</li>
</ul>
<p>In this course, we aren't just memorizing syntax. We are learning to <em>think</em> like a Pythonista.</p>
<hr class="border-gray-700 my-6" />
<h3>The Rules of the Road</h3>
<ol class="list-decimal pl-5 space-y-2 text-gray-300">
  <li><strong>Indentation is Law:</strong> Python uses whitespace to define blocks of code. No curly braces <code>{}</code> here.</li>
  <li><strong>Case Matters:</strong> <code>Print</code> and <code>print</code> are two different things.</li>
  <li><strong>Readability:</strong> Write code that your future self can understand.</li>
</ol>
        `
    },
    {
      id: 'py-m2',
      title: 'Hello, World! (Output)',
      type: 'practice',
      theory: `### Speaking to the Machine
The \`print()\` function is your way of sending a message from your code to the console (the output window). Think of it as telling Python to show something on the screen.

**What can you print?**
- **Text (Strings):** Use quotes (\`""\` or \`''\'\''\`)
- **Numbers:** No quotes needed
- **Math expressions:** Python will calculate them first
- **Multiple items:** Separate with commas

\`\`\`python
print("This is a string")      # Prints: This is a string
print(42)                       # Prints: 42
print(10 + 5)                   # Prints: 15
print("Age:", 25)               # Prints: Age: 25
\`\`\`

**Key Point:** Anything in quotes is treated as text, even if it looks like a number. \`print("007")\` prints text, while \`print(7)\` prints a number.
`,
      instruction: 'Write a program that prints "System Ready" to the console.',
      initialCode: '# Send the signal\n',
      language: 'python',
      expectedOutput: 'System Ready',
      requiredSyntax: /print\s*\(\s*['"]System Ready['"]\s*\)/
    },
    {
      id: 'py-m3',
      title: 'The Vault (Variables)',
      type: 'practice',
      theory: `### Storing Data in Variables
A variable is like a labeled box where you store information. You give the box a name, put something inside it, and later you can open it up and use what's stored there.

**Why do we use variables?**
- To reuse values without typing them again
- To make code more readable
- To change values easily

\`\`\`python
# Creating variables (assigning values)
hero_name = "Link"
rupees = 50
is_alive = True

# Using variables
print(hero_name)    # Shows: Link
print(rupees + 10)  # Shows: 60

# Updating variables
rupees = rupees + 10
\`\`\`

**Python's Smart Type System:**
Python automatically figures out what type of data you're storing—you don't have to tell it. This is called **Dynamic Typing**.
- \`"text"\` is a string
- \`42\` is a number (integer)
- \`3.14\` is a decimal (float)
- \`True\` / \`False\` are booleans

**Naming Rules (Important!):**
1. Use \`snake_case\` (lowercase with underscores, like \`user_name\` not \`userName\`)
2. Cannot start with a number (\`2players\` ❌ but \`players2\` ✓)
3. No spaces or special characters
4. Cannot use Python keywords like \`if\`, \`def\`, \`print\`, etc.
`,
      instruction: 'Create a variable named \`agent_id\` and assign it the number 7. Then create a variable \`status\` and assign it "Active". Finally, print the \`status\`.',
      initialCode: '# Define your variables below\n',
      language: 'python',
      expectedOutput: 'Active',
      requiredSyntax: /agent_id\s*=\s*7[\s\S]*status\s*=\s*['"]Active['"][\s\S]*print\s*\(\s*status\s*\)/
    },
    {
      id: 'py-m4',
      title: 'Data Types & Math',
      type: 'practice',
      theory: `### The Data Types
Everything in Python is a data type. Here are the most common ones:

**1. Strings (\`str\`)** - Text
\`\`\`python
name = "Alice"
message = 'Hello'
\`\`\`

**2. Integers (\`int\`)** - Whole numbers (no decimals)
\`\`\`python
age = 25
score = -10
population = 1000000
\`\`\`

**3. Floats (\`float\`)** - Numbers with decimals
\`\`\`python
pi = 3.14159
gravity = 9.8
temperature = -273.15
\`\`\`

**4. Booleans (\`bool\`)** - True or False (used for logic)
\`\`\`python
is_raining = True
is_sunny = False
\`\`\`

### Math Operations
Python can do math for you! Here are the common operations:

| Operation | Symbol | Example | Result |
|-----------|--------|---------|--------|
| Addition | \`+\` | \`5 + 3\` | 8 |
| Subtraction | \`-\` | \`5 - 3\` | 2 |
| Multiplication | \`*\` | \`5 * 3\` | 15 |
| Division | \`/\` | \`15 / 3\` | 5.0 |
| Floor Division | \`//\` | \`15 // 2\` | 7 |
| Exponent (Power) | \`**\` | \`2 ** 3\` | 8 |
| Modulo (Remainder) | \`%\` | \`10 % 3\` | 1 |

**Pro Tip:** Division always gives you a float, even if the answer is a whole number!

\`\`\`python
result = 10 / 2      # Result is 5.0, not 5
result = 10 // 2     # Result is 5 (floor division)
\`\`\`

### Order of Operations
Python follows the same order as math class: **PEMDAS** (Parentheses, Exponents, Multiplication/Division, Addition/Subtraction)

\`\`\`python
result = 2 + 3 * 4     # This is 14, not 20
result = (2 + 3) * 4   # This is 20
\`\`\`
`,
      instruction: 'Calculate the area of a square with side length 5. Create a variable \`side = 5\`, then print \`side ** 2\` to see the result.',
      initialCode: 'side = 5\n# Calculate area\n',
      language: 'python',
      expectedOutput: '25',
      requiredSyntax: /side\s*\*\*\s*2/
    },
    {
      id: 'py-m5',
      title: 'The Gatekeeper (Conditionals)',
      type: 'practice',
      theory: `### Making Decisions with If/Elif/Else
Not all code should run the same way every time. Conditionals let your program make decisions based on conditions.

**What is a condition?**
A condition is a statement that is either True or False. For example:
- \`age > 18\` (Is age greater than 18?)
- \`name == "Alice"\` (Is name exactly "Alice"?)
- \`score >= 90\` (Is score 90 or higher?)

**Comparison Operators:**
| Operator | Meaning | Example |
|----------|---------|---------|
| \`==\` | Equal to | \`x == 5\` |
| \`!=\` | Not equal to | \`x != 5\` |
| \`>\` | Greater than | \`x > 5\` |
| \`<\` | Less than | \`x < 5\` |
| \`>=\` | Greater than or equal | \`x >= 5\` |
| \`<=\` | Less than or equal | \`x <= 5\` |

**The If/Elif/Else Structure:**
\`\`\`python
if condition_1:
    # This runs if condition_1 is True
    print("Path 1")
elif condition_2:
    # This runs if condition_1 is False AND condition_2 is True
    print("Path 2")
else:
    # This runs if all conditions above are False
    print("Path 3")
\`\`\`

**Important:** The colon (\`:\`) and indentation are REQUIRED! They tell Python which code belongs to each condition.

**Example:**
\`\`\`python
score = 85

if score >= 90:
    print("A Grade - Excellent!")
elif score >= 80:
    print("B Grade - Good job!")
elif score >= 70:
    print("C Grade - Passing")
else:
    print("Try again next time")
\`\`\`

**Bonus: Combining Conditions**
- \`and\` - Both must be True
- \`or\` - At least one must be True
- \`not\` - Reverses the result

\`\`\`python
if age >= 18 and has_license:
    print("You can drive")
    
if day == "Saturday" or day == "Sunday":
    print("It's the weekend!")
\`\`\`
`,
      instruction: 'Write an if/else block. If \`battery\` is greater than 20, print "Green". Otherwise, print "Red".',
      initialCode: 'battery = 15\n\n# Write logic here\n',
      language: 'python',
      expectedOutput: 'Red',
      requiredSyntax: /if\s+battery\s*>\s*20\s*:[\s\S]*print\s*\(\s*['"]Green['"]\s*\)[\s\S]*else\s*:[\s\S]*print\s*\(\s*['"]Red['"]\s*\)/
    },
    {
      id: 'py-m6',
      title: 'The Inventory (Lists)',
      type: 'practice',
      theory: `### What is a List?
A list is a collection of items stored in one variable. Think of it as a shelf where you can store multiple things in order. In other programming languages, these are called "arrays".

**Why use lists?**
- Store multiple related items in one variable
- Access items by position (index)
- Add, remove, or change items easily
- Loop through items

\`\`\`python
# Creating a list (use square brackets)
inventory = ["Sword", "Shield", "Potion"]
numbers = [1, 2, 3, 4, 5]
mixed = ["Alice", 25, True]  # Can mix different types
empty = []  # Empty list
\`\`\`

**Important: Indexing Starts at 0**
The first item is at index 0, not 1. This can confuse beginners!

\`\`\`python
party = ["Warrior", "Mage", "Rogue"]
print(party[0])  # Prints: Warrior
print(party[1])  # Prints: Mage
print(party[2])  # Prints: Rogue
print(party[3])  # ERROR! Index out of range
\`\`\`

**Negative Indexing (Counting from the End)**
You can also count backwards from the end:

\`\`\`python
party = ["Warrior", "Mage", "Rogue"]
print(party[-1])  # Prints: Rogue (last item)
print(party[-2])  # Prints: Mage (second-to-last)
\`\`\`

**Common List Operations:**

\`\`\`python
items = ["Apple", "Banana", "Orange"]

# Add an item to the end
items.append("Grape")

# Insert at a specific position
items.insert(1, "Mango")

# Remove an item
items.remove("Banana")

# Get the length (number of items)
count = len(items)

# Check if something is in the list
if "Apple" in items:
    print("Found it!")
\`\`\`

**Slicing: Getting Multiple Items**
\`\`\`python
party = ["Warrior", "Mage", "Rogue", "Archer"]
first_two = party[0:2]     # ["Warrior", "Mage"]
last_two = party[2:4]      # ["Rogue", "Archer"]
all_but_last = party[:-1]  # ["Warrior", "Mage", "Rogue"]
\`\`\`
`,
      instruction: 'Create a list called \`party\` with three names: "Warrior", "Mage", "Rogue". Then print the first member (index 0).',
      initialCode: '# Assemble your party\n',
      language: 'python',
      expectedOutput: 'Warrior',
      requiredSyntax: /party\s*=\s*\[['"]Warrior['"],\s*['"]Mage['"],\s*['"]Rogue['"]\][\s\S]*print\s*\(\s*party\[0\]\s*\)/
    },
    {
      id: 'py-m7',
      title: 'The Infinite Loop (Loops)',
      type: 'practice',
      theory: `### Why Loops?
Imagine you need to print "Hello" 100 times. You *could* write 100 print statements... or you could use a loop and write it once. Loops repeat code automatically.

### For Loops
The \`for\` loop is the most common loop in Python. It iterates (loops through) each item in a sequence.

**Basic Syntax:**
\`\`\`python
for variable in sequence:
    # Code here runs for each item
\`\`\`

**Example 1: Loop through a range of numbers**
\`\`\`python
for i in range(5):
    print(i)

# Output:
# 0
# 1
# 2
# 3
# 4
\`\`\`

**About range():**
- \`range(5)\` creates numbers from 0 to 4 (not including 5)
- \`range(1, 6)\` creates numbers from 1 to 5
- \`range(0, 10, 2)\` creates 0, 2, 4, 6, 8 (step by 2)

**Example 2: Loop through a list**
\`\`\`python
loot = ["Gold", "Silver", "Diamond"]
for item in loot:
    print("Found: " + item)

# Output:
# Found: Gold
# Found: Silver
# Found: Diamond
\`\`\`

**Example 3: Loop with calculations**
\`\`\`python
for i in range(1, 4):
    print(i * 10)

# Output:
# 10
# 20
# 30
\`\`\`

### While Loops (Bonus)
A \`while\` loop runs as long as a condition is True:

\`\`\`python
count = 0
while count < 3:
    print(count)
    count = count + 1

# Output:
# 0
# 1
# 2
\`\`\`

**Warning:** Be careful with while loops! If the condition never becomes False, your program will loop forever (infinite loop).

### Loop Control: break and continue
\`\`\`python
# break: Exit the loop early
for i in range(10):
    if i == 5:
        break  # Stop when i is 5
    print(i)  # Prints 0, 1, 2, 3, 4

# continue: Skip to next iteration
for i in range(5):
    if i == 2:
        continue  # Skip this iteration
    print(i)  # Prints 0, 1, 3, 4 (skips 2)
\`\`\`
`,
      instruction: 'You have a list of \`enemies\`. Write a for loop that prints each enemy name.',
      initialCode: 'enemies = ["Goblin", "Orc", "Dragon"]\n\n# Write your loop\n',
      language: 'python',
      expectedOutput: 'GoblinOrcDragon',
      requiredSyntax: /for\s+\w+\s+in\s+enemies\s*:[\s\S]*print\s*\(\s*\w+\s*\)/
    },
    {
      id: 'py-m8',
      title: 'The Spellbook (Functions)',
      type: 'practice',
      theory: `### What is a Function?
A function is a reusable block of code that does one specific job. Instead of writing the same code over and over, you write it once as a function and call it whenever you need it.

**Why use functions?**
- **Reusability:** Write once, use many times
- **Readability:** Easier to understand code at a glance
- **Maintainability:** Fix bugs in one place
- **Organization:** Keep code neat and organized

**Basic Syntax:**
\`\`\`python
def function_name(parameters):
    # Function body (indented)
    return result  # Optional: send data back
\`\`\`

**Example 1: Function with a return value**
\`\`\`python
def double_it(number):
    result = number * 2
    return result

# Calling the function
answer = double_it(10)
print(answer)  # Prints: 20
\`\`\`

**Example 2: Function with multiple parameters**
\`\`\`python
def add(a, b):
    return a + b

total = add(5, 3)
print(total)  # Prints: 8
\`\`\`

**Example 3: Function without return (just does something)**
\`\`\`python
def greet(name):
    print("Hello, " + name + "!")

greet("Alice")  # Output: Hello, Alice!
\`\`\`

### Parameters vs Arguments
Don't get confused by the terminology!
- **Parameters:** The variables in the function definition (\`def greet(name):\` - "name" is a parameter)
- **Arguments:** The actual values you pass when calling (\`greet("Alice")\` - "Alice" is an argument)

### Default Parameters
You can give parameters default values:

\`\`\`python
def greet(name, greeting="Hello"):
    print(greeting + ", " + name)

greet("Alice")              # Uses default: Hello, Alice
greet("Bob", "Hi")          # Uses custom: Hi, Bob
\`\`\`

### Return vs Print
Don't confuse these!

\`\`\`python
def with_return(x):
    return x * 2           # Sends data back

def with_print(x):
    print(x * 2)           # Just shows on screen

# With return, you can use the result
result = with_return(5)    # result = 10
print(result + 5)          # This works: 15

# With print, you can't reuse the value
with_print(5)              # Just prints 10
# print(result + 5)        # This would be an error!
\`\`\`

### Scope: Where Variables Exist
Variables created inside a function only exist inside that function:

\`\`\`python
def example():
    secret = 42
    return secret

answer = example()
print(answer)   # Prints: 42
print(secret)   # ERROR! secret doesn't exist outside the function
\`\`\`
`,
      instruction: 'Define a function named \`heal\` that takes \`hp\` as an argument and prints "Restored". Then call the function with any number.',
      initialCode: '# Define the spell\n',
      language: 'python',
      expectedOutput: 'Restored',
      requiredSyntax: /def\s+heal\s*\(hp\)\s*:[\s\S]*print\s*\(\s*['"]Restored['"]\s*\)[\s\S]*heal\s*\(\d+\)/
    }
  ]
};