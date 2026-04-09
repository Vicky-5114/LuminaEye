# AI Smart Glasses - Landing Page

A modern, high-conversion landing page for the AI Smart Glasses product.

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

## Getting Started

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

## Project Structure

```
landing/
├── src/
│   ├── components/     # React components
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── FeatureCard.tsx
│   │   ├── TechStack.tsx
│   │   └── Footer.tsx
│   ├── App.tsx        # Main app component
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles
├── public/            # Static assets
├── index.html         # HTML template
└── package.json       # Dependencies
```

## Design Features

- **Glassmorphism UI** - Frosted glass effects with backdrop blur
- **Dark Mode Premium Theme** - Deep dark backgrounds with cyan/purple accents
- **Smooth Animations** - Framer Motion powered scroll and hover effects
- **Responsive Design** - Mobile-first approach
- **Accessibility** - Semantic HTML, focus states, reduced motion support

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#0A0A0F` | Page background |
| `surface` | `#111118` | Card backgrounds |
| `primary` | `#00D9FF` | Cyan accent |
| `accent` | `#9664FF` | Purple accent |
| `text-primary` | `#FFFFFF` | Main text |
| `text-secondary` | `#A1A1AA` | Secondary text |

## Deployment

The `dist` folder contains the static build. Deploy to any static hosting:

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
