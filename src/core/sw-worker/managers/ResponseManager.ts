import type {
  Body,
  Res,
  ResponseHelper,
  Runtime,
} from '../types/types';

export class ResponseManager {
  private runtime?: Runtime;

  constructor(runtime?: Runtime) {
    this.runtime = runtime;
  }

  sendResponse(body: Body, opts?: Res) {
    const response = {
      body,
      headers: opts?.headers
        ? Object.fromEntries(opts.headers.entries() )
        : undefined,
      status: opts?.status ?? 200,
      statusText: opts?.statusText ?? 'OK',
    };

    switch (this.runtime) {
      case 'browser':
        self.postMessage(response);
        break;
      case 'extension':
        chrome.runtime.sendMessage(response);
        break;
      default:
        throw new Error('Invalid runtime');
    }
  }

  createResponseHelper(): ResponseHelper {
    return Object.assign(this.sendResponse.bind(this), {
      json: (body: any, opts?: Res) => {
        this.sendResponse(JSON.stringify(body), opts);
      },
      text: (body: string, opts?: Res) => {
        this.sendResponse(body, opts);
      },
    });
  }

  getRuntime(): Runtime | undefined {
    return this.runtime;
  }
}
