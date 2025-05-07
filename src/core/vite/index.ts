import { writeFileSync } from 'node:fs';

export function manifestPlugin<T>(
  props: T | (() => T) | (() => Promise<T>),
  output = 'dist'
): any[] {
  return [
    {
      name: 'sw-worker',
      apply: 'build',
      async closeBundle() {
        const outputDir = `${output}/manifest.json`;
        try {
          switch (typeof props) {
            case 'object':
              writeFileSync(outputDir, JSON.stringify(props, null, 2));
              console.log('Manifest file generated successfully.');
              break;
            case 'function':
              const manifest = await (props as () => T | Promise<T>)();
              writeFileSync(outputDir, JSON.stringify(manifest, null, 2));
              console.log('Manifest file generated successfully.');
              break;
            default:
              throw new Error(
                'Invalid props type. Expected object or function.'
              );
          }
        } catch (error) {
          console.error('\nError generating manifest file\n:', error);
        }
      },
    },
  ];
}
