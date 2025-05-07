import { type PluginOption } from 'vite';

export type Manifest = chrome.runtime.ManifestV3 | chrome.runtime.ManifestV2;
export type Props = Manifest | (() => Manifest) | (() => Promise<Manifest>);
export type FunctionType = (props: Props, output?: string) => PluginOption[];
