# Mammothon Frontend

This is the frontend for the Mammothon Agent Swarm project, built with Next.js.

## Features

- Modern React-based frontend with Next.js
- TypeScript for type safety
- Responsive design
- AI agent interaction
- Wallet integration (coming soon)

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment Options

This project supports multiple deployment options for your dynamic Next.js application:

### Quick Deployment with the Helper Script

We've included a deployment helper script that simplifies the process:

```bash
# Make sure you're in the frontend directory
cd frontend

# Make the script executable (if needed)
chmod +x deploy.sh

# Deploy to Vercel (recommended)
./deploy.sh vercel

# Or deploy with Docker locally
./deploy.sh docker

# Or build and push a Docker image
./deploy.sh docker-push

# Show all options
./deploy.sh help
```

### 1. Vercel (Recommended)

Vercel is the company behind Next.js and provides excellent support for Next.js applications with dynamic content.

```bash
# Make sure you're in the frontend directory
cd frontend

# Install Vercel CLI if needed
npm install -g vercel

# Login and deploy
vercel login
vercel
```

### 2. Docker Deployment

The project includes Docker support for containerized deployment:

```bash
# Make sure you're in the frontend directory
cd frontend

# Using Docker Compose
docker-compose up -d

# Or build and run manually
docker build -t mammothon-frontend .
docker run -p 3000:3000 mammothon-frontend
```

### 3. Other Platforms

The project can also be deployed to:

- Render
- Railway
- DigitalOcean App Platform
- Any platform that supports Node.js or Docker

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## CI/CD

The project includes GitHub Actions workflows for continuous integration and deployment. See the `.github/workflows` directory for details.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [Vercel Platform](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com/)

## License

This project is licensed under the terms of the license included in the repository.
