# Claude Development Notes

## Package Manager
This project uses **pnpm** as the package manager. Always use pnpm commands:
- `pnpm install` - Install dependencies
- `pnpm build` - Build the application
- `pnpm deploy` - Deploy to Cloudflare Workers
- `pnpm dev` - Start development server

## Build and Deploy
- Build command: `pnpm build`
- Deploy command: `pnpm deploy` 
- The deploy script automatically runs build first

## Architecture
- Chat widget built with React and deployed as Cloudflare Workers
- Uses Vite for bundling
- Widget is deployed as a standalone JavaScript file at `/dist/widget.js`