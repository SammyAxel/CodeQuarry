/**
 * Comprehensive Course Data for CodeQuarry
 * Proper courses with video, article, and step-based practice modules
 */

export const jsCourse = {
  id: 'js-101',
  title: 'JavaScript for Newbs',
  description: 'The backbone of the web. Make websites come alive with JS.',
  icon: '📜',
  language: 'javascript',
  difficulty: 'Copper',
  isPublished: true,
  modules: [
    {
      "id": "js-m0",
      "title": "Welcome (Course Overview)",
      "type": "video",
      "videoUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "duration": "3:12",
      "description": "A short intro to what you will learn in this JavaScript mini-course: variables, functions, DOM manipulation, and building interactive web apps."
    },
    
    {
      "id": "js-m1",
      "title": "The Mic Check (Output)",
      "type": "practice",
      "theory": `## Outputting Data in JavaScript

In JavaScript, we communicate with the outside world using the \`console.log()\` function. This is your best friend for debugging and testing code.

### The console.log() Function

\`\`\`javascript
console.log("Hello, World!");
console.log(42);
console.log(true);
\`\`\`

**Key Points:**
- Strings must be wrapped in quotes (single \`'\` or double \`"\`)
- Numbers and booleans don't need quotes
- You can log multiple values: \`console.log("Score:", 100)\`

### Why Console Logging Matters
During development, you'll use \`console.log()\` constantly to:
- Check variable values
- Debug your code
- Understand program flow
- Test your logic`,
      instruction: `**Step 1:** Type the function name \`console.log\`
**Step 2:** Add parentheses \`()\` after the function name
**Step 3:** Inside the parentheses, type the string \`"Hello World"\`
**Step 4:** End with a semicolon \`;\`
**Step 5:** Run your code to see the output!`,
      initialCode: `// Welcome to JavaScript!
// Your mission: Print "Hello World" to the console

`,
      language: 'javascript',
      expectedOutput: 'Hello World',
      hints: [
        'Start by typing: console',
        'Add .log after console: console.log',
        'Add parentheses: console.log()',
        'Put your message in quotes inside: console.log("Hello World")',
        'Full solution: console.log("Hello World");'
      ],
      solution: 'console.log("Hello World");',
      stepRequirements: [
        ['console'],
        ['console.log'],
        ['console.log('],
        ['"Hello World"', "'Hello World'"],
        [';']
      ]
    },
    
    // Module 2: Variables (Article)
    {
      id: 'js-m2',
      title: 'The Container Store (Variables)',
      type: 'article',
      readTime: '8 min',
      content: `## Variables: Storing Data in JavaScript

Variables are like labeled containers that hold values. Think of them as boxes with name tags.

### Three Ways to Declare Variables

#### 1. const - For values that won't change
\`\`\`javascript
const PI = 3.14159;
const siteName = "CodeQuarry";
const isAwesome = true;
\`\`\`

#### 2. let - For values that will change
\`\`\`javascript
let score = 0;
let playerName = "Guest";
score = score + 10; // Now score is 10
\`\`\`

#### 3. var - The old way (avoid in modern code)
\`\`\`javascript
var oldSchool = "Don't use this";
\`\`\`

### Naming Rules
- Must start with a letter, \`_\`, or \`$\`
- Can contain letters, numbers, \`_\`, \`$\`
- Case-sensitive (\`myVar\` ≠ \`myvar\`)
- Use camelCase: \`firstName\`, \`totalScore\`

### Data Types
JavaScript has several built-in types:

| Type | Example | Description |
|------|---------|-------------|
| String | \`"Hello"\` | Text data |
| Number | \`42\`, \`3.14\` | Integers and decimals |
| Boolean | \`true\`, \`false\` | Yes/No values |
| Undefined | \`undefined\` | No value assigned |
| Null | \`null\` | Intentionally empty |
| Array | \`[1, 2, 3]\` | List of values |
| Object | \`{name: "Alex"}\` | Key-value pairs |

### Best Practices
1. **Use \`const\` by default** - Only use \`let\` when you need to reassign
2. **Choose descriptive names** - \`userAge\` is better than \`x\`
3. **Avoid magic numbers** - Use named constants instead

\`\`\`javascript
// Bad
if (age > 18) { ... }

// Good
const ADULT_AGE = 18;
if (age > ADULT_AGE) { ... }
\`\`\`

### Try It Yourself
Create a variable for your name and log it:
\`\`\`javascript
const myName = "Your Name Here";
console.log("Hello, " + myName + "!");
\`\`\``
    },
    
    // Module 3: Variables Practice
    {
      id: 'js-m3',
      title: 'Variable Vault',
      type: 'practice',
      theory: `## Creating and Using Variables

Let's practice creating variables and using them in our code.

### Declaring Variables
\`\`\`javascript
const greeting = "Hello";
let count = 0;
\`\`\`

### Using Variables in console.log
\`\`\`javascript
const name = "Alex";
console.log(name); // Prints: Alex
\`\`\`

### String Concatenation
\`\`\`javascript
const first = "Code";
const second = "Quarry";
console.log(first + second); // Prints: CodeQuarry
\`\`\``,
      instruction: `**Step 1:** Create a constant variable named \`language\`
**Step 2:** Assign it the string value \`"JavaScript"\`
**Step 3:** Use \`console.log()\` to print the variable
**Step 4:** Run your code - it should output "JavaScript"`,
      initialCode: `// Create a variable and print it
// Expected output: JavaScript

`,
      language: 'javascript',
      expectedOutput: 'JavaScript',
      hints: [
        'Use const to declare: const language',
        'Assign a value with =: const language = "JavaScript"',
        'Log it: console.log(language)',
        'Note: Don\'t put quotes around the variable name in console.log'
      ],
      solution: `const language = "JavaScript";
console.log(language);`,
      stepRequirements: [
        ['const language'],
        ['= "JavaScript"', "= 'JavaScript'"],
        ['console.log(language)']
      ]
    },
    
    // Module 4: Math Operations (Article)
    {
      id: 'js-m4',
      title: 'Math Magic',
      type: 'article',
      readTime: '7 min',
      content: `## Math Operations in JavaScript

JavaScript can perform all basic math operations and more!

### Basic Operators

| Operator | Name | Example | Result |
|----------|------|---------|--------|
| \`+\` | Addition | \`5 + 3\` | \`8\` |
| \`-\` | Subtraction | \`10 - 4\` | \`6\` |
| \`*\` | Multiplication | \`6 * 7\` | \`42\` |
| \`/\` | Division | \`20 / 4\` | \`5\` |
| \`%\` | Modulo (remainder) | \`17 % 5\` | \`2\` |
| \`**\` | Exponentiation | \`2 ** 3\` | \`8\` |

### Order of Operations (PEMDAS)
JavaScript follows standard math rules:
1. **P**arentheses first
2. **E**xponents
3. **M**ultiplication and **D**ivision (left to right)
4. **A**ddition and **S**ubtraction (left to right)

\`\`\`javascript
console.log(2 + 3 * 4);     // 14 (not 20!)
console.log((2 + 3) * 4);   // 20 (parentheses first)
\`\`\`

### Increment and Decrement
\`\`\`javascript
let count = 5;
count++;        // count is now 6
count--;        // count is now 5 again
count += 10;    // count is now 15
count *= 2;     // count is now 30
\`\`\`

### The Math Object
JavaScript has a built-in \`Math\` object with useful methods:

\`\`\`javascript
Math.round(4.7);    // 5
Math.floor(4.7);    // 4
Math.ceil(4.2);     // 5
Math.abs(-5);       // 5
Math.max(1, 5, 3);  // 5
Math.min(1, 5, 3);  // 1
Math.random();      // Random number 0-1
Math.sqrt(16);      // 4
\`\`\`

### Practical Example
\`\`\`javascript
// Calculate the area of a circle
const radius = 5;
const area = Math.PI * radius ** 2;
console.log(area); // 78.54...
\`\`\``
    },
    
    // Module 5: Math Practice
    {
      id: 'js-m5',
      title: 'Calculator Challenge',
      type: 'practice',
      theory: `## Math in Action

Let's practice using math operators to solve problems.

### Example: Calculating Total
\`\`\`javascript
const price = 29.99;
const quantity = 3;
const total = price * quantity;
console.log(total); // 89.97
\`\`\`

### Example: Finding Average
\`\`\`javascript
const sum = 85 + 90 + 78;
const average = sum / 3;
console.log(average); // 84.33...
\`\`\``,
      instruction: `**Step 1:** Create a variable \`width\` with value \`10\`
**Step 2:** Create a variable \`height\` with value \`5\`
**Step 3:** Create a variable \`area\` that multiplies width × height
**Step 4:** Print the area using \`console.log()\`
**Expected output:** 50`,
      initialCode: `// Calculate the area of a rectangle
// Area = width × height

`,
      language: 'javascript',
      expectedOutput: '50',
      hints: [
        'const width = 10;',
        'const height = 5;',
        'const area = width * height;',
        'console.log(area);'
      ],
      solution: `const width = 10;
const height = 5;
const area = width * height;
console.log(area);`,
      stepRequirements: [
        ['width', '10'],
        ['height', '5'],
        ['width * height', 'width*height'],
        ['console.log']
      ]
    },
    
    // Module 6: Conditionals (Article)
    {
      id: 'js-m6',
      title: 'Decision Time (Conditionals)',
      type: 'article',
      readTime: '10 min',
      content: `## Making Decisions with Conditionals

Conditionals let your code make decisions based on conditions.

### The if Statement
\`\`\`javascript
const age = 20;

if (age >= 18) {
  console.log("You can vote!");
}
\`\`\`

### if...else
\`\`\`javascript
const temperature = 30;

if (temperature > 25) {
  console.log("It's hot outside!");
} else {
  console.log("It's nice outside!");
}
\`\`\`

### if...else if...else
\`\`\`javascript
const score = 85;

if (score >= 90) {
  console.log("Grade: A");
} else if (score >= 80) {
  console.log("Grade: B");
} else if (score >= 70) {
  console.log("Grade: C");
} else {
  console.log("Grade: F");
}
\`\`\`

### Comparison Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| \`===\` | Strict equality | \`5 === 5\` → true |
| \`!==\` | Strict inequality | \`5 !== 3\` → true |
| \`>\` | Greater than | \`10 > 5\` → true |
| \`<\` | Less than | \`3 < 7\` → true |
| \`>=\` | Greater or equal | \`5 >= 5\` → true |
| \`<=\` | Less or equal | \`4 <= 4\` → true |

### Logical Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| \`&&\` | AND | \`true && true\` → true |
| \`\\|\\|\` | OR | \`true \\|\\| false\` → true |
| \`!\` | NOT | \`!true\` → false |

### Combining Conditions
\`\`\`javascript
const age = 25;
const hasLicense = true;

if (age >= 18 && hasLicense) {
  console.log("You can drive!");
}
\`\`\`

### Ternary Operator (Shorthand)
\`\`\`javascript
const status = age >= 18 ? "adult" : "minor";
console.log(status);
\`\`\``
    },
    
    // Module 7: Conditionals Practice
    {
      id: 'js-m7',
      title: 'The Gatekeeper',
      type: 'practice',
      theory: `## Conditional Logic

Let's practice making decisions with if statements.

### Basic Pattern
\`\`\`javascript
if (condition) {
  // code runs if condition is true
} else {
  // code runs if condition is false
}
\`\`\``,
      instruction: `**Step 1:** Create a variable \`score\` with value \`75\`
**Step 2:** Write an if statement: if score is 60 or above, print "Pass"
**Step 3:** Add an else clause that prints "Fail"
**Step 4:** Run your code - it should output "Pass"`,
      initialCode: `// Grade checker
// If score >= 60, print "Pass", otherwise print "Fail"

`,
      language: 'javascript',
      expectedOutput: 'Pass',
      hints: [
        'const score = 75;',
        'if (score >= 60) {',
        'console.log("Pass");',
        '} else { console.log("Fail"); }'
      ],
      solution: `const score = 75;
if (score >= 60) {
  console.log("Pass");
} else {
  console.log("Fail");
}`,
      stepRequirements: [
        ['score', '75'],
        ['if', 'score >= 60', 'score>=60'],
        ['"Pass"', "'Pass'"],
        ['else']
      ]
    },
    
    // Module 8: Loops (Article)
    {
      id: 'js-m8',
      title: 'Loop de Loop',
      type: 'article',
      readTime: '9 min',
      content: `## Loops: Repeating Code

Loops let you run the same code multiple times without repeating yourself.

### The for Loop
The most common loop for counting:

\`\`\`javascript
for (let i = 0; i < 5; i++) {
  console.log(i);
}
// Output: 0, 1, 2, 3, 4
\`\`\`

**Parts of a for loop:**
1. **Initialization:** \`let i = 0\` - starting point
2. **Condition:** \`i < 5\` - keep going while true
3. **Update:** \`i++\` - change after each iteration

### The while Loop
Runs while a condition is true:

\`\`\`javascript
let count = 0;
while (count < 3) {
  console.log(count);
  count++;
}
// Output: 0, 1, 2
\`\`\`

### Looping Through Arrays
\`\`\`javascript
const colors = ["red", "green", "blue"];

for (let i = 0; i < colors.length; i++) {
  console.log(colors[i]);
}

// Modern way with for...of
for (const color of colors) {
  console.log(color);
}
\`\`\`

### Loop Control

**break** - Exit the loop immediately:
\`\`\`javascript
for (let i = 0; i < 10; i++) {
  if (i === 5) break;
  console.log(i);
}
// Output: 0, 1, 2, 3, 4
\`\`\`

**continue** - Skip to next iteration:
\`\`\`javascript
for (let i = 0; i < 5; i++) {
  if (i === 2) continue;
  console.log(i);
}
// Output: 0, 1, 3, 4
\`\`\`

### Common Patterns

**Sum of numbers:**
\`\`\`javascript
let sum = 0;
for (let i = 1; i <= 10; i++) {
  sum += i;
}
console.log(sum); // 55
\`\`\`

**Countdown:**
\`\`\`javascript
for (let i = 5; i > 0; i--) {
  console.log(i);
}
console.log("Blast off!");
\`\`\``
    },
    
    // Module 9: Loops Practice
    {
      id: 'js-m9',
      title: 'Loop Master',
      type: 'practice',
      theory: `## Loop Practice

Let's practice writing loops to repeat code.

### for Loop Structure
\`\`\`javascript
for (start; condition; update) {
  // code to repeat
}
\`\`\`

### Counting from 1 to N
\`\`\`javascript
for (let i = 1; i <= 5; i++) {
  console.log(i);
}
// Output: 1, 2, 3, 4, 5
\`\`\``,
      instruction: `**Step 1:** Write a for loop starting at \`i = 1\`
**Step 2:** Continue while \`i <= 5\`
**Step 3:** Increment \`i\` by 1 each time (\`i++\`)
**Step 4:** Inside the loop, print the value of \`i\`
**Expected output:** 1, 2, 3, 4, 5 (each on new line)`,
      initialCode: `// Print numbers 1 through 5 using a for loop

`,
      language: 'javascript',
      expectedOutput: '1\n2\n3\n4\n5',
      hints: [
        'for (let i = 1; ...',
        'for (let i = 1; i <= 5; ...',
        'for (let i = 1; i <= 5; i++) {',
        'console.log(i); inside the loop'
      ],
      solution: `for (let i = 1; i <= 5; i++) {
  console.log(i);
}`,
      stepRequirements: [
        ['for'],
        ['let i = 1', 'i = 1'],
        ['i <= 5', 'i<=5'],
        ['i++'],
        ['console.log(i)']
      ]
    },
    
    // Module 10: Functions (Article)
    {
      id: 'js-m10',
      title: 'Function Factory',
      type: 'article',
      readTime: '12 min',
      content: `## Functions: Reusable Code Blocks

Functions are reusable pieces of code that perform specific tasks.

### Declaring Functions

**Function Declaration:**
\`\`\`javascript
function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("Alex")); // Hello, Alex!
\`\`\`

**Function Expression:**
\`\`\`javascript
const greet = function(name) {
  return "Hello, " + name + "!";
};
\`\`\`

**Arrow Function (Modern):**
\`\`\`javascript
const greet = (name) => {
  return "Hello, " + name + "!";
};

// Short form for single expressions:
const greet = name => "Hello, " + name + "!";
\`\`\`

### Parameters and Arguments
\`\`\`javascript
function add(a, b) {  // a and b are parameters
  return a + b;
}

const result = add(5, 3);  // 5 and 3 are arguments
console.log(result);  // 8
\`\`\`

### Default Parameters
\`\`\`javascript
function greet(name = "Guest") {
  return "Hello, " + name + "!";
}

console.log(greet());        // Hello, Guest!
console.log(greet("Alex"));  // Hello, Alex!
\`\`\`

### Return Values
\`\`\`javascript
function multiply(a, b) {
  return a * b;  // Returns a value
}

function logMessage(msg) {
  console.log(msg);  // No return (undefined)
}
\`\`\`

### Scope
Variables inside functions are local:
\`\`\`javascript
function test() {
  const localVar = "I'm local";
  console.log(localVar);  // Works
}
console.log(localVar);  // Error! Not accessible
\`\`\`

### Best Practices
1. **Single Responsibility:** Each function should do one thing
2. **Descriptive Names:** \`calculateTotal\` not \`calc\`
3. **Keep Them Small:** Easier to read and test
4. **Pure Functions:** Same input → same output, no side effects`
    },
    
    // Module 11: Functions Practice
    {
      id: 'js-m11',
      title: 'Function Forge',
      type: 'practice',
      theory: `## Writing Functions

Let's practice creating and calling functions.

### Basic Function Pattern
\`\`\`javascript
function functionName(parameter) {
  // do something
  return result;
}

// Call the function
const output = functionName(argument);
\`\`\``,
      instruction: `**Step 1:** Create a function named \`add\` that takes two parameters: \`a\` and \`b\`
**Step 2:** Inside the function, return \`a + b\`
**Step 3:** Call the function with arguments \`10\` and \`20\`
**Step 4:** Print the result using \`console.log()\`
**Expected output:** 30`,
      initialCode: `// Create a function that adds two numbers

`,
      language: 'javascript',
      expectedOutput: '30',
      hints: [
        'function add(a, b) {',
        'return a + b;',
        '}',
        'console.log(add(10, 20));'
      ],
      solution: `function add(a, b) {
  return a + b;
}
console.log(add(10, 20));`,
      stepRequirements: [
        ['function add'],
        ['a', 'b'],
        ['return'],
        ['a + b', 'a+b'],
        ['add(10, 20)', 'add(10,20)'],
        ['console.log']
      ]
    },
    
    // Module 12: Final Challenge
    {
      id: 'js-m12',
      title: 'Final Boss: FizzBuzz',
      type: 'practice',
      theory: `## The Classic FizzBuzz Challenge

FizzBuzz is a famous programming interview question. Here's the challenge:

Print numbers 1 to 15, but:
- If divisible by 3, print "Fizz"
- If divisible by 5, print "Buzz"  
- If divisible by both 3 and 5, print "FizzBuzz"
- Otherwise, print the number

### Tools You'll Need
- for loop
- if...else if...else
- Modulo operator \`%\` (remainder)

### Checking Divisibility
\`\`\`javascript
15 % 3 === 0  // true (15 is divisible by 3)
15 % 5 === 0  // true (15 is divisible by 5)
7 % 3 === 0   // false (7 is not divisible by 3)
\`\`\``,
      instruction: `**The FizzBuzz Challenge:**
- Loop from 1 to 15
- If number is divisible by 3 AND 5, print "FizzBuzz"
- Else if divisible by 3, print "Fizz"
- Else if divisible by 5, print "Buzz"
- Else print the number

**Hint:** Check for divisibility by both first!`,
      initialCode: `// The classic FizzBuzz challenge
// Print 1-15 with Fizz, Buzz, and FizzBuzz substitutions

`,
      language: 'javascript',
      expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz',
      hints: [
        'Start with: for (let i = 1; i <= 15; i++)',
        'Check divisible by both first: if (i % 3 === 0 && i % 5 === 0)',
        'Use else if for single conditions',
        'Use else for just the number',
        'Remember: % gives the remainder'
      ],
      solution: `for (let i = 1; i <= 15; i++) {
  if (i % 3 === 0 && i % 5 === 0) {
    console.log("FizzBuzz");
  } else if (i % 3 === 0) {
    console.log("Fizz");
  } else if (i % 5 === 0) {
    console.log("Buzz");
  } else {
    console.log(i);
  }
}`
    }
  ]
};

