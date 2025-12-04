import React from 'react';
import { Cpu } from 'lucide-react';

export const cCourse = {
  id: 'c-101',
  title: 'C Commandos',
  description: 'The grandfather of modern languages. Managing memory like a boss.',
  icon: <Cpu className="w-8 h-8 text-purple-400" />,
  level: 'Hardcore',
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
      instruction: 'Write a basic main function that prints "System Online".',
      initialCode: '#include <stdio.h>\n\nint main() {\n    // printf goes here\n    return 0;\n}',
      language: 'c',
      expectedOutput: 'System Online',
      requiredSyntax: /printf/
    }
  ]
};