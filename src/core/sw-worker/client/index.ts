import type {
  ClientRequest,
  ClientResponse,
  Methods,
  StructuredCloneable,
} from '../types/types';
type Props =
  | {
      runtime: 'browser';
      url: URL;
      workerOptions?: WorkerOptions;
    }
  | {
      runtime: 'extension';
    };

export class SWWorkerClient {
  private runtime: 'browser' | 'extension';
  private worker: Worker | null = null;

  constructor(props: Props) {
    this.runtime = props.runtime;
    switch (props.runtime) {
      case 'browser':
        this.worker = new Worker(props.url, props.workerOptions);
        break;
    }
  }

  private async handleResponse(
    response: ClientResponse
  ): Promise<ClientResponse> {
    const { body, headers, status, statusText } = response;
    const headersObj = new Headers(headers);
    return {
      body,
      headers: headersObj,
      status,
      statusText,
      json: async () => {
        try {
          if (body) return JSON.parse(body as string);
          else return undefined;
        } catch (error) {
          throw new Error('Failed to parse JSON response');
        }
      },
      text: async () => {
        if (body instanceof ArrayBuffer) {
          return new TextDecoder().decode(body);
        } else if (body instanceof Blob) {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve(reader.result as string);
            };
            reader.onerror = () => {
              reject(new Error('Failed to read blob'));
            };
            reader.readAsText(body);
          });
        } else if (typeof body === 'string') {
          return body;
        }
        return '';
      },
    };
  }

  public async request(
    route: string,
    {
      method,
      body,
      headers,
    }: {
      method: Methods;
      body?: StructuredCloneable;
      headers?: HeadersInit;
    }
  ): Promise<ClientResponse> {
    const headersObj = Object.entries(headers || []);
    const message: ClientRequest = {
      route,
      method,
      body,
      headers: headersObj,
    };
    switch (this.runtime) {
      case 'browser':
        return new Promise((resolve, reject) => {
          if (!this.worker) {
            reject(new Error('Worker not initialized'));
            return;
          }
          this.worker.postMessage(message);
          const onMessage = (event: MessageEvent) => {
            const { data } = event;
            if (data.error) {
              reject(data.error);
              return;
            }
            const response = this.handleResponse(data);
            resolve(response);
          };
          this.worker.addEventListener('message', onMessage, { once: true });
        });
      case 'extension':
        return new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
              return;
            }
            if (response.error) {
              reject(response.error);
              return;
            }
            const clientResponse = this.handleResponse(response);
            resolve(clientResponse);
          });
        });

      default:
        throw new Error('Invalid runtime');
    }
  }
  /**
   * Terminate the worker
   * @description This method is used to terminate the worker. It is important to call this method when the worker is no longer needed to free up resources.
   */
  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  public get(route: string, headers?: HeadersInit) {
    return this.request(route, {
      method: 'GET',
      headers,
    });
  }

  public post(
    route: string,
    body?: StructuredCloneable,
    headers?: HeadersInit
  ) {
    return this.request(route, {
      method: 'POST',
      body,
      headers,
    });
  }

  public put(route: string, body?: StructuredCloneable, headers?: HeadersInit) {
    return this.request(route, {
      method: 'PUT',
      body,
      headers,
    });
  }

  public delete(
    route: string,
    body?: StructuredCloneable,
    headers?: HeadersInit
  ) {
    return this.request(route, {
      method: 'DELETE',
      body,
      headers,
    });
  }
}

export default SWWorkerClient;