export const pyCourse = {
  id: 'py-101',
  title: 'Python for Newbs',
  description: 'The most beginner-friendly language. Perfect for AI, data, and automation.',
  icon: '🐍',
  language: 'python',
  difficulty: 'Copper',
  isPublished: true,
  modules: [
    {
      id: 'py-m0',
      title: 'Welcome to Python',
      type: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      duration: '4:30',
      description: 'An introduction to Python - why it matters and what you will build in this course.'
    },
    {
      id: 'py-m1',
      title: 'Hello Python (Output)',
      type: 'practice',
      theory: `## The print() Function

In Python, we use \`print()\` to display output to the console.

\`\`\`python
print("Hello, World!")
print(42)
print(True)
\`\`\`

**Key Points:**
- Strings can use single or double quotes
- No semicolons needed!
- Python is case-sensitive (\`Print\` won't work)`,
      instruction: `**Step 1:** Type the function name \`print\`
**Step 2:** Add parentheses \`()\`
**Step 3:** Inside the parentheses, type \`"Hello World"\`
**Step 4:** Run your code!`,
      initialCode: `# Welcome to Python!
# Print "Hello World" to the console

`,
      language: 'python',
      expectedOutput: 'Hello World',
      hints: [
        'Type: print',
        'Add parentheses: print()',
        'Add the string: print("Hello World")'
      ],
      solution: 'print("Hello World")'
    },
    {
      id: 'py-m2',
      title: 'Variables & Types',
      type: 'article',
      readTime: '7 min',
      content: `## Variables in Python

Python is dynamically typed - you don't need to declare types!

### Creating Variables
\`\`\`python
name = "Alex"
age = 25
is_student = True
price = 19.99
\`\`\`

### Naming Conventions
- Use snake_case: \`my_variable\`
- Start with letter or underscore
- No spaces allowed

### Common Types
| Type | Example | Check |
|------|---------|-------|
| str | \`"Hello"\` | \`type("Hello")\` |
| int | \`42\` | \`type(42)\` |
| float | \`3.14\` | \`type(3.14)\` |
| bool | \`True\` | \`type(True)\` |
| list | \`[1, 2, 3]\` | \`type([1,2,3])\` |
| dict | \`{"a": 1}\` | \`type({"a":1})\` |

### Type Conversion
\`\`\`python
int("42")     # String to int: 42
str(42)       # Int to string: "42"
float("3.14") # String to float: 3.14
\`\`\``
    },
    {
      id: 'py-m3',
      title: 'Variable Practice',
      type: 'practice',
      theory: `## Using Variables

\`\`\`python
language = "Python"
print(language)  # Output: Python
\`\`\``,
      instruction: `**Step 1:** Create a variable named \`language\` with value \`"Python"\`
**Step 2:** Print the variable`,
      initialCode: `# Create and print a variable

`,
      language: 'python',
      expectedOutput: 'Python',
      hints: [
        'language = "Python"',
        'print(language)'
      ],
      solution: `language = "Python"
print(language)`
    },
    {
      id: 'py-m4',
      title: 'Math in Python',
      type: 'article',
      readTime: '6 min',
      content: `## Math Operations

| Operator | Name | Example |
|----------|------|---------|
| \`+\` | Add | \`5 + 3\` → 8 |
| \`-\` | Subtract | \`10 - 4\` → 6 |
| \`*\` | Multiply | \`6 * 7\` → 42 |
| \`/\` | Divide | \`20 / 4\` → 5.0 |
| \`//\` | Floor Divide | \`7 // 2\` → 3 |
| \`%\` | Modulo | \`7 % 2\` → 1 |
| \`**\` | Power | \`2 ** 3\` → 8 |

### Assignment Operators
\`\`\`python
x = 10
x += 5  # x is now 15
x *= 2  # x is now 30
\`\`\``
    },
    {
      id: 'py-m5',
      title: 'Math Practice',
      type: 'practice',
      theory: `## Calculate and Print`,
      instruction: `**Step 1:** Create \`width = 8\`
**Step 2:** Create \`height = 5\`
**Step 3:** Calculate \`area = width * height\`
**Step 4:** Print the area`,
      initialCode: `# Calculate rectangle area

`,
      language: 'python',
      expectedOutput: '40',
      hints: [
        'width = 8',
        'height = 5',
        'area = width * height',
        'print(area)'
      ],
      solution: `width = 8
height = 5
area = width * height
print(area)`
    },
    {
      id: 'py-m6',
      title: 'If Statements',
      type: 'article',
      readTime: '8 min',
      content: `## Conditionals in Python

Python uses indentation for code blocks!

\`\`\`python
age = 18

if age >= 18:
    print("Adult")
else:
    print("Minor")
\`\`\`

### elif for Multiple Conditions
\`\`\`python
score = 85

if score >= 90:
    print("A")
elif score >= 80:
    print("B")
elif score >= 70:
    print("C")
else:
    print("F")
\`\`\`

### Comparison Operators
- \`==\` Equal
- \`!=\` Not equal
- \`>\` \`<\` \`>=\` \`<=\`

### Logical Operators
- \`and\`
- \`or\`  
- \`not\``
    },
    {
      id: 'py-m7',
      title: 'Conditionals Practice',
      type: 'practice',
      theory: `## Write an if/else`,
      instruction: `**Step 1:** Create \`temperature = 30\`
**Step 2:** If temperature > 25, print "Hot"
**Step 3:** Else print "Nice"`,
      initialCode: `# Temperature check

`,
      language: 'python',
      expectedOutput: 'Hot',
      hints: [
        'temperature = 30',
        'if temperature > 25:',
        '    print("Hot")',
        'else:',
        '    print("Nice")'
      ],
      solution: `temperature = 30
if temperature > 25:
    print("Hot")
else:
    print("Nice")`
    },
    {
      id: 'py-m8',
      title: 'Loops in Python',
      type: 'article',
      readTime: '8 min',
      content: `## For Loops

\`\`\`python
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4
    
for i in range(1, 6):
    print(i)  # 1, 2, 3, 4, 5
\`\`\`

## While Loops
\`\`\`python
count = 0
while count < 3:
    print(count)
    count += 1
\`\`\`

## Looping Through Lists
\`\`\`python
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)
\`\`\``
    },
    {
      id: 'py-m9',
      title: 'Loop Practice',
      type: 'practice',
      theory: `## range() Function

\`range(1, 6)\` gives: 1, 2, 3, 4, 5`,
      instruction: `Print numbers 1 through 5 using a for loop.`,
      initialCode: `# Print 1 to 5

`,
      language: 'python',
      expectedOutput: '1\n2\n3\n4\n5',
      hints: [
        'for i in range(1, 6):',
        '    print(i)'
      ],
      solution: `for i in range(1, 6):
    print(i)`
    },
    {
      id: 'py-m10',
      title: 'Functions',
      type: 'article',
      readTime: '10 min',
      content: `## Defining Functions

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))  # Hello, World!
\`\`\`

### Default Parameters
\`\`\`python
def greet(name="Guest"):
    return f"Hello, {name}!"
\`\`\`

### Multiple Returns
\`\`\`python
def get_stats(numbers):
    return min(numbers), max(numbers), sum(numbers)
    
low, high, total = get_stats([1, 2, 3, 4, 5])
\`\`\``
    },
    {
      id: 'py-m11',
      title: 'Function Practice',
      type: 'practice',
      theory: `## Create a Function`,
      instruction: `**Step 1:** Define a function \`square\` that takes \`n\`
**Step 2:** Return \`n * n\`
**Step 3:** Print \`square(7)\``,
      initialCode: `# Create a square function

`,
      language: 'python',
      expectedOutput: '49',
      hints: [
        'def square(n):',
        '    return n * n',
        'print(square(7))'
      ],
      solution: `def square(n):
    return n * n

print(square(7))`
    },
    {
      id: 'py-m12',
      title: 'Final Boss: FizzBuzz',
      type: 'practice',
      theory: `## FizzBuzz in Python

The classic challenge! Print 1-15 with:
- "Fizz" for multiples of 3
- "Buzz" for multiples of 5
- "FizzBuzz" for both`,
      instruction: `Implement FizzBuzz for numbers 1-15.`,
      initialCode: `# FizzBuzz Challenge

`,
      language: 'python',
      expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz',
      hints: [
        'for i in range(1, 16):',
        'Check i % 15 == 0 first for FizzBuzz',
        'Then i % 3 == 0 for Fizz',
        'Then i % 5 == 0 for Buzz',
        'else print(i)'
      ],
      solution: `for i in range(1, 16):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)`
    }
  ]
};

