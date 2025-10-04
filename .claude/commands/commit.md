# commit - Automated commit with smart message generation

## Tasks

### 1. Generate commit message

- Analyze the changes and create a concise, descriptive message in English
- Use conventional format: `type: brief description`
- Examples: `feat: add user auth`, `fix: resolve API timeout`, `docs: update setup guide`
- **IMPORTANT: Use ONLY a single, concise sentence - NO additional details, bullet points, or multi-line descriptions**
- **DO NOT add Claude Code attribution or Co-Authored-By lines**

### 2. Execute git commands

   ```bash
   git add .
   git commit -m "[generated message]"
   ```
