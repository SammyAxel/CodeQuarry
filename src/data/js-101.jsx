import React from 'react';
import { Code2 } from 'lucide-react';

export const jsCourse = {
  id: 'js-101',
  title: 'JavaScript for Rebels',
  description: 'Forget the boring stuff. Learn how to manipulate the DOM and break things effectively.',
  icon: <Code2 className="w-8 h-8 text-yellow-400" />,
  level: 'Beginner',
  modules: [
    {
      id: 'js-m1',
      title: 'The Mic Check (Output)',
      theory: `### Outputting Data
In JavaScript, we use the console to talk to the human (that's you). 

\`\`\`javascript
console.log("Your message here");
\`\`\`

Text must always be wrapped in quotes (single '' or double ""). Numbers don't need quotes.`,
      instruction: 'Use console.log() to print the string "Hello World" to the terminal.',
      initialCode: '// Your journey begins here\n',
      language: 'javascript',
      expectedOutput: 'Hello World',
      requiredSyntax: /console\.log/
    },
    {
      id: 'js-m2',
      title: 'The Container Store (Variables)',
      theory: `### Variables
Variables are just boxes with labels. In modern JS, we use \`const\` for things that won't change, and \`let\` for things that might.

\`\`\`javascript
const godMode = true;
let score = 0;
\`\`\`

Avoid \`var\`. It's the boomer way of declaring variables.`,
      instruction: 'Create a const variable named "vibe" and set it to "immaculate". Log it to the console.',
      initialCode: '// specific spelling matters here!\n\n',
      language: 'javascript',
      expectedOutput: 'immaculate',
      requiredSyntax: /(const|let)\s+vibe\s*=\s*['"]immaculate['"]/
    },
    {
      id: 'js-m3',
      title: 'Basic Math',
      theory: 'Math in JS is straightforward. `+`, `-`, `*`, `/`.',
      instruction: 'Log the result of 10 * 10.',
      initialCode: '// console.log( ... )',
      language: 'javascript',
      expectedOutput: '100',
      requiredSyntax: /\*/
    }
  ]
};