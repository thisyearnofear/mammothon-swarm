# Deployment Guide

This document provides instructions for deploying the Mammothon Agent Swarm frontend to various platforms.

## Deploying to Vercel (Recommended)

Vercel is the company behind Next.js and provides excellent support for Next.js applications with dynamic content.

### Steps:

1. Install the Vercel CLI:

   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:

   ```bash
   vercel login
   ```

3. Deploy from the frontend directory:

   ```bash
   # Make sure you're in the frontend directory
   cd frontend

   # Deploy the current directory
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

### Alternative: Deploy directly from the Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Create a new project and import your GitHub repository
3. Configure the project:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Deploy the project

### Benefits of Vercel:

- Native support for Next.js
- Automatic HTTPS
- Global CDN
- Serverless functions support
- Environment variables management
- Preview deployments for PRs

## Docker Deployment

The project includes a Dockerfile for containerized deployment, which can be used with any platform that supports Docker.

### Using Docker Compose (Recommended for local development):

```bash
# Make sure you're in the frontend directory
cd frontend

# Build and start the container
docker-compose up -d
```

This will build and start the container in detached mode. To view logs:

```bash
docker-compose logs -f
```

To stop the container:

```bash
docker-compose down
```

### Building the Docker image manually:

```bash
# Make sure you're in the frontend directory
cd frontend

# Build the Docker image
docker build -t mammothon-frontend .
```

### Running the Docker container locally:

```bash
docker run -p 3000:3000 mammothon-frontend
```

### Deploying to platforms that support Docker:

1. **Google Cloud Run**:

   ```bash
   # Make sure you're in the frontend directory
   cd frontend

   # Deploy to Google Cloud Run
   gcloud run deploy mammothon-frontend --source . --platform managed --region us-central1
   ```

2. **AWS App Runner**:

   - Navigate to the frontend directory
   - Push your image to Amazon ECR
   - Create a new App Runner service using the ECR image

3. **Azure Container Apps**:

   ```bash
   # Make sure you're in the frontend directory
   cd frontend

   # Deploy to Azure Container Apps
   az containerapp up --name mammothon-frontend --resource-group myResourceGroup --source .
   ```

4. **DigitalOcean App Platform**:
   - Create a new App
   - Select "Dockerfile" as the deployment method
   - Connect your GitHub repository
   - Set the Source Directory to `/frontend`

## Alternative: Deploy to Render

Render is another excellent platform for deploying Next.js applications.

### Steps:

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables: Set the same environment variables as in your `.env.local` file

## Alternative: Deploy to Railway

Railway is a modern platform that makes it easy to deploy Next.js applications.

### Steps:

1. Create a new project on Railway
2. Connect your GitHub repository
3. Configure the service:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Environment Variables: Set the same environment variables as in your `.env.local` file

## Alternative: Deploy to DigitalOcean App Platform

DigitalOcean App Platform provides a simple way to deploy Next.js applications.

### Steps:

1. Create a new App on DigitalOcean App Platform
2. Connect your GitHub repository
3. Configure the service:
   - Source Directory: `frontend`
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - Environment Variables: Set the same environment variables as in your `.env.local` file

## Troubleshooting

If you encounter any issues during deployment, check the following:

1. Ensure all dependencies are correctly listed in `package.json`
2. Verify that your environment variables are correctly set
3. Check the build logs for any errors
4. Ensure that your API endpoint is correctly configured in `next.config.js`
5. If using a custom server, make sure it's compatible with the deployment platform
