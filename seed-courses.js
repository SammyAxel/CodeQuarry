/**
 * Course Seed Script
 * Run with: node seed-courses.js
 * Seeds the database with JS-101, PY-101, and C-101 courses
 */

import dotenv from 'dotenv';
dotenv.config();

import db from './database.js';

const jsCourse = {
  id: 'js-101',
  title: 'JavaScript for Newbs',
  description: 'The backbone of the web. Make websites come alive with JS.',
  icon: '📜',
  customIconUrl: null,
  language: 'javascript',
  difficulty: 'copper',
  isPublished: true,
  isPremium: false,
  authorId: 1,
  modules: [
    {
      id: 'js-m0',
      title: 'Welcome (Course Overview)',
      type: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      duration: '3:12',
      description: 'A short intro to what you will learn in this JavaScript mini-course: variables, functions, DOM, and building a tiny app.'
    },
    {
      id: 'js-m1',
      title: 'The Mic Check (Output)',
      type: 'practice',
      theory: `### Outputting Data
In JavaScript we send messages to the console during development. This helps us check values and debug.

\`\`\`javascript
console.log("Your message here");
\`\`\`

Strings must be wrapped in quotes (single or double). Numbers and variables do not need quotes.`,
      instruction: `Step 1: Use \`console.log()\` function.
Step 2: Pass the string "Hello World" as an argument.
Step 3: Run your code.`,
      initialCode: '// Your journey begins here\n',
      language: 'javascript',
      expectedOutput: 'Hello World',
      hints: [
        'Type the function name: console.log',
        'Add parentheses and the string: console.log("Hello World")',
        'Run it to see the output in the terminal'
      ],
      solution: 'console.log("Hello World");'
    },
    {
      id: 'js-m2',
      title: 'The Container Store (Variables)',
      type: 'article',
      readTime: '5 min',
      content: `### Variables in JavaScript

Variables hold values. Use \`const\` for constants and \`let\` when the value will change. Avoid \`var\` in modern code.

\`\`\`javascript
const name = "Player";
let score = 0;
\`\`\`

\`const\` prevents reassignment; \`let\` allows it. Choosing the right one helps prevent bugs.

### Try It Yourself

Create a constant named \`vibe\` with the value \`"immaculate"\` and log it to the console.`
    },
    {
      id: 'js-m3',
      title: 'Types & Math',
      type: 'practice',
      theory: `### Data Types & Math
JavaScript has numbers, strings, booleans, null, undefined, objects, and arrays. Math operators are \`+ - * / %\` and exponentiation with \`**\`.

\`\`\`javascript
console.log(10 * 10); // 100
\`\`\``,
      instruction: `Step 1: Use \`console.log()\` to display the result.
Step 2: Calculate \`10 * 10\` inside the parentheses.
Step 3: Run your code to see the result.`,
      initialCode: '// console.log( ... )',
      language: 'javascript',
      expectedOutput: '100',
      hints: [
        'Use console.log() to display the result of the multiplication',
        'Calculate 10 * 10 inside the parentheses: console.log(10 * 10)',
        'Run the code to see 100 printed in the terminal'
      ],
      solution: 'console.log(10 * 10);'
    },
    {
      id: 'js-m4',
      title: 'Decisions (Conditionals)',
      type: 'article',
      readTime: '6 min',
      content: `### Conditionals

Use \`if\`, \`else if\`, and \`else\` to make decisions in your code.

\`\`\`javascript
const age = 18;

if (age >= 18) {
  console.log("Adult");
} else {
  console.log("Minor");
}
\`\`\`

### Comparison Operators
- \`===\` strict equality
- \`!==\` strict inequality
- \`>\` \`<\` \`>=\` \`<=\` comparisons`
    },
    {
      id: 'js-m5',
      title: 'Loops',
      type: 'practice',
      theory: `### Loops
Loops repeat code. The most common is the \`for\` loop.

\`\`\`javascript
for (let i = 0; i < 5; i++) {
  console.log(i);
}
\`\`\`

This prints 0, 1, 2, 3, 4.`,
      instruction: `Step 1: Create a for loop starting at 1.
Step 2: Loop while i <= 5.
Step 3: Log each number.`,
      initialCode: '// Write a loop to print 1 to 5\n',
      language: 'javascript',
      expectedOutput: '1\n2\n3\n4\n5',
      hints: [
        'Start with for (let i = 1; ...)',
        'Continue while i <= 5',
        'console.log(i) inside the loop'
      ],
      solution: 'for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}'
    },
    {
      id: 'js-m6',
      title: 'Functions',
      type: 'article',
      readTime: '7 min',
      content: `### Functions
Functions are reusable blocks of code.

\`\`\`javascript
function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("World")); // Hello, World!
\`\`\`

### Arrow Functions
Modern JavaScript uses arrow functions:

\`\`\`javascript
const greet = (name) => "Hello, " + name + "!";
\`\`\``
    },
    {
      id: 'js-m7',
      title: 'Arrays',
      type: 'practice',
      theory: `### Arrays
Arrays store lists of values.

\`\`\`javascript
const fruits = ["apple", "banana", "cherry"];
console.log(fruits[0]); // apple
console.log(fruits.length); // 3
\`\`\`

Use \`.push()\` to add and \`.pop()\` to remove items.`,
      instruction: `Step 1: Create an array called \`colors\` with "red", "green", "blue".
Step 2: Log the second item (index 1).`,
      initialCode: '// Create and log from an array\n',
      language: 'javascript',
      expectedOutput: 'green',
      hints: [
        'const colors = ["red", "green", "blue"]',
        'Arrays are zero-indexed, so index 1 is the second item',
        'console.log(colors[1])'
      ],
      solution: 'const colors = ["red", "green", "blue"];\nconsole.log(colors[1]);'
    },
    {
      id: 'js-m8',
      title: 'Objects',
      type: 'article',
      readTime: '6 min',
      content: `### Objects
Objects store key-value pairs.

\`\`\`javascript
const player = {
  name: "Alex",
  score: 100,
  isActive: true
};

console.log(player.name); // Alex
console.log(player["score"]); // 100
\`\`\`

You can add, modify, or delete properties dynamically.`
    },
    {
      id: 'js-m9',
      title: 'Final Challenge',
      type: 'practice',
      theory: `### Putting It All Together
You've learned variables, types, conditionals, loops, functions, arrays, and objects. Let's combine them!`,
      instruction: `Create a function called \`sum\` that takes two numbers and returns their sum. Then log sum(5, 3).`,
      initialCode: '// Define sum function and test it\n',
      language: 'javascript',
      expectedOutput: '8',
      hints: [
        'function sum(a, b) { return a + b; }',
        'Call it: console.log(sum(5, 3))',
        'The output should be 8'
      ],
      solution: 'function sum(a, b) {\n  return a + b;\n}\nconsole.log(sum(5, 3));'
    }
  ]
};

