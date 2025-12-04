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
The \`print()\` function is your way of sending a signal from the code to the console. It handles strings (text), numbers, and even math.

\`\`\`python
print("This is a string")
print(42)
print(10 + 5)
\`\`\`

Notice that text needs **quotes** (either single \`''\` or double \`""\`), but numbers do not.
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
      theory: `### Storing Data
Variables are like labeled boxes in a warehouse. You can put data in, take it out, or change it.

In Python, you don't need to specify the *type* of data (like \`int\` or \`string\`). Python figures it out. This is called **Dynamic Typing**.

\`\`\`python
# Creating variables
hero_name = "Link"
rupees = 50
is_alive = True

# Updating variables
rupees = rupees + 10
\`\`\`

**Naming Rules:**
1. Use \`snake_case\` (all lowercase with underscores).
2. Cannot start with a number.
3. No spaces.
`,
      instruction: 'Create a variable named `agent_id` and assign it the number 007 (just write 7). Then create a variable `status` and assign it "Active". Finally, print the `status`.',
      initialCode: '# Define your variables below\n',
      language: 'python',
      expectedOutput: 'Active',
      requiredSyntax: /agent_id\s*=\s*7[\s\S]*status\s*=\s*['"]Active['"][\s\S]*print\s*\(\s*status\s*\)/
    },
    {
      id: 'py-m4',
      title: 'Data Types & Math',
      type: 'practice',
      theory: `### The Big Three
1. **Strings (\`str\`):** Text. \`"Hello"\`
2. **Integers (\`int\`):** Whole numbers. \`42\`
3. **Floats (\`float\`):** Decimals. \`3.14\`

### Math Operations
- Add: \`+\`
- Subtract: \`-\`
- Multiply: \`*\`
- Divide: \`/\` (Always returns a float)
- Exponent (Power): \`**\` (e.g., \`2 ** 3\` is 8)
- Modulo (Remainder): \`%\` (e.g., \`10 % 3\` is 1)
`,
      instruction: 'Calculate the area of a square with side length 5. Create a variable `side = 5`, then print `side ** 2`.',
      initialCode: 'side = 5\n# Calculate area\n',
      language: 'python',
      expectedOutput: '25',
      requiredSyntax: /side\s*\*\*\s*2/
    },
    {
      id: 'py-m5',
      title: 'The Gatekeeper (Conditionals)',
      type: 'practice',
      theory: `### If, Elif, Else
Code isn't just a straight line. It branches. We use logic to choose which path to take.

**Key Syntax:**
1. The **Condition** (returns True/False).
2. The **Colon** \`:\` (starts the block).
3. The **Indentation** (defines what is inside the block).

\`\`\`python
score = 85

if score >= 90:
    print("A Grade")
elif score >= 80:
    print("B Grade")
else:
    print("Try again")
\`\`\`
`,
      instruction: 'Write an if/else block. If `battery` is greater than 20, print "Green". Else, print "Red".',
      initialCode: 'battery = 15\n\n# Write logic here\n',
      language: 'python',
      expectedOutput: 'Red',
      requiredSyntax: /if\s+battery\s*>\s*20\s*:[\s\S]*print\s*\(\s*['"]Green['"]\s*\)[\s\S]*else\s*:[\s\S]*print\s*\(\s*['"]Red['"]\s*\)/
    },
    {
      id: 'py-m6',
      title: 'The Inventory (Lists)',
      type: 'practice',
      theory: `### Lists
A List is an ordered collection of items. In other languages, these are called Arrays.

\`\`\`python
# Creating a list
inventory = ["Sword", "Shield", "Potion"]

# Accessing items (Index starts at 0!)
print(inventory[0]) # Prints "Sword"

# Adding items
inventory.append("Map")
\`\`\`
`,
      instruction: 'Create a list called `party` with three names: "Warrior", "Mage", "Rogue". Then print the first member (index 0).',
      initialCode: '# Assemble your party\n',
      language: 'python',
      expectedOutput: 'Warrior',
      requiredSyntax: /party\s*=\s*\[['"]Warrior['"],\s*['"]Mage['"],\s*['"]Rogue['"]\][\s\S]*print\s*\(\s*party\[0\]\s*\)/
    },
    {
      id: 'py-m7',
      title: 'The Infinite Loop (Loops)',
      type: 'practice',
      theory: `### For Loops
The \`for\` loop is used to iterate over a sequence (like a list or a range of numbers).

\`\`\`python
# Loop through a range (0 to 4)
for i in range(5):
    print(i)

# Loop through a list
loot = ["Gold", "Silver"]
for item in loot:
    print("Found: " + item)
\`\`\`
`,
      instruction: 'You have a list of `enemies`. Write a for loop that prints each enemy name.',
      initialCode: 'enemies = ["Goblin", "Orc", "Dragon"]\n\n# Write your loop\n',
      language: 'python',
      expectedOutput: 'GoblinOrcDragon', // Concatenated output check
      requiredSyntax: /for\s+\w+\s+in\s+enemies\s*:[\s\S]*print\s*\(\s*\w+\s*\)/
    },
    {
      id: 'py-m8',
      title: 'The Spellbook (Functions)',
      type: 'practice',
      theory: `### Defining Functions
Functions allow you to reuse code. You define them once, and call them whenever you need.

**Syntax:**
- \`def\`: Keywords to start.
- \`name()\`: Name of the function.
- \`return\`: Passes data back to where it was called.

\`\`\`python
def double_it(number):
    return number * 2

result = double_it(10)
print(result) # 20
\`\`\`
`,
      instruction: 'Define a function named `heal` that takes `hp` as an argument and prints "Restored". Then call the function with any number.',
      initialCode: '# Define the spell\n',
      language: 'python',
      expectedOutput: 'Restored',
      requiredSyntax: /def\s+heal\s*\(hp\)\s*:[\s\S]*print\s*\(\s*['"]Restored['"]\s*\)[\s\S]*heal\s*\(\d+\)/
    }
  ]
};