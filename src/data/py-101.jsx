import React from 'react';
import { Terminal } from 'lucide-react';

export const pyCourse = {
  id: 'py-101',
  title: 'Python Snakes',
  description: 'Data science, scripts, and automation. The language that reads like English.',
  icon: <Terminal className="w-8 h-8 text-blue-400" />,
  level: 'Beginner',
  modules: [
    {
        id: 'py-m0',
        title: 'Welcome to the Snake Pit',
        type: 'video', // <--- NEW TYPE
        // In real app: import videoFile from './assets/video.mp4'; videoUrl: videoFile
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 
        duration: '10:00',
        description: 'Before we code, let us understand the philosophy of Python.'
    },
    {
        id: 'py-m1',
        title: 'Why Python?',
        type: 'article', // <--- NEW TYPE
        readTime: '5 min',
        content: `
          <h2>The Zen of Python</h2>
          <p>Python isn't just a language; it's a lifestyle. It was created by Guido van Rossum and emphasizes code readability.</p>
          <h3>Key Principles:</h3>
          <ul>
            <li>Beautiful is better than ugly.</li>
            <li>Explicit is better than implicit.</li>
            <li>Simple is better than complex.</li>
          </ul>
          <p>We are going to stick to these rules as we mine for code.</p>
        `
    },
    {
      id: 'py-m2',
      title: 'Hiss World (Print)',
      theory: `### The Print Function
Python is famous for being clean. No semi-colons, no curly braces clutter.

\`\`\`python
print("Text goes here")
print(42)
\`\`\`
`,
      instruction: 'Use the print() function to output "Python is goated".',
      initialCode: '# Python code here\n',
      language: 'python',
      expectedOutput: 'Python is goated',
      requiredSyntax: /print/
    },
    {
      id: 'py-m3',
      title: 'Snake Case (Variables)',
      theory: `### Variables
Python variables are dynamic. You don't need to declare their type. Just name it and claim it.

Naming convention: Use \`snake_case\` (underscores), not \`camelCase\`.

\`\`\`python
my_score = 100
player_name = "Neo"
\`\`\`
`,
      instruction: 'Create a variable called player_name and set it to "ReadyOne". Then print the variable (not the string!).',
      initialCode: '# No semi-colons needed!\n',
      language: 'python',
      expectedOutput: 'ReadyOne',
      // STRICT CHECK: Must define variable AND print the variable name, not the string literal
      requiredSyntax: /player_name\s*=\s*['"]ReadyOne['"][\s\S]*print\s*\(\s*player_name\s*\)/
    },
    {
      id: 'py-m4',
      title: 'Quick Math (Exponents)',
      theory: `### Exponents
Standard math applies, but powers use double asterisks \`**\`.

\`\`\`python
# 2 to the power of 3
print(2 ** 3) 
\`\`\`
`,
      instruction: 'Print the result of 5 to the power of 2 using the ** operator.',
      initialCode: '# 5 squared is...\n',
      language: 'python',
      expectedOutput: '25',
      requiredSyntax: /\*\*/
    },
    {
      id: 'py-m5',
      title: 'Ghost Mode (Comments)',
      theory: `### Comments
Code is for humans first, computers second. Use comments to leave notes. In Python, we use the hashtag \`#\`.

\`\`\`python
# This line is ignored by the computer
print("Visible") # This part runs
\`\`\`
`,
      instruction: 'Write a comment that says "# Hidden" and then print "Visible".',
      initialCode: '# Write your comment here\n',
      language: 'python',
      expectedOutput: 'Visible',
      requiredSyntax: /#\s*Hidden/
    },
    {
      id: 'py-m6',
      title: 'The Inventory (Lists)',
      theory: `### Lists
Variables can hold multiple items using square brackets \`[]\`. This is called a List.

\`\`\`python
loot = ["Sword", "Potion", "Map"]
scores = [10, 20, 30]
\`\`\`
`,
      instruction: 'Create a list variable named "inventory" with at least one item. Then print "Bag Packed".',
      initialCode: '# inventory = ...\n',
      language: 'python',
      expectedOutput: 'Bag Packed',
      requiredSyntax: /inventory\s*=\s*\[.*\]/
    },
    {
      id: 'py-m7',
      title: 'Fork in the Road (If/Else)',
      theory: `### Conditionals
Logic flows based on conditions. Python uses indentation (tabs/spaces) to group code.

\`\`\`python
health = 10
if health < 20:
    print("Heal up!")
\`\`\`

Note the colon \`:\` at the end of the line!`,
      instruction: 'Write an if statement checking if 10 > 5. Inside it, print "Logic works".',
      initialCode: '# if 10 > 5:\n',
      language: 'python',
      expectedOutput: 'Logic works',
      requiredSyntax: /if\s+10\s*>\s*5\s*:/
    },
    {
      id: 'py-m8',
      title: 'Loop de Loop (For Loops)',
      theory: `### Loops
Repeat actions without rewriting code. The \`for\` loop is your best friend.

\`\`\`python
# Prints 0, 1, 2
for i in range(3):
    print(i)
\`\`\`
`,
      instruction: 'Write a for loop using range(3). Inside the loop, print "Repetition".',
      initialCode: '# for i in range(3):\n',
      language: 'python',
      expectedOutput: 'Repetition',
      requiredSyntax: /for\s+.*\s+in\s+range\(3\):/
    }
  ]
};