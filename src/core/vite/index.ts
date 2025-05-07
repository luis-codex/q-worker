import { writeFileSync } from 'node:fs';
import {type FunctionType } from './types';

const generateManifestPlugin: FunctionType = (props, output = 'dist') => [
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
            const manifest = await props();
            writeFileSync(outputDir, JSON.stringify(manifest, null, 2));
            console.log('Manifest file generated successfully.');
            break;
          default:
            throw new Error('Invalid props type. Expected object or function.');
        }
      } catch (error) {
        console.error('/nError generating manifest file/n:', error);
      }
    },
  },
];

export default generateManifestPlugin;
