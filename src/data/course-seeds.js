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
    // Module 0: Welcome Video
    {
      id: 'js-m0',
      title: 'Welcome (Course Overview)',
      type: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      duration: '3:12',
      description: 'A short intro to what you will learn in this JavaScript mini-course: variables, functions, DOM manipulation, and building interactive web apps.'
    },
    
    // Module 1: Output (Practice with Steps)
    {
      id: 'js-m1',
      title: 'The Mic Check (Output)',
      type: 'practice',
      theory: `## Outputting Data in JavaScript

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
  description: 'The foundation of modern computing. Learn memory, pointers, and raw power.',
  icon: '⚙️',
  language: 'c',
  difficulty: 'Copper',
  isPublished: true,
  modules: [
    {
      id: 'c-m0',
      title: 'Welcome to C',
      type: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      duration: '5:00',
      description: 'Introduction to C - the language that powers operating systems, games, and embedded systems.'
    },
    {
      id: 'c-m1',
      title: 'Hello C (Output)',
      type: 'practice',
      theory: `## The printf() Function

In C, we use \`printf()\` from stdio.h to print output.

\`\`\`c
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
\`\`\`

**Key Points:**
- \`#include <stdio.h>\` imports the standard I/O library
- \`int main()\` is the entry point
- \`\\n\` creates a new line
- \`return 0;\` indicates success`,
      instruction: `**Step 1:** The #include and main() are provided
**Step 2:** Inside main, use \`printf("Hello World\\n");\`
**Step 3:** Run your code!`,
      initialCode: `#include <stdio.h>

int main() {
    // Print Hello World here
    
    return 0;
}
`,
      language: 'c',
      expectedOutput: 'Hello World',
      hints: [
        'printf("Hello World\\n");',
        'Don\'t forget the semicolon!',
        '\\n creates a new line'
      ],
      solution: `#include <stdio.h>

int main() {
    printf("Hello World\\n");
    return 0;
}`
    },
    {
      id: 'c-m2',
      title: 'Variables & Types',
      type: 'article',
      readTime: '8 min',
      content: `## C Data Types

C is statically typed - you must declare types!

### Basic Types
\`\`\`c
int age = 25;           // Integer
float price = 19.99;    // Decimal (less precise)
double pi = 3.14159;    // Decimal (more precise)
char grade = 'A';       // Single character
char name[] = "Alex";   // String (array of chars)
\`\`\`

### Format Specifiers for printf
| Type | Specifier |
|------|-----------|
| int | %d |
| float | %f |
| double | %lf |
| char | %c |
| string | %s |

\`\`\`c
printf("Age: %d\\n", age);
printf("Price: %.2f\\n", price);
printf("Name: %s\\n", name);
\`\`\``
    },
    {
      id: 'c-m3',
      title: 'Variables Practice',
      type: 'practice',
      theory: `## Declare and Print Variables

\`\`\`c
int x = 42;
printf("%d\\n", x);
\`\`\``,
      instruction: `**Step 1:** Create an int variable \`score\` with value 100
**Step 2:** Print it using printf with %d`,
      initialCode: `#include <stdio.h>

int main() {
    // Create score and print it
    
    return 0;
}
`,
      language: 'c',
      expectedOutput: '100',
      hints: [
        'int score = 100;',
        'printf("%d\\n", score);'
      ],
      solution: `#include <stdio.h>

int main() {
    int score = 100;
    printf("%d\\n", score);
    return 0;
}`
    },
    {
      id: 'c-m4',
      title: 'Math in C',
      type: 'article',
      readTime: '6 min',
      content: `## Operators

| Op | Name | Example |
|----|------|---------|
| + | Add | 5 + 3 |
| - | Sub | 10 - 4 |
| * | Mul | 6 * 7 |
| / | Div | 20 / 4 |
| % | Mod | 7 % 2 |

**Note:** Integer division truncates!
\`\`\`c
int result = 7 / 2;  // result is 3, not 3.5
\`\`\``
    },
    {
      id: 'c-m5',
      title: 'Math Practice',
      type: 'practice',
      theory: `## Calculate and Print`,
      instruction: `Calculate and print 15 * 4`,
      initialCode: `#include <stdio.h>

int main() {
    // Calculate 15 * 4
    
    return 0;
}
`,
      language: 'c',
      expectedOutput: '60',
      hints: [
        'printf("%d\\n", 15 * 4);'
      ],
      solution: `#include <stdio.h>

int main() {
    printf("%d\\n", 15 * 4);
    return 0;
}`
    },
    {
      id: 'c-m6',
      title: 'Conditionals',
      type: 'article',
      readTime: '7 min',
      content: `## If Statements

\`\`\`c
int age = 20;

if (age >= 18) {
    printf("Adult\\n");
} else {
    printf("Minor\\n");
}
\`\`\`

### else if
\`\`\`c
if (score >= 90) {
    printf("A\\n");
} else if (score >= 80) {
    printf("B\\n");
} else {
    printf("C\\n");
}
\`\`\``
    },
    {
      id: 'c-m7',
      title: 'Conditionals Practice',
      type: 'practice',
      theory: `## Write if/else`,
      instruction: `Create variable \`x = 10\`. If x > 5, print "Big", else print "Small".`,
      initialCode: `#include <stdio.h>

int main() {
    // Check if x > 5
    
    return 0;
}
`,
      language: 'c',
      expectedOutput: 'Big',
      hints: [
        'int x = 10;',
        'if (x > 5) {',
        '    printf("Big\\n");',
        '}'
      ],
      solution: `#include <stdio.h>

int main() {
    int x = 10;
    if (x > 5) {
        printf("Big\\n");
    } else {
        printf("Small\\n");
    }
    return 0;
}`
    },
    {
      id: 'c-m8',
      title: 'Loops',
      type: 'article',
      readTime: '8 min',
      content: `## For Loop

\`\`\`c
for (int i = 0; i < 5; i++) {
    printf("%d\\n", i);
}
\`\`\`

## While Loop
\`\`\`c
int i = 0;
while (i < 5) {
    printf("%d\\n", i);
    i++;
}
\`\`\``
    },
    {
      id: 'c-m9',
      title: 'Loop Practice',
      type: 'practice',
      theory: `## for Loop`,
      instruction: `Print numbers 1 through 5 using a for loop.`,
      initialCode: `#include <stdio.h>

int main() {
    // Loop 1 to 5
    
    return 0;
}
`,
      language: 'c',
      expectedOutput: '1\n2\n3\n4\n5',
      hints: [
        'for (int i = 1; i <= 5; i++) {',
        '    printf("%d\\n", i);',
        '}'
      ],
      solution: `#include <stdio.h>

int main() {
    for (int i = 1; i <= 5; i++) {
        printf("%d\\n", i);
    }
    return 0;
}`
    },
    {
      id: 'c-m10',
      title: 'Functions',
      type: 'article',
      readTime: '10 min',
      content: `## Functions in C

\`\`\`c
int add(int a, int b) {
    return a + b;
}

int main() {
    int result = add(5, 3);
    printf("%d\\n", result);  // 8
    return 0;
}
\`\`\`

### Void Functions
\`\`\`c
void sayHello() {
    printf("Hello!\\n");
}
\`\`\`

### Function Prototypes
Declare before main, define after:
\`\`\`c
int add(int a, int b);  // Prototype

int main() {
    printf("%d\\n", add(2, 3));
    return 0;
}

int add(int a, int b) {  // Definition
    return a + b;
}
\`\`\``
    },
    {
      id: 'c-m11',
      title: 'Function Practice',
      type: 'practice',
      theory: `## Create a Function`,
      instruction: `Create a function \`multiply(a, b)\` that returns a * b. Print multiply(6, 7).`,
      initialCode: `#include <stdio.h>

// Define multiply function here

int main() {
    // Call and print multiply(6, 7)
    
    return 0;
}
`,
      language: 'c',
      expectedOutput: '42',
      hints: [
        'int multiply(int a, int b) {',
        '    return a * b;',
        '}',
        'printf("%d\\n", multiply(6, 7));'
      ],
      solution: `#include <stdio.h>

int multiply(int a, int b) {
    return a * b;
}

int main() {
    printf("%d\\n", multiply(6, 7));
    return 0;
}`
    },
    {
      id: 'c-m12',
      title: 'Final Boss: FizzBuzz',
      type: 'practice',
      theory: `## FizzBuzz in C`,
      instruction: `Implement FizzBuzz for 1-15.`,
      initialCode: `#include <stdio.h>

int main() {
    // FizzBuzz
    
    return 0;
}
`,
      language: 'c',
      expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz',
      hints: [
        'for (int i = 1; i <= 15; i++)',
        'if (i % 15 == 0) printf("FizzBuzz\\n");',
        'else if (i % 3 == 0) printf("Fizz\\n");',
        'else if (i % 5 == 0) printf("Buzz\\n");',
        'else printf("%d\\n", i);'
      ],
      solution: `#include <stdio.h>

int main() {
    for (int i = 1; i <= 15; i++) {
        if (i % 15 == 0) {
            printf("FizzBuzz\\n");
        } else if (i % 3 == 0) {
            printf("Fizz\\n");
        } else if (i % 5 == 0) {
            printf("Buzz\\n");
        } else {
            printf("%d\\n", i);
        }
    }
    return 0;
}`
    }
  ]
};

export const ALL_COURSES = [jsCourse, pyCourse, cCourse];
