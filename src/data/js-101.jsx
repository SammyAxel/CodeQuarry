import React from 'react';
import { Code2 } from 'lucide-react';

export const jsCourse = {
  id: 'js-101',
  title: 'JavaScript for Newbs',
  description: 'The backbone of the web. Make websites come alive with JS.',
  icon: <Code2 className="w-8 h-8 text-yellow-400" />,
  level: 'Copper',
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

Strings must be wrapped in quotes (single or double). Numbers and variables do not need quotes.
`,
      instruction: 'Step 1: Use `console.log()` function.\nStep 2: Pass the string "Hello World" as an argument.\nStep 3: Run your code.',
      initialCode: '// Your journey begins here\n',
      language: 'javascript',
      expectedOutput: 'Hello World',
      requiredSyntax: /console\.log\s*\(/,
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
`,
      instruction: 'Step 1: Create a `const` variable named `vibe`.\nStep 2: Assign it the value "immaculate".\nStep 3: Log it to the console using `console.log()`.'
    },
    {
      id: 'js-m3',
      title: 'Types & Math',
      type: 'practice',
      theory: `### Data Types & Math
JavaScript has numbers, strings, booleans, null, undefined, objects, and arrays. Math operators are \`+ - * / %\` and exponentiation with \`**\`.

\`\`\`javascript
console.log(10 * 10); // 100
\`\`\`
`,
      instruction: 'Step 1: Use `console.log()` to display the result.\nStep 2: Calculate `10 * 10` inside the parentheses.\nStep 3: Run your code to see the result.',
      initialCode: '// console.log( ... )',
      language: 'javascript',
      expectedOutput: '100',
      requiredSyntax: /10\s*\*\s*10/,
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
      content: `### If / Else
Use \`if\` to run code conditionally.

\`\`\`javascript
if (score > 10) {
  console.log('Winner');
} else {
  console.log('Try again');
}
\`\`\`
`
    },
    {
      id: 'js-m5',
      title: 'Functions (Reusable Code)',
      type: 'article',
      readTime: '7 min',
      content: `### Functions
Functions let you bundle logic and call it later.

\`\`\`javascript
function greet(name) {
  return 'Hello ' + name;
}
\`\`\`
`
    },
    {
      id: 'js-m6',
      title: 'Collections (Arrays)',
      type: 'practice',
      theory: `### Arrays
Arrays store ordered lists of values.

\`\`\`javascript
const party = ['Warrior', 'Mage', 'Rogue'];
console.log(party[0]); // Warrior
\`\`\`
`,
      instruction: 'Step 1: Create an array named `party` with three elements.\nStep 2: Add "Warrior", "Mage", and "Rogue" to the array.\nStep 3: Log the first member (index 0) using `console.log(party[0])`.',
      initialCode: '// Assemble your party\n',
      language: 'javascript',
      expectedOutput: 'Warrior',
      requiredSyntax: /\[\s*['\"]Warrior['\"],/,
      hints: [
        'Create the array: const party = ["Warrior", "Mage", "Rogue"]',
        'Remember JavaScript uses 0-based indexing like Python',
        'Log the first element: console.log(party[0])'
      ],
      solution: 'const party = ["Warrior", "Mage", "Rogue"];\nconsole.log(party[0]);'
    },
    {
      id: 'js-m7',
      title: 'DOM & Events (Making Pages Interactive)',
      type: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      duration: '8:20',
      description: 'How to select elements, respond to clicks, and change the page dynamically.'
    },
    {
      id: 'js-m8',
      title: 'Async & Fetch (Talking to Servers)',
      type: 'article',
      readTime: '6 min',
      content: `### Fetch and Promises
Use \`fetch()\` to request data from APIs. Promises and \`async/await\` help manage asynchronous work.

\`\`\`javascript
async function getData() {
  const res = await fetch('https://api.example.com/data');
  const json = await res.json();
  console.log(json);
}
\`\`\`
`
    },
    {
      id: 'js-m9',
      title: 'Final Project: Mini App',
      type: 'practice',
      theory: `### Build a Tiny App
Combine DOM, events, and functions to build a small interactive app (e.g., a todo list or counter). Keep it simple and focused.
`,
      instruction: 'Step 1: Create a button in the HTML editor.\nStep 2: Create a variable to track the counter.\nStep 3: Add an event listener to increment and display the number.',
      initialCode: '// Hook up a button with an event listener\n',
      language: 'javascript',
      hints: [
        'Create a counter variable: let count = 0',
        'Select the button: const button = document.querySelector("button")',
        'Add an event listener: button.addEventListener("click", () => { count++; console.log(count); })'
      ],
      solution: 'let count = 0;\nconst button = document.querySelector("button");\nbutton.addEventListener("click", () => {\n  count++;\n  console.log(count);\n});'
    }
  ]
};