# IP Calc - Advanced IP Address Calculator

A comprehensive, modern web application for IP address calculations, subnet analysis, and network planning. Built with SvelteKit and Tailwind CSS.

![IP Calc Screenshot](https://via.placeholder.com/800x400/3b82f6/ffffff?text=IP+Calc+-+Advanced+Network+Calculator)

## ✨ Features

### 🔢 Subnet Calculator
- **Comprehensive subnet analysis** with network, broadcast, and host calculations
- **Visual network topology** with interactive address range visualization
- **Binary representation** of subnet masks and addresses
- **Efficiency metrics** showing address utilization

### 🔄 CIDR Converter
- **Bidirectional conversion** between CIDR notation and subnet masks
- **Interactive slider** for easy CIDR selection
- **Common subnet presets** with usage recommendations
- **Real-time validation** with helpful error messages

### 🔀 IP Address Converter
- **Multi-format support**: Decimal, Binary, Hexadecimal, and Octal
- **IP class detection** with automatic classification
- **Live conversion** as you type
- **Copy-to-clipboard** functionality for easy sharing

### 📚 Network Reference
- **Network classes** (A, B, C) with detailed information
- **Reserved IP ranges** (RFC compliance)
- **Common subnet tables** with usage scenarios
- **Pro tips** for network planning

## 🚀 Technologies Used

- **SvelteKit** - Modern, fast web framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Lightning-fast build tool

## 🛠️ Installation & Setup

### Prerequisites
- Node.js v22.12.0 or higher
- npm v10.0.0 or higher

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd ip-calc

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Building for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
ip-calc/
├── src/
│   ├── lib/
│   │   ├── components/          # Reusable Svelte components
│   │   │   ├── IPInput.svelte
│   │   │   ├── CIDRInput.svelte
│   │   │   ├── SubnetCalculator.svelte
│   │   │   ├── CIDRConverter.svelte
│   │   │   ├── IPConverter.svelte
│   │   │   ├── NetworkVisualizer.svelte
│   │   │   └── InfoPanel.svelte
│   │   ├── utils/               # Utility functions
│   │   │   ├── ip-validation.ts
│   │   │   ├── ip-calculations.ts
│   │   │   └── ip-conversions.ts
│   │   ├── constants/           # Network constants
│   │   │   └── networks.ts
│   │   └── types/              # TypeScript definitions
│   │       └── ip.ts
│   ├── routes/                 # SvelteKit routes
│   │   ├── +layout.svelte
│   │   └── +page.svelte
│   └── app.css                # Global styles
├── static/                     # Static assets
├── tailwind.config.js         # Tailwind configuration
└── package.json              # Project dependencies
```

## 🎯 Key Features in Detail

### Modular Architecture
- **Short, focused functions** with clear responsibilities
- **Reusable components** following DRY principles
- **Type-safe** development with comprehensive TypeScript coverage
- **Clean separation** of concerns between utilities, components, and presentation

### User Experience
- **Dark/Light mode** with system preference detection
- **Responsive design** that works on all devices
- **Smooth animations** and transitions
- **Accessibility-first** design with ARIA labels and keyboard navigation
- **Real-time validation** with helpful error messages

### Performance Optimizations
- **Lazy loading** of calculations and visualizations
- **Efficient reactivity** with Svelte's reactive statements
- **Minimal bundle size** with tree-shaking
- **Fast development** with Vite's HMR

### Network Analysis Tools
- **Visual subnet representation** with color-coded address ranges
- **Binary mask breakdown** showing network vs host bits
- **Address utilization metrics** for efficiency analysis
- **RFC-compliant** reserved range detection

## 🔧 Development Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run check        # Type checking
npm run lint         # ESLint (if configured)
npm run format       # Prettier formatting
```

## 📊 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Network constants and standards from various RFCs
- Color schemes inspired by modern design systems
- Typography using Inter and Fira Code fonts
- Icons from Heroicons and Lucide

---

**Built with ❤️ for network engineers, developers, and IT professionals**