const pyCourse = {
  id: 'py-101',
  title: 'Python for Newbs',
  description: 'The most beginner-friendly language. Perfect for AI, data, and automation.',
  icon: '🐍',
  customIconUrl: null,
  language: 'python',
  difficulty: 'copper',
  isPublished: true,
  isPremium: false,
  authorId: 1,
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
      theory: `### The print() Function
In Python, we use \`print()\` to display output to the console.

\`\`\`python
print("Hello, World!")
\`\`\`

Strings can use single or double quotes.`,
      instruction: `Step 1: Use the \`print()\` function.
Step 2: Pass "Hello World" as the argument.
Step 3: Run your code.`,
      initialCode: '# Your Python journey begins here\n',
      language: 'python',
      expectedOutput: 'Hello World',
      hints: [
        'Type: print(...)',
        'Put the string inside: print("Hello World")',
        'Run to see the output'
      ],
      solution: 'print("Hello World")'
    },
    {
      id: 'py-m2',
      title: 'Variables & Types',
      type: 'article',
      readTime: '5 min',
      content: `### Variables in Python

Python is dynamically typed - no need to declare types.

\`\`\`python
name = "Alex"
age = 25
is_student = True
\`\`\`

### Common Types
- \`str\` - strings
- \`int\` - integers
- \`float\` - decimals
- \`bool\` - True/False
- \`list\` - arrays
- \`dict\` - objects/dictionaries`
    },
    {
      id: 'py-m3',
      title: 'Math Operations',
      type: 'practice',
      theory: `### Math in Python

\`\`\`python
print(10 + 5)   # 15
print(10 - 5)   # 5
print(10 * 5)   # 50
print(10 / 5)   # 2.0
print(10 // 5)  # 2 (floor division)
print(10 ** 2)  # 100 (power)
\`\`\``,
      instruction: `Calculate and print the result of 7 * 8.`,
      initialCode: '# Calculate 7 * 8\n',
      language: 'python',
      expectedOutput: '56',
      hints: [
        'Use the print() function',
        'Put the calculation inside: print(7 * 8)',
        'Run to see 56'
      ],
      solution: 'print(7 * 8)'
    },
    {
      id: 'py-m4',
      title: 'Conditionals',
      type: 'article',
      readTime: '6 min',
      content: `### If Statements

Python uses indentation for code blocks.

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
else:
    print("C")
\`\`\``
    },
    {
      id: 'py-m5',
      title: 'Loops',
      type: 'practice',
      theory: `### For Loops

\`\`\`python
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4
\`\`\`

### While Loops

\`\`\`python
count = 0
while count < 3:
    print(count)
    count += 1
\`\`\``,
      instruction: `Print numbers 1 through 5 using a for loop with range().`,
      initialCode: '# Print 1 to 5\n',
      language: 'python',
      expectedOutput: '1\n2\n3\n4\n5',
      hints: [
        'Use range(1, 6) to get 1-5',
        'for i in range(1, 6):',
        'print(i) inside the loop'
      ],
      solution: 'for i in range(1, 6):\n    print(i)'
    },
    {
      id: 'py-m6',
      title: 'Functions',
      type: 'article',
      readTime: '7 min',
      content: `### Defining Functions

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))  # Hello, World!
\`\`\`

### Default Parameters

\`\`\`python
def greet(name="Guest"):
    return f"Hello, {name}!"
\`\`\``
    },
    {
      id: 'py-m7',
      title: 'Lists',
      type: 'practice',
      theory: `### Lists in Python

\`\`\`python
fruits = ["apple", "banana", "cherry"]
print(fruits[0])  # apple
print(len(fruits))  # 3
fruits.append("date")
\`\`\``,
      instruction: `Create a list called \`numbers\` with 10, 20, 30 and print the sum using sum().`,
      initialCode: '# Create list and sum it\n',
      language: 'python',
      expectedOutput: '60',
      hints: [
        'numbers = [10, 20, 30]',
        'Use the sum() function',
        'print(sum(numbers))'
      ],
      solution: 'numbers = [10, 20, 30]\nprint(sum(numbers))'
    },
    {
      id: 'py-m8',
      title: 'Dictionaries',
      type: 'article',
      readTime: '6 min',
      content: `### Dictionaries

Key-value pairs, like JavaScript objects.

\`\`\`python
person = {
    "name": "Alex",
    "age": 25,
    "city": "NYC"
}

print(person["name"])  # Alex
person["email"] = "alex@email.com"
\`\`\``
    },
    {
      id: 'py-m9',
      title: 'Final Challenge',
      type: 'practice',
      theory: `### Putting It All Together
Combine everything you've learned!`,
      instruction: `Create a function called \`double\` that takes a number and returns it doubled. Then print double(21).`,
      initialCode: '# Define double function and test it\n',
      language: 'python',
      expectedOutput: '42',
      hints: [
        'def double(n):',
        'return n * 2',
        'print(double(21))'
      ],
      solution: 'def double(n):\n    return n * 2\n\nprint(double(21))'
    }
  ]
};

