import { iconMap } from '$lib/constants/icon-map';

/**
 * Get SVG content for the given icon name
 * @param iconName - The name of the icon to retrieve
 * @returns The SVG content string or undefined if not found
 */
export function getSvgContent(iconName: string): string | undefined {
  return iconMap[iconName];
}

/**
 * Process SVG content for use as favicon
 * @param svgContent - Raw SVG content
 * @param color - Fill color for the SVG (defaults to current theme primary color)
 * @returns Processed SVG with proper fill color
 */
function processSvgForFavicon(svgContent: string, color: string): string {
  // Remove existing fill and currentColor attributes, set a solid color
  let processedSvg = svgContent
    .replace(/fill="currentColor"/g, `fill="${color}"`)
    .replace(/fill="[^"]*"/g, `fill="${color}`)
    .replace(/<path[^>]*>/g, (match) => {
      // Ensure all path elements have the fill color
      if (!match.includes('fill=')) {
        return match.replace('<path', `<path fill="${color}"`);
      }
      return match;
    });

  // Add explicit fill to svg element if it doesn't exist
  if (!processedSvg.includes('<svg') || !processedSvg.includes('fill=')) {
    processedSvg = processedSvg.replace('<svg', `<svg fill="${color}"`);
  }

  return processedSvg;
}

/**
 * Get the current CSS --color-primary variable value
 * @returns The CSS variable value or fallback color
 */
export function getPrimaryColor(): string {
  if (typeof window === 'undefined') return '#e3ed70';

  const computedStyle = getComputedStyle(document.documentElement);
  const colorValue = computedStyle.getPropertyValue('--color-primary').trim();

  return colorValue || '#e3ed70';
}

/**
 * Generate a favicon data URI from an icon name
 * @param iconName - The name of the icon to use
 * @param color - Fill color for the icon (defaults to current CSS primary color)
 * @returns Data URI string for use in link[rel="icon"] or null if icon not found
 */
export function generateFaviconDataUri(iconName: string, color?: string): string | null {
  const svgContent = getSvgContent(iconName);
  if (!svgContent) {
    return null;
  }

  const faviconColor = color || getPrimaryColor();
  const processedSvg = processSvgForFavicon(svgContent, faviconColor);

  // URL encode the SVG for use in data URI
  const encodedSvg = encodeURIComponent(processedSvg);

  return `data:image/svg+xml,${encodedSvg}`;
}
