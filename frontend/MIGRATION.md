# Migration Guide: Static HTML/JS to Next.js

This document outlines the migration process from the original static HTML/JS application to the new Next.js application.

## Why Next.js?

Next.js offers several advantages over the original static HTML/JS approach:

1. **Server-Side Rendering (SSR)**: Improves performance and SEO
2. **API Routes**: Simplifies backend integration
3. **TypeScript Support**: Enhances code quality and developer experience
4. **Component-Based Architecture**: Promotes reusability and maintainability
5. **Built-in Routing**: Simplifies navigation
6. **Image Optimization**: Improves performance

## Project Structure Changes

### Original Structure (src/)

```
src/
├── static/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── index.html
├── api/
└── agents/
```

### New Structure (frontend/)

```
frontend/
├── components/
├── lib/
├── pages/
├── public/
└── styles/
```

## Migration Steps

### 1. Component Migration

- The HTML content from `index.html` was converted to React components in `pages/index.tsx`.
- Inline styles were moved to CSS modules and global styles.
- JavaScript functionality was converted to TypeScript and moved to the `lib` directory.

### 2. Static Assets

- Static assets (images, CSS) were copied from `src/static/` to `public/` using the `copy-assets.js` script.
- JavaScript files were rewritten as TypeScript modules in the `lib` directory.

### 3. API Integration

- The API integration was maintained using the same endpoints.
- The API base URL configuration was moved to `lib/config.ts`.
- Next.js API routes can be added in the future for additional functionality.

### 4. Wallet Integration

- A basic wallet connection component was added in `components/WalletConnect.tsx`.
- This component provides a foundation for integrating with Ethereum wallets.

## Running Both Versions Side by Side

To run both versions side by side for testing and comparison, use the `run-both.js` script:

```bash
node run-both.js
```

This will start:

- Original version: `python run_local.py` (http://localhost:8001)
- Next.js version: `cd frontend && npm run dev` (http://localhost:3000)

## Deployment

The Next.js version can be deployed using the provided `netlify.toml` configuration. The configuration includes:

- Build command: `npm run build`
- Publish directory: `.next`
- Redirects for API endpoints to the Koyeb backend

## Future Improvements

1. **Component Refactoring**: Break down the large index page into smaller, reusable components.
2. **State Management**: Implement a state management solution (Context API, Redux, Zustand) for more complex state.
3. **Full Wallet Integration**: Integrate with ethers.js or web3.js for complete wallet functionality.
4. **API Routes**: Add Next.js API routes for backend functionality that doesn't require the Python backend.
5. **Testing**: Add unit and integration tests using Jest and React Testing Library.
