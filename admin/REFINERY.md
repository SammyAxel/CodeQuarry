**Refinery Challenges (Admin Guide)**

Admins can now add one or more `refineryChallenges` to a module. Each challenge is an expected-output practice variant with additional constraints.

Fields per challenge:
- `id` (string): unique id
- `title` (string)
- `description` (string)
- `baseGems` (number): base gem reward for top score
- `tests` (array): list of `{ input: string, expectedOutput: string, public?: boolean }`. Input is passed as stdin or prompt/readline.
- `maxLines` (number): maximum allowed non-empty lines
- `forbiddenPatterns` (array): list of `{ name, regex, message }` — patterns to disallow
- `requiredPatterns` (array): list of `{ name, regex, message }` — patterns that must be present

Scoring
- Correctness (tests) is primary. Constraints (maxLines, patterns) modify the final score.

Migration
- Legacy `refineryCriteria` will be migrated into `refineryChallenges` when editing/saving a module or by running `npm run migrate:refinery` (recommended for bulk migration).