const cCourse = {
  id: 'c-101',
  title: 'C for Newbs',
  description: 'The foundation of modern computing. Learn memory, pointers, and raw power.',
  icon: '⚙️',
  customIconUrl: null,
  language: 'c',
  difficulty: 'copper',
  isPublished: true,
  isPremium: false,
  authorId: 1,
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
      theory: `### The printf() Function

In C, we use \`printf()\` from the stdio.h library.

\`\`\`c
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
\`\`\`

Every C program needs a \`main()\` function as the entry point.`,
      instruction: `Step 1: Include stdio.h
Step 2: Create the main function
Step 3: Use printf to print "Hello World"`,
      initialCode: '#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}\n',
      language: 'c',
      expectedOutput: 'Hello World',
      hints: [
        'Use printf("Hello World\\n");',
        'The \\n creates a new line',
        'Make sure it\'s inside main()'
      ],
      solution: '#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}'
    },
    {
      id: 'c-m2',
      title: 'Variables & Types',
      type: 'article',
      readTime: '6 min',
      content: `### C Data Types

C is statically typed - you must declare types.

\`\`\`c
int age = 25;
float price = 19.99;
char grade = 'A';
char name[] = "Alex";
\`\`\`

### Common Types
- \`int\` - integers
- \`float\` - decimals
- \`double\` - precise decimals
- \`char\` - single character
- \`char[]\` - string (array of chars)`
    },
    {
      id: 'c-m3',
      title: 'Math & Operators',
      type: 'practice',
      theory: `### Math in C

\`\`\`c
int a = 10, b = 3;
printf("%d\\n", a + b);  // 13
printf("%d\\n", a - b);  // 7
printf("%d\\n", a * b);  // 30
printf("%d\\n", a / b);  // 3 (integer division!)
printf("%d\\n", a % b);  // 1 (modulo)
\`\`\`

Use \`%d\` for integers, \`%f\` for floats.`,
      instruction: `Calculate and print 12 * 4 using printf.`,
      initialCode: '#include <stdio.h>\n\nint main() {\n    // Calculate 12 * 4\n    return 0;\n}\n',
      language: 'c',
      expectedOutput: '48',
      hints: [
        'Use printf with %d for integers',
        'printf("%d\\n", 12 * 4);',
        'The \\n is for newline'
      ],
      solution: '#include <stdio.h>\n\nint main() {\n    printf("%d\\n", 12 * 4);\n    return 0;\n}'
    },
    {
      id: 'c-m4',
      title: 'Conditionals',
      type: 'article',
      readTime: '5 min',
      content: `### If Statements in C

\`\`\`c
int age = 18;

if (age >= 18) {
    printf("Adult\\n");
} else {
    printf("Minor\\n");
}
\`\`\`

### Switch Statement

\`\`\`c
switch (grade) {
    case 'A':
        printf("Excellent!\\n");
        break;
    case 'B':
        printf("Good!\\n");
        break;
    default:
        printf("Keep trying!\\n");
}
\`\`\``
    },
    {
      id: 'c-m5',
      title: 'Loops',
      type: 'practice',
      theory: `### For Loop

\`\`\`c
for (int i = 0; i < 5; i++) {
    printf("%d\\n", i);
}
\`\`\`

### While Loop

\`\`\`c
int i = 0;
while (i < 5) {
    printf("%d\\n", i);
    i++;
}
\`\`\``,
      instruction: `Print numbers 1 through 5 using a for loop.`,
      initialCode: '#include <stdio.h>\n\nint main() {\n    // Print 1 to 5\n    return 0;\n}\n',
      language: 'c',
      expectedOutput: '1\n2\n3\n4\n5',
      hints: [
        'for (int i = 1; i <= 5; i++)',
        'Use printf("%d\\n", i);',
        'Make sure the loop condition is i <= 5'
      ],
      solution: '#include <stdio.h>\n\nint main() {\n    for (int i = 1; i <= 5; i++) {\n        printf("%d\\n", i);\n    }\n    return 0;\n}'
    },
    {
      id: 'c-m6',
      title: 'Functions',
      type: 'article',
      readTime: '7 min',
      content: `### Functions in C

Functions must declare return type and parameter types.

\`\`\`c
int add(int a, int b) {
    return a + b;
}

int main() {
    printf("%d\\n", add(5, 3));  // 8
    return 0;
}
\`\`\`

### Void Functions

\`\`\`c
void sayHello() {
    printf("Hello!\\n");
}
\`\`\``
    },
    {
      id: 'c-m7',
      title: 'Arrays',
      type: 'practice',
      theory: `### Arrays in C

\`\`\`c
int numbers[5] = {10, 20, 30, 40, 50};
printf("%d\\n", numbers[0]);  // 10
printf("%d\\n", numbers[2]);  // 30
\`\`\`

Arrays are zero-indexed and fixed size.`,
      instruction: `Create an array with values 2, 4, 6 and print the middle element (index 1).`,
      initialCode: '#include <stdio.h>\n\nint main() {\n    // Create array and print index 1\n    return 0;\n}\n',
      language: 'c',
      expectedOutput: '4',
      hints: [
        'int arr[3] = {2, 4, 6};',
        'Index 1 is the second element',
        'printf("%d\\n", arr[1]);'
      ],
      solution: '#include <stdio.h>\n\nint main() {\n    int arr[3] = {2, 4, 6};\n    printf("%d\\n", arr[1]);\n    return 0;\n}'
    },
    {
      id: 'c-m8',
      title: 'Pointers (Intro)',
      type: 'article',
      readTime: '8 min',
      content: `### Pointers - The Power of C

Pointers store memory addresses.

\`\`\`c
int x = 42;
int *ptr = &x;  // ptr holds address of x

printf("%d\\n", x);     // 42 (value)
printf("%p\\n", ptr);   // address
printf("%d\\n", *ptr);  // 42 (dereference)
\`\`\`

### Why Pointers?
- Efficient memory usage
- Pass by reference
- Dynamic memory allocation
- Build data structures`
    },
    {
      id: 'c-m9',
      title: 'Final Challenge',
      type: 'practice',
      theory: `### Putting It All Together
Combine your C knowledge!`,
      instruction: `Create a function called \`square\` that takes an int and returns its square. Then print square(7).`,
      initialCode: '#include <stdio.h>\n\n// Define square function here\n\nint main() {\n    // Call and print square(7)\n    return 0;\n}\n',
      language: 'c',
      expectedOutput: '49',
      hints: [
        'int square(int n) { return n * n; }',
        'Call it in main: square(7)',
        'printf("%d\\n", square(7));'
      ],
      solution: '#include <stdio.h>\n\nint square(int n) {\n    return n * n;\n}\n\nint main() {\n    printf("%d\\n", square(7));\n    return 0;\n}'
    }
  ]
};

async function seed() {
  console.log('🌱 Seeding courses...\n');
  
  try {
    // Check if courses already exist
    const existingJS = await db.getCourse('js-101');
    const existingPY = await db.getCourse('py-101');
    const existingC = await db.getCourse('c-101');
    
    if (existingJS) {
      console.log('📝 Updating JS-101...');
      await db.updateCourse('js-101', jsCourse);
    } else {
      console.log('➕ Creating JS-101...');
      await db.createCourse(jsCourse);
    }
    
    if (existingPY) {
      console.log('📝 Updating PY-101...');
      await db.updateCourse('py-101', pyCourse);
    } else {
      console.log('➕ Creating PY-101...');
      await db.createCourse(pyCourse);
    }
    
    if (existingC) {
      console.log('📝 Updating C-101...');
      await db.updateCourse('c-101', cCourse);
    } else {
      console.log('➕ Creating C-101...');
      await db.createCourse(cCourse);
    }
    
    console.log('\n✅ Courses seeded successfully!');
    console.log('   - js-101: JavaScript for Newbs (10 modules)');
    console.log('   - py-101: Python for Newbs (10 modules)');
    console.log('   - c-101: C for Newbs (10 modules)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    process.exit(1);
  }
}

seed();
