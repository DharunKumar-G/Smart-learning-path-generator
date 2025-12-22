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

## Hour 2: Complete Backend + React Frontend Setup
**Date:** December 22, 2025  
**Time:** 10:45 AM - 11:45 AM

### What I Did
- Built complete Express.js backend with TypeScript
- Created OpenAI service with custom prompts for roadmap & quiz generation
- Implemented Quiz routes with generate, submit, reset functionality
- Set up React + Vite + TypeScript frontend from scratch
- Configured Chakra UI with custom dark theme
- Built Zustand stores for auth and roadmap state management
- Created all API service layers (auth, roadmap, quiz)
- Built 6 complete pages: Home, Login, Register, Dashboard, CreateRoadmap, Roadmap

### Key Architecture Decisions

1. **Zustand over Redux** - Simpler API, less boilerplate, perfect for this app size

2. **Custom Theme Design:**
   - Dark mode by default (easier on eyes for learning)
   - Brand colors: Blue primary, Green accent
   - Glass morphism effects for modern look

3. **Service Layer Pattern:**
   - Axios instance with interceptors for auth tokens
   - Automatic 401 handling - redirects to login
   - Type-safe API responses using TypeScript generics

### Project Structure Created
```
/client
├── src/
│   ├── main.tsx          # App entry with providers
│   ├── App.tsx           # Routes & protected route logic
│   ├── theme.ts          # Chakra UI custom theme
│   ├── index.css         # Global styles & animations
│   ├── types/            # TypeScript interfaces
│   ├── stores/           # Zustand state management
│   ├── services/         # API layer (axios)
│   ├── components/       # Reusable components
│   └── pages/            # Route pages
```

### Challenges Faced
- No npm/node in the dev environment - had to manually create all React files
- Designing the roadmap page to handle nested accordion with progress tracking

### What I Learned
- **Zustand persist middleware** - Auto-saves to localStorage, great for auth
- **Chakra UI theming** - extendTheme is powerful for customization
- **Protected routes pattern** - Simple wrapper components for auth checks
- **Axios interceptors** - Request/response middleware for tokens and error handling

### Code Patterns I'm Proud Of

**Zustand Store with Persist:**
```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
```

**Protected Route Component:**
```typescript
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
```

### Resources Used
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Chakra UI Theme Customization](https://chakra-ui.com/docs/styled-system/customize-theme)
- [React Router v6 Auth](https://reactrouter.com/en/main/start/tutorial)
- [Framer Motion](https://www.framer.com/motion/)

### Next Hour Goals
- Install dependencies and test the full app
- Connect frontend to backend
- Test the AI roadmap generation flow
- Add loading states and error handling

---

*More entries will be added as development progresses...*
