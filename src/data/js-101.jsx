import React from 'react';
import { Code2 } from 'lucide-react';

export const jsCourse = {
  id: 'js-101',
  title: 'JavaScript for Newbs',
  description: 'The backbone of the web. Make websites come alive with JS.',
  icon: <Code2 className="w-8 h-8 text-yellow-400" />,
  level: 'Beginner',
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
      instruction: 'Use `console.log()` to print the string "Hello World" to the terminal.',
      initialCode: '// Your journey begins here\n',
      language: 'javascript',
      expectedOutput: 'Hello World',
      requiredSyntax: /console\.log\s*\(/
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
      instruction: 'Read the article and then create a `const` named `vibe` with value "immaculate" and log it to the console in the practice module that follows.'
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
      instruction: 'Log the result of `10 * 10` using `console.log()`.',
      initialCode: '// console.log( ... )',
      language: 'javascript',
      expectedOutput: '100',
      requiredSyntax: /10\s*\*\s*10/
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
      instruction: 'Create an array `party` with `"Warrior"`, `"Mage"`, `"Rogue"` and log the first member.',
      initialCode: '// Assemble your party\n',
      language: 'javascript',
      expectedOutput: 'Warrior',
      requiredSyntax: /\[\s*['\"]Warrior['\"],/
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
      instruction: 'Create a counter with a button that increases a number on the page when clicked. You can edit `index.html` for structure and add JS in the practice area.',
      initialCode: '// Hook up a button with an event listener\n',
      language: 'javascript'
    }
  ]
};