# Theming System

The app includes a comprehensive theming system with 11 built-in themes ranging from dark/light modes to specialized aesthetics like cyberpunk and terminal themes.

## Theme Architecture

### CSS Custom Properties

All themes use CSS custom properties (CSS variables) defined in [`src/styles/variables.scss`](https://github.com/Lissy93/networking-toolbox/blob/main/src/styles/variables.scss). The base dark theme is defined in `:root`, with theme variations overriding specific properties.

```scss
:root {
  /* Background colors */
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --bg-tertiary: #21262d;

  /* Text colors */
  --text-primary: #c9d1d9;
  --text-secondary: #7d8590;
  --text-tertiary: #6272a4;

  /* Brand colors */
  --color-primary: #e3ed70;
  --color-primary-hover: #ffffa5;
  --color-primary-dark: #a8c237;
}
```

### Color System

The theming system provides a structured approach to colours:

<dl>
  <dt><strong>Semantic Colors</strong></dt>
  <dd>Action colours (success, warning, error, info) for consistent UI feedback</dd>

  <dt><strong>Background Hierarchy</strong></dt>
  <dd>Three-tier background system (primary, secondary, tertiary) for depth</dd>

  <dt><strong>Text Contrast</strong></dt>
  <dd>Multiple text colours ensuring accessibility across themes</dd>
</dl>

## Available Themes

The app includes 11 carefully crafted themes, each with unique characteristics:

### Standard Themes
- **Dark** - Default GitHub-inspired dark theme with monospace fonts
- **Light** - Clean minimal light theme with Inter font family
- **Light Purple** - Light theme with purple accents and enhanced accessibility

### Specialized Aesthetics
- **Cyberpunk** - Neon colors with CRT scanline effects and glitch animations
- **Terminal** - Classic green-on-black terminal aesthetic with zero rounded corners
- **Midnight** - Deep blues and purples with sophisticated typography
- **Arctic** - Cool, crisp theme with ice-blue accents

### Developer Themes
- **Muted Dark** - VS Code One Dark inspired theme
- **Solarized** - The scientifically designed color scheme beloved by developers
- **Ocean** - Calming blue-green palette
- **Purple** - Rich purple theme with elegant typography

## Theme Store

Theme management is handled by a Svelte store in [`src/lib/stores/theme.ts`](https://github.com/Lissy93/networking-toolbox/blob/main/src/lib/stores/theme.ts).

### Basic Usage

```javascript
import { theme } from '$lib/stores/theme';

// Set a theme
theme.setTheme('cyberpunk');

// Toggle between light/dark
theme.toggle();

// Check current theme
theme.subscribe(currentTheme => {
  console.log('Current theme:', currentTheme);
});
```

### Advanced Features

The theme store provides additional functionality:

- **Font Loading** - Automatically loads custom Google Fonts for themes
- **Persistence** - Saves theme choice to localStorage
- **Validation** - Only allows setting available themes
- **Configuration Access** - Provides theme metadata and font information

```javascript
// Get theme configuration
const config = theme.getThemeConfig('midnight');
// Returns: { id: 'midnight', name: 'Midnight', font: {...} }

// Get all available themes
const allThemes = theme.getAvailableThemes();
```

## Creating Custom Themes

### 1. Define CSS Variables

Add your theme variables to `variables.scss`:

```scss
.theme-mytheme,
html[data-theme='mytheme'] {
  --bg-primary: #your-color;
  --bg-secondary: #your-color;
  --text-primary: #your-color;
  /* ... other variables */
}
```

### 2. Register in Theme Store

Add your theme configuration to the `themes` array in `theme.ts`:

```javascript
{
  id: 'mytheme',
  name: 'My Theme',
  available: true,
  font: {
    name: 'Custom Font',
    url: 'https://fonts.googleapis.com/css2?family=Custom+Font',
    fallback: 'sans-serif'
  }
}
```

### Required Variables

Every theme must define these core variables:

| Variable | Purpose |
|----------|---------|
| `--bg-primary` | Main background |
| `--bg-secondary` | Card/panel backgrounds |
| `--text-primary` | Main text color |
| `--text-secondary` | Secondary text |
| `--color-primary` | Brand color |
| `--border-primary` | Default borders |

## Typography System

Each theme can specify custom fonts through the font configuration:

```javascript
font: {
  name: 'Font Display Name',
  url: 'Google Fonts URL',
  fallback: 'fallback-font-family'
}
```

The system automatically:
- Loads fonts via Google Fonts CDN
- Prevents duplicate font loading
- Provides fallback fonts for reliability
- Handles font loading errors gracefully

### Font Categories

Themes can override three font categories via CSS variables:

- `--font-heading` - Headings and titles
- `--font-body` - Body text and UI elements
- `--font-mono` - Code blocks and monospace elements

## Theme Effects

Some themes include special visual effects:

### Cyberpunk Theme
- CRT scanline animation overlay
- Glitch effects on hover
- Text shadow effects for neon appearance
- Custom keyframe animations

### Terminal Theme
- Zero border radius for blocky appearance
- Reduced spacing for compact layout
- CRT monitor glow shadows
- Pure monospace typography

The terminal theme contains exactly 16 colors, matching classic CRT monitors from the 1970s and 80s.

## Accessibility Considerations

All themes are designed with accessibility in mind:

- **Contrast Ratios** - Text colors meet WCAG AA standards
- **Focus Indicators** - Visible focus states across all themes
- **Color Independence** - No information conveyed by color alone
- **Reduced Motion** - Respects user's motion preferences

### Light Theme Accessibility

The light theme uses carefully chosen colors for optimal contrast:

```scss
/* Colors chosen so white label text meets AA standards */
--color-success: #15803d; /* white text ≥ 13:1 */
--color-warning: #a16207; /* white text ≥ 7:1 */
--color-error: #b91c1c;   /* white text ≥ 6.5:1 */
```

## Usage in Components

Components should use CSS variables rather than hardcoded colors:

```scss
.my-component {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);

  // Use action colors for semantic meaning
  &.error {
    color: var(--color-error);
  }
}
```

## Theme Transitions

Smooth transitions between themes are handled automatically:

```scss
/* Applied globally */
* {
  transition:
    background-color var(--transition-normal),
    color var(--transition-normal),
    border-color var(--transition-normal);
}
```

The transition duration is controlled by `--transition-normal` (0.2s), ensuring consistent timing across the app.