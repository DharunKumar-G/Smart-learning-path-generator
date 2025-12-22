# 📚 Learning Journey Log

This document tracks my learnings and progress while building the Smart Learning Path Generator. Each hour of development is documented here with key takeaways, challenges faced, and solutions discovered.

---

## Hour 1: Project Initialization & Setup
**Date:** December 22, 2025  
**Time:** 10:30 AM - 11:30 AM

### What I Did
- Cloned the repository and set up the basic monorepo structure
- Created `client` and `server` directories for separation of concerns
- Set up root `package.json` with npm workspaces for managing both apps
- Created comprehensive README with project overview

### Key Decisions Made

1. **Monorepo over separate repos** - Easier to maintain, share types between frontend and backend, single source of truth

2. **Tech Stack Choices:**
   - PostgreSQL over MongoDB: Better for relational data like users -> roadmaps -> weeks -> topics
   - Prisma as ORM: Type safety, great migrations, auto-generated client
   - Chakra UI: Accessible out of the box, great component library, easy theming
   - Vite over CRA: Way faster, better DX, smaller bundle size

3. **Folder structure** - Went with a feature-based structure rather than type-based. Keeps related code together.

### Challenges Faced
- Empty repo initially, had to structure everything from scratch
- Deciding between monorepo vs separate repos (went with monorepo for simplicity)

### What I Learned
- npm workspaces are super handy for monorepos - single `npm install` at root handles everything
- Setting up proper `.gitignore` early saves headaches later
- A good README is like a map - helps you and others understand what's going on

### Resources Used
- [npm Workspaces docs](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [Vite Getting Started](https://vitejs.dev/guide/)
- [Chakra UI Installation](https://chakra-ui.com/getting-started)

### Next Hour Goals
- Initialize React+Vite frontend with TypeScript
- Set up Chakra UI theming
- Initialize Express server with TypeScript
- Set up Prisma with PostgreSQL schema

---

*More entries will be added as development progresses...*
