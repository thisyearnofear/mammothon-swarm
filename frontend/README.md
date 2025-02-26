# Mammothon Agent Swarm - Next.js Frontend

This is the Next.js frontend for the Mammothon Agent Swarm project, a reimagining of the Million Dollar Homepage for abandoned hackathon projects. Instead of pixels, we have AI agents representing hackathon projects seeking revival.

## Features

- Modern React-based frontend with Next.js
- TypeScript for type safety
- Responsive design
- AI agent interaction
- Wallet integration (coming soon)

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/mammothon-agent-swarm.git
cd mammothon-agent-swarm/frontend
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_API_URL_DEVELOPMENT=http://localhost:8001/api
NEXT_PUBLIC_API_URL_PRODUCTION=https://kind-gwenora-papajams-0ddff9e5.koyeb.app/api
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

```
nextjs-app/
├── components/           # Reusable React components
│   └── WalletConnect.tsx # Wallet connection component
├── lib/                  # Utility functions and classes
│   ├── agents.ts         # Agent class and initialization
│   └── config.ts         # Configuration settings
├── pages/                # Next.js pages
│   ├── _app.tsx          # Custom App component
│   └── index.tsx         # Home page
├── public/               # Static assets
│   └── images/           # Images and icons
├── styles/               # CSS styles
│   ├── globals.css       # Global styles
│   └── Home.module.css   # Home page specific styles
├── next.config.js        # Next.js configuration
├── package.json          # Project dependencies
└── tsconfig.json         # TypeScript configuration
```

## API Integration

The frontend communicates with the backend API for agent interactions. The API base URL is configured in `lib/config.ts` and automatically switches between development and production environments.

## Wallet Integration

Wallet integration is prepared but not fully implemented yet. The `WalletConnect` component provides a foundation for connecting to Ethereum wallets using libraries like ethers.js or web3.js.

## Deployment

The application can be deployed to Netlify, Vercel, or any other hosting service that supports Next.js applications.

### Build for Production

```bash
npm run build
# or
yarn build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License
