# Docker Made Easy

An interactive tutorial that teaches Docker from the ground up. Learn how containers actually work under the hood through hands-on simulations.

## What You'll Learn

- **The Problem** — Why containers exist and what they solve
- **Container Basics** — Images, containers, and the Docker CLI
- **Images & Layers** — How Dockerfiles build layered images and caching
- **Process Isolation** — Linux namespaces and how containers isolate processes
- **Resource Limits** — Cgroups and controlling CPU/memory
- **Storage** — Union filesystems and how container storage works
- **Networking** — Bridge networks, port mapping, and container communication
- **Orchestration** — Scaling with Docker Compose and Kubernetes concepts
- **Architecture** — Client-server model, containerd, and runc

## Getting Started

Visit the live site or run locally:

```bash
git clone https://github.com/mraza007/learn-docker.git
cd learn-docker
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start learning.

## Tech Stack

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS
- anime.js for animations
- Zustand for progress tracking

## Contributing

PRs welcome. Run `npm run build` to check for errors before submitting.
