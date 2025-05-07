export type StructuredCloneable =
  | string
  | number
  | boolean
  | null
  | undefined
  | StructuredCloneable[]
  | { [key: string]: StructuredCloneable }
  | ArrayBuffer
  | Blob
  | File
  | FileList
  | Map<StructuredCloneable, StructuredCloneable>
  | Set<StructuredCloneable>
  | Date
  | RegExp
  | ImageData
  | DataView
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

export type Res = {
  headers?: Headers;
  status?: number;
  statusText?: string;
};

export type Methods = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type Runtime = 'browser' | 'extension';

export type Req = Res & {
  route: string;
  method: Methods;
  body: StructuredCloneable;
  searchParams: URLSearchParams;
  params: Record<string, string>;
};

export type ClientRequest = {
  route: string;
  method: Methods;
  body?: StructuredCloneable;
  headers?: [string, string][];
};

export type ClientResponse = {
  body?: StructuredCloneable;
  headers?: Headers;
  status: number;
  statusText: string;
  json: () => Promise<Object | undefined | Array<Object>>;
  text: () => Promise<string>;
};

export type Handler = (req: Req, res: ResponseHelper) => void;
export type Body = string | ArrayBuffer | Blob | FormData | URLSearchParams;

export type ResponseHelper = {
  (body: Body, opts?: Res): void;
} & {
  json: (body: StructuredCloneable, opts?: Res) => void;
  text: (body: string, opts?: Res) => void;
};
