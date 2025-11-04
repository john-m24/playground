# Create App Catalog Entry JSON

Analyze the GitHub repository at the provided URL and output a JSON file that I can copy and paste.

## Output Format

Output ONLY valid JSON matching this structure:

```json
{
  "id": "lowercase-hyphenated-repo-name",
  "name": "App Name",
  "description": "Brief description (1-2 sentences)",
  "repoUrl": "https://github.com/owner/repo",
  "defaultRunCommand": "shell command to run the app",
  "defaultPort": 8080,
  "setupInstructions": "Numbered list of setup steps",
  "requirements": ["docker", "docker-compose"],
  "deleteCommand": "cleanup command to stop and remove containers/processes"
}
```

## Required Fields
- `id`: lowercase, hyphenated repo name (e.g., `onyx-dot-app/onyx` → `onyx`)
- `name`: human-readable app name (from README title or repo name)
- `description`: 1-2 sentence description of what the app does
- `repoUrl`: full GitHub URL
- `deleteCommand`: cleanup command to stop and remove containers/processes (required)

## Optional Fields (include if detected)
- `defaultRunCommand`: shell command to run the app
- `defaultPort`: default port number
- `setupInstructions`: numbered list format (use `\n` for line breaks)
- `requirements`: array of required tools (e.g., `["docker", "docker-compose"]`)

## Detection Rules

**Run Command:**
- **Docker Compose**: If `docker-compose.yml` or `docker-compose.yaml` exists:
  ```bash
  if [ -f docker-compose.yml ]; then docker compose up; elif [ -f docker-compose.yaml ]; then docker compose up; elif [ -f deployment/docker_compose/docker-compose.yaml ]; then cd deployment/docker_compose && docker compose up; elif [ -f deployment/docker_compose/docker-compose.yml ]; then cd deployment/docker_compose && docker compose up; else echo "Docker Compose file not found. Please check the documentation."; fi
  ```
- **Node.js**: If `package.json` exists → `npm install && npm run dev` (or `npm start` if no dev script)
- **Python**: If `requirements.txt` exists → `pip install -r requirements.txt && python -m app || python app.py || python main.py`

**Port:**
- Detect from docker-compose.yml (check `services.*.ports`)
- Detect from package.json scripts/config
- Defaults: Docker Compose → `8080`, Node.js → `3000`, Python → `8000`

**Setup Instructions:**
- Extract from README sections: "Installation", "Setup", "Getting Started", "Quick Start", "Running", "Deployment"
- Format as numbered list with `\n` for line breaks
- Example: `"1. Install Docker\n2. Clone repository\n3. Run 'docker compose up'"`

**Requirements:**
- Docker Compose → `["docker", "docker-compose"]`
- Node.js → `["node", "npm"]`
- Python → `["python"]`
- Combine if multiple detected

**Delete Command:**
- **Docker Compose**: If `docker-compose.yml` or `docker-compose.yaml` exists:
  ```bash
  if [ -f docker-compose.yml ]; then docker compose down --rmi all -v; elif [ -f docker-compose.yaml ]; then docker compose down --rmi all -v; elif [ -f deployment/docker_compose/docker-compose.yaml ]; then cd deployment/docker_compose && docker compose down --rmi all -v; elif [ -f deployment/docker_compose/docker-compose.yml ]; then cd deployment/docker_compose && docker compose down --rmi all -v; fi
  ```
- **Node.js**: If `package.json` exists → `pkill -f "npm run dev" || pkill -f "node"` (or appropriate cleanup)
- **Python**: If Python project → `pkill -f "python.*app" || pkill -f "python.*main"` (or appropriate cleanup)
- **Generic**: Default cleanup command based on detected pattern

## Example

**Input:** `https://github.com/onyx-dot-app/onyx`

**Output:**
```json
{
  "id": "onyx",
  "name": "Onyx",
  "description": "Open Source AI Platform - AI Chat with advanced features that works with every LLM",
  "repoUrl": "https://github.com/onyx-dot-app/onyx",
  "defaultRunCommand": "if [ -f docker-compose.yml ]; then docker compose up; elif [ -f docker-compose.yaml ]; then docker compose up; elif [ -f deployment/docker_compose/docker-compose.yaml ]; then cd deployment/docker_compose && docker compose up; elif [ -f deployment/docker_compose/docker-compose.yml ]; then cd deployment/docker_compose && docker compose up; else echo \"Docker Compose file not found. Please check the Onyx documentation.\"; fi",
  "defaultPort": 8080,
  "setupInstructions": "Onyx uses Docker Compose for deployment.\n\n1. Ensure Docker and Docker Compose are installed\n2. Clone the repository (already done when downloading)\n3. Check for docker-compose.yml in the root or deployment/docker_compose/\n4. Run 'docker compose up' to start the services\n\nNote: Onyx may require additional configuration files or environment variables. Refer to the Onyx documentation for complete setup instructions.",
  "requirements": ["docker", "docker-compose"],
  "deleteCommand": "if [ -f docker-compose.yml ]; then docker compose down --rmi all -v; elif [ -f docker-compose.yaml ]; then docker compose down --rmi all -v; elif [ -f deployment/docker_compose/docker-compose.yaml ]; then cd deployment/docker_compose && docker compose down --rmi all -v; elif [ -f deployment/docker_compose/docker-compose.yml ]; then cd deployment/docker_compose && docker compose down --rmi all -v; fi"
}
```

**Analyze the repository and output ONLY the JSON - no explanations, no markdown code blocks, just the raw JSON I can copy and paste.**
