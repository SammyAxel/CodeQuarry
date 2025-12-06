import React from 'react';
import { Cpu } from 'lucide-react';

export const cCourse = {
  id: 'c-101',
  title: 'C Commandos',
  description: 'The grandfather of modern languages. Managing memory like a boss.',
  icon: <Cpu className="w-8 h-8 text-purple-400" />,
  level: 'Silver',
  modules: [
    {
      id: 'c-m1',
      title: 'The Skeleton',
      theory: `### Structure
C is strict. Every program needs a \`main\` function.

\`\`\`c
#include <stdio.h>

int main() {
  printf("Hello");
  return 0;
}
\`\`\`
`,
      instruction: 'Step 1: Use the `printf()` function inside the main function.\\nStep 2: Pass the string "System Online" as an argument.\\nStep 3: Run your code.',
      initialCode: '#include <stdio.h>\n\nint main() {\n    // printf goes here\n    return 0;\n}',
      language: 'c',
      expectedOutput: 'System Online',
      requiredSyntax: /printf/,
      hints: [
        'Inside main, add: printf("System Online");',
        'Remember to add a semicolon at the end of each statement',
        'C is more strict than Python or JavaScript - pay attention to syntax!'
      ],
      solution: '#include <stdio.h>\n\nint main() {\n    printf("System Online");\n    return 0;\n}'
    }
  ]
};