export const cCourse = {
  id: 'c-101',
  title: 'C for Newbs',
  description: 'The grandfather of modern languages. Master memory management, pointers, and system-level programming.',
  icon: '⚙️',
  language: 'c',
  difficulty: 'Copper',
  isPublished: true,
  modules: [
    {
      id: 'c-m0',
      title: 'Welcome to C',
      type: 'article',
      readTime: '5 min',
      content: `## Why Learn C?

C is the **king of systems programming**. It powers:

- **Operating Systems:** Linux, Windows kernels are written in C
- **Databases:** PostgreSQL, MySQL, SQLite
- **Embedded Systems:** Microcontrollers, IoT devices
- **Performance-Critical Code:** Games, graphics engines

### Key Differences from Python/JavaScript

| Aspect | C | Python/JS |
|--------|---|-----------|
| **Memory Management** | Manual (you control it) | Automatic (garbage collection) |
| **Compilation** | Compiled to machine code | Interpreted or JIT compiled |
| **Speed** | Blazingly fast | Slower (10-100x) |
| **Syntax** | Strict, curly braces | Flexible, indentation |

### Before You Start

C requires **discipline and attention to detail**. You must think about:

- Memory allocation and deallocation
- Data types and their sizes
- Pointer arithmetic
- Buffer overflows and segmentation faults

> But don't worry! We'll build up gradually.
`
    },
    {
      id: 'c-m1',
      title: 'The Skeleton - Your First Program',
      type: 'practice',
      theory: `### Every C Program Needs a Structure

A C program is like a machine with specific parts:

\`\`\`c
#include <stdio.h>    // Include the standard input/output library

int main() {          // Entry point - where execution starts
    printf("Hello, C!");  // Print to console
    return 0;         // Tell the OS: "I finished successfully"
}
\`\`\`

**Breaking it down:**

1. **\`#include <stdio.h>\`** - This is a "preprocessor directive"
   - Tells the compiler to include the standard I/O library
   - Gives you access to \`printf()\`, \`scanf()\`, etc.
   - The angle brackets \`< >\` mean it's a system library

2. **\`int main() { }\`** - The main function
   - \`int\` = this function returns an integer
   - \`main\` = special function name - execution starts here
   - \`{ }\` = curly braces contain the function body

3. **\`printf()\`** - Output function
   - Prints text to the console
   - Takes a string (in quotes) as argument
   - Needs a semicolon at the end

4. **\`return 0;\`** - Exit the program
   - Sends 0 to the OS meaning "no errors occurred"
   - Non-zero values indicate errors

**Key Rules:**
- Every statement ends with a semicolon \`;\`
- Curly braces \`{ }\` enclose code blocks
- Case matters: \`Printf\` is NOT the same as \`printf\`
- C is **line-by-line** - order matters!
`,
      instruction: 'Step 1: Add the #include statement at the top.\nStep 2: Create the main function that returns int.\nStep 3: Use printf() to print "System Ready".\nStep 4: Return 0 at the end.',
      initialCode: `#include <stdio.h>

int main() {
    // Add your code here
    return 0;
}`,
      language: 'c',
      expectedOutput: 'System Ready',
      hints: [
        'Inside main(), add: printf("System Ready");',
        'Make sure you have the semicolon at the end!',
        'The #include line is already there for you'
      ],
      solution: `#include <stdio.h>

int main() {
    printf("System Ready");
    return 0;
}`
    },
    {
      id: 'c-m2',
      title: 'Data Types & Variables',
      type: 'practice',
      theory: `### Variables: Containers for Data

In C, you must **declare** what type of data a variable holds before using it. This is called "Static Typing" - the type is fixed.

**The Basic Data Types:**

\`\`\`c
int age = 25;           // Whole numbers: -2147483648 to 2147483647
float salary = 50000.5; // Decimal numbers (less precise)
double gpa = 3.95;      // Decimal numbers (more precise)
char grade = 'A';       // Single character (note: single quotes!)
\`\`\`

**Why this matters:**
- \`int\` takes 4 bytes of memory
- \`float\` takes 4 bytes (but less precise than double)
- \`double\` takes 8 bytes (more precise)
- \`char\` takes 1 byte

**Declaration vs Initialization:**

\`\`\`c
int x;           // Declaration (creates space, value unknown)
x = 10;          // Assignment (puts value in that space)

int y = 20;      // Declaration + Initialization (both at once)
\`\`\`

**Common Mistakes:**
- Forgetting the type: \`age = 25;\` ❌ (C doesn't know what type!)
- Using double quotes for char: \`char x = "A";\` ❌ (must be single quotes)
- Math with incompatible types: \`int + char\` can work but requires care

**Printing Variables:**

\`\`\`c
printf("Age: %d\\n", age);           // %d for integers
printf("Salary: %.2f\\n", salary);   // %.2f for floats (2 decimal places)
printf("Grade: %c\\n", grade);       // %c for characters
\`\`\`

The \`%d\`, \`%f\`, \`%c\` are **format specifiers** - they tell printf how to display the data.
`,
      instruction: 'Step 1: Create int variable named "id" with value 7.\nStep 2: Create char variable named "level" with value \'A\'.\nStep 3: Print both using appropriate format specifiers.',
      initialCode: `#include <stdio.h>

int main() {
    // Declare variables here
    
    // Print them here
    return 0;
}`,
      language: 'c',
      expectedOutput: 'id: 7\nlevel: A',
      hints: [
        'First line: int id = 7;',
        'Second line: char level = \'A\'; (single quotes for char!)',
        'Use printf with %d for id and %c for level'
      ],
      solution: `#include <stdio.h>

int main() {
    int id = 7;
    char level = 'A';
    printf("id: %d\\n", id);
    printf("level: %c\\n", level);
    return 0;
}`
    },
    {
      id: 'c-m3',
      title: 'Math & Operations',
      type: 'practice',
      theory: `### Doing Math in C

C supports all basic arithmetic operations:

\`\`\`c
int a = 10, b = 3;

int sum = a + b;      // 13
int diff = a - b;     // 7
int product = a * b;  // 30
int quotient = a / b; // 3 (integer division - drops decimals!)
int remainder = a % b; // 1 (modulo - returns remainder)
\`\`\`

**Important: Integer Division**

\`\`\`c
int x = 10 / 3;       // Result: 3 (not 3.33!)
double y = 10.0 / 3;  // Result: 3.333... (using float/double preserves decimals)
\`\`\`

This is a **huge difference** from Python! In Python, \`10 / 3 = 3.333...\` but in C, \`10 / 3 = 3\`.

**Order of Operations (PEMDAS/BODMAS)**

\`\`\`c
int result = 2 + 3 * 4;  // 14 (multiply first)
int result = (2 + 3) * 4; // 20 (parentheses first)
\`\`\`

**Compound Assignment Operators**

\`\`\`c
int x = 10;
x += 5;   // x = x + 5;  → x is now 15
x -= 3;   // x = x - 3;  → x is now 12
x *= 2;   // x = x * 2;  → x is now 24
x /= 4;   // x = x / 4;  → x is now 6
\`\`\`

**Increment/Decrement**

\`\`\`c
int i = 5;
i++;      // i becomes 6
i--;      // i becomes 5
\`\`\`

**Type Casting**

Sometimes you need to convert one type to another:

\`\`\`c
int a = 10, b = 3;
double result = (double)a / b;  // 3.333... (cast to double first)
\`\`\`
`,
      instruction: 'Step 1: Create two int variables: x = 15, y = 4.\nStep 2: Calculate sum, difference, product, and quotient.\nStep 3: Print all four results.',
      initialCode: `#include <stdio.h>

int main() {
    int x = 15;
    int y = 4;
    
    // Calculate here
    
    return 0;
}`,
      language: 'c',
      expectedOutput: 'sum: 19\ndiff: 11\nprod: 60\nquot: 3',
      hints: [
        'int sum = x + y;',
        'int diff = x - y;',
        'int product = x * y;',
        'int quotient = x / y;',
        'Then printf each one'
      ],
      solution: `#include <stdio.h>

int main() {
    int x = 15;
    int y = 4;
    
    int sum = x + y;
    int diff = x - y;
    int product = x * y;
    int quotient = x / y;
    
    printf("sum: %d\\n", sum);
    printf("diff: %d\\n", diff);
    printf("prod: %d\\n", product);
    printf("quot: %d\\n", quotient);
    
    return 0;
}`
    },
    {
      id: 'c-m4',
      title: 'Getting User Input',
      type: 'practice',
      theory: `### Reading Input with scanf()

\`printf()\` sends data OUT. \`scanf()\` reads data IN.

**Basic Syntax:**

\`\`\`c
int age;
scanf("%d", &age);  // Read an integer from user
\`\`\`

**The & Operator (Address-of)**

Notice the \`&\` before \`age\`. This is crucial in C:

- \`age\` = the value stored in age
- \`&age\` = the memory address where age is stored

\`scanf()\` needs the ADDRESS so it knows WHERE to put the input data.

**Format Specifiers (same as printf):**

\`\`\`c
int num;
scanf("%d", &num);           // Integer

float price;
scanf("%f", &price);         // Float

char initial;
scanf("%c", &initial);       // Character (WARNING: picks up newlines!)

char name[50];
scanf("%s", name);           // String (no & for strings/arrays!)
\`\`\`

**Complete Example:**

\`\`\`c
#include <stdio.h>

int main() {
    int age;
    
    printf("Enter your age: ");
    scanf("%d", &age);
    
    printf("You are %d years old\\n", age);
    
    return 0;
}
\`\`\`

**Important Notes:**
1. \`scanf()\` is tricky with strings and characters (leaves newlines in buffer)
2. No spaces in \`scanf("%d", &var)\` - it's strict about formatting
3. The format string in scanf must match your data type EXACTLY
4. Integer division still applies: \`int x; scanf("%d", &x);\` won't convert decimals
`,
      instruction: 'Step 1: Declare an int variable named "number".\nStep 2: Use printf to ask user for a number.\nStep 3: Use scanf to read the input.\nStep 4: Print back the number they entered.',
      initialCode: `#include <stdio.h>

int main() {
    int number;
    
    // Add printf and scanf here
    
    return 0;
}`,
      language: 'c',
      expectedOutput: 'The number is: 42',
      hints: [
        'Use printf to prompt the user',
        'scanf("%d", &number); reads the integer',
        'Notice the & symbol - it means "address of number"',
        'Then printf to display it back'
      ],
      solution: `#include <stdio.h>

int main() {
    int number;
    
    printf("Enter a number: ");
    scanf("%d", &number);
    
    printf("The number is: %d\\n", number);
    
    return 0;
}`
    },
    {
      id: 'c-m5',
      title: 'Conditions & If Statements',
      type: 'practice',
      theory: `### Making Decisions with If/Else

Programs need to make choices. The \`if\` statement lets you execute code conditionally.

**Basic If Statement:**

\`\`\`c
int age = 18;

if (age >= 18) {
    printf("You are an adult\\n");
}
\`\`\`

**Comparison Operators:**

\`\`\`c
a == b    // Equal to (note: TWO equals signs!)
a != b    // NOT equal to
a > b     // Greater than
a < b     // Less than
a >= b    // Greater than or equal
a <= b    // Less than or equal
\`\`\`

**If/Else Statement:**

\`\`\`c
if (age >= 18) {
    printf("Allowed to vote\\n");
} else {
    printf("Too young to vote\\n");
}
\`\`\`

**If/Else If/Else Chain:**

\`\`\`c
if (score >= 90) {
    printf("Grade: A\\n");
} else if (score >= 80) {
    printf("Grade: B\\n");
} else if (score >= 70) {
    printf("Grade: C\\n");
} else {
    printf("Grade: F\\n");
}
\`\`\`

**Logical Operators:**

\`\`\`c
&&    // AND (both must be true)
||    // OR (at least one must be true)
!     // NOT (reverses true/false)

// Examples:
if (age >= 18 && hasLicense) {
    printf("Can drive\\n");
}

if (temp < 0 || temp > 35) {
    printf("Extreme weather\\n");
}

if (!isRaining) {
    printf("Go outside\\n");
}
\`\`\`

**Common Mistake: Assignment vs Comparison**

\`\`\`c
if (x = 5) { }   // ❌ WRONG! Assigns 5 to x
if (x == 5) { }  // ✓ CORRECT! Compares x to 5
\`\`\`

**Curly Braces:**

\`\`\`c
if (x > 10)
    printf("x is big");  // Only this line is conditional

if (x > 10) {
    printf("x is big");
    printf("Very big!");  // Both lines are conditional
}
\`\`\`
`,
      instruction: 'Step 1: Declare an int variable "score".\nStep 2: Use scanf to get input from user.\nStep 3: Create if/else statements to grade: A (90+), B (80+), C (70+), F (<70).',
      initialCode: `#include <stdio.h>

int main() {
    int score;
    
    printf("Enter score: ");
    scanf("%d", &score);
    
    // Add if/else here
    
    return 0;
}`,
      language: 'c',
      expectedOutput: 'Grade: A',
      hints: [
        'Start with: if (score >= 90)',
        'Then: else if (score >= 80)',
        'Then: else if (score >= 70)',
        'Finally: else for scores below 70'
      ],
      solution: `#include <stdio.h>

int main() {
    int score;
    
    printf("Enter score: ");
    scanf("%d", &score);
    
    if (score >= 90) {
        printf("Grade: A\\n");
    } else if (score >= 80) {
        printf("Grade: B\\n");
    } else if (score >= 70) {
        printf("Grade: C\\n");
    } else {
        printf("Grade: F\\n");
    }
    
    return 0;
}`
    },
    {
      id: 'c-m6',
      title: 'Loops: Repeating Code',
      type: 'practice',
      theory: `### Why Loops?

Instead of writing \`printf()\` 100 times, use a loop:

\`\`\`c
// Without loop (tedious!)
printf("1\\n");
printf("2\\n");
printf("3\\n");
// ... 97 more times ...

// With loop (elegant!)
for (int i = 1; i <= 100; i++) {
    printf("%d\\n", i);
}
\`\`\`

**The For Loop:**

\`\`\`c
for (initialization; condition; increment) {
    // Code runs repeatedly
}

// Example: Count from 1 to 5
for (int i = 1; i <= 5; i++) {
    printf("Count: %d\\n", i);
}
\`\`\`

Breaking it down:
- \`int i = 1\` - Start with i = 1
- \`i <= 5\` - Keep going while i is less than or equal to 5
- \`i++\` - After each iteration, increment i by 1

**The While Loop:**

\`\`\`c
int i = 1;
while (i <= 5) {
    printf("Count: %d\\n", i);
    i++;  // Don't forget to increment!
}
\`\`\`

**The Do-While Loop (rare):**

\`\`\`c
int i = 1;
do {
    printf("Count: %d\\n", i);
    i++;
} while (i <= 5);  // Check condition AFTER running code
\`\`\`

**Loop Control:**

\`\`\`c
break;     // Exit the loop immediately
continue;  // Skip to next iteration

// Example:
for (int i = 1; i <= 10; i++) {
    if (i == 5) continue;   // Skip 5
    if (i == 8) break;      // Stop at 8
    printf("%d ", i);
}
// Prints: 1 2 3 4 6 7
\`\`\`

**Common Pattern: Summing**

\`\`\`c
int sum = 0;
for (int i = 1; i <= 10; i++) {
    sum += i;  // Add i to sum
}
printf("Sum: %d\\n", sum);  // 55
\`\`\`
`,
      instruction: 'Step 1: Use a for loop to count from 1 to 10.\nStep 2: Use a variable sum to add all numbers.\nStep 3: Print the final sum (should be 55).',
      initialCode: `#include <stdio.h>

int main() {
    int sum = 0;
    
    // Add your for loop here
    
    printf("Sum: %d\\n", sum);
    return 0;
}`,
      language: 'c',
      expectedOutput: 'Sum: 55',
      hints: [
        'for (int i = 1; i <= 10; i++)',
        'Inside the loop: sum += i;',
        'This adds each number to sum'
      ],
      solution: `#include <stdio.h>

int main() {
    int sum = 0;
    
    for (int i = 1; i <= 10; i++) {
        sum += i;
    }
    
    printf("Sum: %d\\n", sum);
    return 0;
}`
    },
    {
      id: 'c-m7',
      title: 'Functions: Reusable Code',
      type: 'practice',
      theory: `### Functions: Building Blocks

A function is reusable code. Instead of repeating logic, package it into a function.

**Function Anatomy:**

\`\`\`c
return_type function_name(parameter_type param1, parameter_type param2) {
    // Function body
    return value;  // Must return correct type
}
\`\`\`

**Example:**

\`\`\`c
int add(int a, int b) {
    int result = a + b;
    return result;
}

// Using the function:
int sum = add(5, 3);  // sum is now 8
\`\`\`

**Key Points:**

1. **Return Type:** What type does the function give back?
   - \`int\` - returns an integer
   - \`float\` - returns a float
   - \`void\` - returns nothing

2. **Parameters:** What does the function receive?
   - \`int add(int a, int b)\` - expects two integers
   - \`void greet(char name[50])\` - expects a string

3. **Return Statement:** Sends data back to caller
   - \`return 42;\` - give back the value 42
   - \`return;\` - in void functions, just exit

**Function Declaration vs Definition:**

\`\`\`c
// Declaration (prototype) - tells compiler it exists
int multiply(int a, int b);

int main() {
    int result = multiply(4, 5);  // Call the function
    printf("%d\\n", result);
    return 0;
}

// Definition - actual code
int multiply(int a, int b) {
    return a * b;
}
\`\`\`

**Void Functions (no return):**

\`\`\`c
void printStars(int count) {
    for (int i = 0; i < count; i++) {
        printf("* ");
    }
    printf("\\n");
}

// Using it:
printStars(5);  // Prints: * * * * *
\`\`\`

**Multiple Parameters:**

\`\`\`c
double average(int a, int b, int c) {
    return (a + b + c) / 3.0;  // 3.0 to force decimal division
}
\`\`\`
`,
      instruction: 'Step 1: Create a function named "square" that takes int x and returns x*x.\nStep 2: Call it with 5 from main.\nStep 3: Print the result.',
      initialCode: `#include <stdio.h>

// Add your function here

int main() {
    // Call your function here
    
    return 0;
}`,
      language: 'c',
      expectedOutput: 'Result: 25',
      hints: [
        'int square(int x) { ... }',
        'Inside: return x * x;',
        'In main: int result = square(5);',
        'Then printf the result'
      ],
      solution: `#include <stdio.h>

int square(int x) {
    return x * x;
}

int main() {
    int result = square(5);
    printf("Result: %d\\n", result);
    return 0;
}`
    },
    {
      id: 'c-m8',
      title: 'Arrays: Collections of Data',
      type: 'practice',
      theory: `### Arrays: Store Multiple Values

Instead of 100 variables for 100 numbers, use an array:

\`\`\`c
int scores[5];  // Array of 5 integers
scores[0] = 90;
scores[1] = 85;
scores[2] = 92;
scores[3] = 88;
scores[4] = 95;
\`\`\`

**Important: Arrays are 0-indexed!**

\`\`\`c
int arr[3];
arr[0] = 10;  // First element
arr[1] = 20;  // Second element
arr[2] = 30;  // Third element
arr[3] = 40;  // ❌ ERROR! Out of bounds!
\`\`\`

**Initialization:**

\`\`\`c
// Way 1: At declaration
int nums[5] = {10, 20, 30, 40, 50};

// Way 2: Partial initialization (rest are 0)
int arr[5] = {1, 2, 3};  // arr[3] and arr[4] are 0

// Way 3: Auto-size
int nums[] = {10, 20, 30};  // Automatically size 3
\`\`\`

**Size of Array:**

\`\`\`c
int arr[10];
int size = sizeof(arr) / sizeof(arr[0]);  // size = 10
\`\`\`

**Looping Through Arrays:**

\`\`\`c
int nums[5] = {10, 20, 30, 40, 50};

for (int i = 0; i < 5; i++) {
    printf("%d ", nums[i]);
}
// Prints: 10 20 30 40 50
\`\`\`

**Strings (Character Arrays):**

\`\`\`c
char name[50];      // Can hold 49 characters + null terminator
char greeting[20] = "Hello";

printf("%s\\n", greeting);  // Use %s for strings
\`\`\`

**2D Arrays (Matrices):**

\`\`\`c
int matrix[3][3] = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

int value = matrix[1][2];  // Row 1, Column 2 = 6
\`\`\`

**Common Mistake: Out of Bounds**

\`\`\`c
int arr[5];
arr[10] = 5;  // ❌ Crashes! Writing to unallocated memory
\`\`\`
`,
      instruction: 'Step 1: Create an array of 5 integers and initialize with {5, 10, 15, 20, 25}.\nStep 2: Loop through and print each element.\nStep 3: Calculate and print the sum.',
      initialCode: `#include <stdio.h>

int main() {
    int arr[5] = {5, 10, 15, 20, 25};
    
    // Print elements and calculate sum here
    
    return 0;
}`,
      language: 'c',
      expectedOutput: 'Elements: 5 10 15 20 25 \nSum: 75',
      hints: [
        'for (int i = 0; i < 5; i++) to loop through array',
        'Use printf("%d ", arr[i]) to print each element',
        'Add sum += arr[i] inside the loop',
        'Print the final sum'
      ],
      solution: `#include <stdio.h>

int main() {
    int arr[5] = {5, 10, 15, 20, 25};
    int sum = 0;
    
    printf("Elements: ");
    for (int i = 0; i < 5; i++) {
        printf("%d ", arr[i]);
        sum += arr[i];
    }
    printf("\\n");
    
    printf("Sum: %d\\n", sum);
    
    return 0;
}`
    }
  ]
};

export const ALL_COURSES = [jsCourse, pyCourse, cCourse];
