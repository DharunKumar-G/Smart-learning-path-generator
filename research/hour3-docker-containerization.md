# Hour 3: Docker & Containerization Research

## What is Docker?
Docker is a platform that packages applications into **containers** - lightweight, standalone units that include everything needed to run the software.

## Key Concepts Learned

### 1. Multi-Stage Builds
- Separate "build" stage from "runtime" stage
- Build stage has all dev dependencies (heavy)
- Runtime stage only has what's needed to run (light)
- Result: Smaller production images

### 2. Docker Compose
- Tool for defining multi-container applications
- Single `docker-compose.yml` file describes all services
- One command (`docker-compose up`) starts everything
- Handles networking between containers automatically

### 3. Environment Variables
- Never hardcode secrets in code
- Use `.env` files locally
- Pass via `environment:` in docker-compose
- `.env.example` shows required vars without real values

### 4. Container Networking
- Containers in same compose file share a network
- Can reference each other by service name
- Example: `db:5432` instead of `localhost:5432`

## Why Containerization?
- **Consistency** - Same environment everywhere
- **Isolation** - Apps don't interfere with each other
- **Portability** - Works on any machine with Docker
- **Scalability** - Easy to replicate containers

## Resources
- [Docker Docs - Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Compose Overview](https://docs.docker.com/compose/)
