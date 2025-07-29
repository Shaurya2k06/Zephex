# Zephex Frontend

**React frontend for the Zephex encrypted messaging application**

A modern, responsive web application built with React, TypeScript, and Vite for the Zephex decentralized messaging platform.

## 🎨 Features

- **Comic Book UI**: Unique comic-style design with vibrant colors and animations
- **Wallet Integration**: Seamless MetaMask connection and authentication
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern Animations**: Smooth transitions using Framer Motion
- **Type Safety**: Full TypeScript implementation
- **Fast Development**: Vite for instant hot module replacement

## 🛠 Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Lightning-fast build tool and dev server
- **TailwindCSS 4** - Utility-first CSS framework
- **Ethers.js 6** - Ethereum wallet and contract interaction
- **Framer Motion** - Production-ready motion library
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

## 🏗 Architecture

### Component Structure
```
src/
├── components/
│   ├── LandingScreen.tsx      # Welcome/intro page
│   ├── ChatApplication.tsx    # Main messaging interface
│   └── magicui/              # Custom UI components
│       ├── comic-text.tsx    # Comic book style text
│       └── dot-pattern.tsx   # Animated background
├── contexts/
│   └── WalletContext.tsx     # Wallet state management
├── App.tsx                   # Main app with routing
├── App.css                   # Global styles
└── main.tsx                  # Application entry point
```

### State Management
- **WalletContext**: Manages MetaMask connection state
- **React State**: Component-level state for UI interactions
- **Local Storage**: Persists user preferences

### Styling System
- **TailwindCSS**: Utility classes for rapid UI development
- **CSS Custom Properties**: Dynamic theming and animations
- **Responsive Design**: Mobile-first approach with breakpoint system

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- MetaMask browser extension

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server
The app will be available at `http://localhost:5173` with hot module replacement enabled.

## 🎨 UI Components

### Landing Screen
- **Hero Section**: Comic-style title with animated effects
- **Feature Cards**: Highlighting key app features
- **CTA Button**: "Get Started" with hover animations
- **Background**: Animated dot pattern overlay

### Wallet Connection
- **MetaMask Integration**: One-click wallet connection
- **Loading States**: Smooth connecting animation
- **Error Handling**: User-friendly error messages
- **Back Navigation**: Return to landing page option

### Magic UI Components

#### Comic Text
```tsx
<ComicText 
  variant="title" 
  className="text-6xl font-bold"
>
  ZEPHEX
</ComicText>
```

#### Dot Pattern
```tsx
<DotPattern 
  className="opacity-30"
  width={20}
  height={20}
/>
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:
```env
VITE_INFURA_PROJECT_ID=your_infura_id
VITE_CONTRACT_ADDRESS=deployed_contract_address
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

### Vite Configuration
The app uses custom Vite configuration for:
- **TailwindCSS Integration**: Automatic CSS processing
- **TypeScript Support**: Full type checking
- **Development Optimizations**: Fast refresh and HMR

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px+

### Adaptive Features
- **Navigation**: Hamburger menu on mobile
- **Typography**: Responsive font scaling
- **Layout**: Flexible grid systems
- **Touch Targets**: Minimum 44px for mobile

## 🎭 Animations

### Framer Motion Integration
- **Page Transitions**: Smooth route changes
- **Component Animations**: Enter/exit effects
- **Hover States**: Interactive feedback
- **Loading Indicators**: Engaging wait states

### CSS Animations
- **Bounce Effects**: Playful element movement
- **Glow Animations**: Attention-grabbing highlights
- **Float Motion**: Subtle floating elements
- **Pulse Effects**: Breathing button states

## 🧪 Testing

### Test Setup
```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Testing Strategy
- **Component Tests**: React Testing Library
- **Integration Tests**: Wallet connection flows
- **E2E Tests**: User journey validation
- **Visual Tests**: Screenshot comparison

## 📦 Build & Deployment

### Production Build
```bash
# Create optimized build
npm run build

# Analyze bundle size
npm run build:analyze
```

### Build Optimization
- **Code Splitting**: Automatic route-based chunks
- **Tree Shaking**: Dead code elimination
- **Asset Optimization**: Image and font compression
- **Caching**: Long-term cache headers

### Deployment Options
- **Vercel**: Recommended for React apps
- **Netlify**: Static site deployment
- **GitHub Pages**: Free hosting option
- **IPFS**: Decentralized hosting

## 🔌 Wallet Integration

### MetaMask Connection
```tsx
const { connect, disconnect, account, isConnecting } = useWallet();

// Connect wallet
await connect();

// Get user address
console.log(account);
```

### Supported Wallets
- **MetaMask**: Primary wallet support
- **WalletConnect**: Mobile wallet compatibility
- **Coinbase Wallet**: Additional option

### Web3 Interactions
- **Contract Calls**: Read/write operations
- **Transaction Signing**: Message authentication
- **Network Switching**: Sepolia testnet support

## 🎨 Theming

### Color Palette
```css
:root {
  --primary-blue: #3b82f6;
  --primary-purple: #8b5cf6;
  --accent-pink: #ec4899;
  --accent-orange: #f97316;
  --comic-yellow: #fbbf24;
}
```

### Typography
- **Headers**: Comic Sans inspired fonts
- **Body**: Clean, readable sans-serif
- **Code**: Monospace for technical content

## 🚧 Development Status

### ✅ Completed
- Landing page with comic aesthetics
- Wallet connection system
- Responsive design implementation
- Animation system setup
- Component architecture

### 🔄 In Progress
- Chat interface implementation
- IPFS client integration
- Message encryption/decryption
- Real-time updates

### 📋 Planned
- Group chat functionality
- File attachment support
- Advanced settings panel
- Mobile app version

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Implement changes with tests
3. Ensure TypeScript compliance
4. Test responsive design
5. Submit pull request

### Code Standards
- **ESLint**: Enforced linting rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking
- **Accessibility**: WCAG 2.1 compliance

## 📚 Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Guide](https://www.framer.com/motion)
- [Ethers.js Documentation](https://docs.ethers.org)

---

**Part of the Zephex decentralized messaging ecosystem** 🚀
