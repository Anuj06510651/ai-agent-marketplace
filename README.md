# AI Agent Marketplace

A small React + Vite project.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

Open http://localhost:5173/ in your browser.

## To create a GitHub repository and push

Replace USERNAME and REPO with your GitHub username and desired repo name.

1. Create the repository on GitHub (web UI) or using the GitHub CLI:

```bash
# using gh (recommended if authenticated):
gh repo create USERNAME/REPO --public --source=. --remote=origin --push --confirm
```

2. Or add remote manually and push:

```bash
git remote add origin git@github.com:USERNAME/REPO.git
# or HTTPS
# git remote add origin https://github.com/USERNAME/REPO.git
git branch -M main
git push -u origin main
```

## Invite a collaborator (your friend)

- Web UI: Go to the repository on GitHub → Settings → Collaborators and teams → Add people → enter their GitHub username and invite.

- CLI (example using `gh api`):

```bash
# replace OWNER, REPO, and FRIEND_USERNAME
gh api -X PUT /repos/OWNER/REPO/collaborators/FRIEND_USERNAME -f permission=push
```

