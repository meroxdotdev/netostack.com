import { json } from '@sveltejs/kit';

export async function GET() {
  try {
    // @ts-expect-error - fs is available in Node.js server context
    const { readFileSync } = await import('fs');
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    return json({
      version: pkg.version,
      timestamp: Date.now(),
    });
  } catch {
    return json(
      {
        version: 'unknown',
        timestamp: Date.now(),
        error: 'Failed to read version',
      },
      { status: 500 },
    );
  }
}
