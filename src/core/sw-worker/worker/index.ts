import { RequestHandler } from '../managers/RequestHandler';
import { ResponseManager } from '../managers/ResponseManager';
import { RouteManager } from '../managers/RouteManager';
import type { Handler, Req } from '../types/types';
import { normalizePath } from '../../../utils/pathUtils';

export class SWWorker {
  private routeManager: RouteManager;
  private responseManager: ResponseManager;
  private requestHandler: RequestHandler;

  constructor(runtime?: 'browser' | 'extension') {
    this.routeManager = new RouteManager();
    this.responseManager = new ResponseManager(runtime);
    this.requestHandler = new RequestHandler(
      this.routeManager,
      this.responseManager
    );
  }

  get(path: string, handler: Handler) {
    this.routeManager.addRoute('GET', path, handler);
  }

  post(path: string, handler: Handler) {
    this.routeManager.addRoute('POST', path, handler);
  }

  put(path: string, handler: Handler) {
    this.routeManager.addRoute('PUT', path, handler);
  }

  delete(path: string, handler: Handler) {
    this.routeManager.addRoute('DELETE', path, handler);
  }

  route(path: string, app: SWWorker) {
    const normalizedBasePath = normalizePath(path);
    const routes = app.routeManager.getRoutes();
    for (const [route, handlers] of routes.entries()) {
      for (const [method, handler] of handlers.entries()) {
        this.routeManager.addRoute(
          method,
          `${normalizedBasePath}${route}`,
          handler
        );
      }
    }
  }

  listen() {
    switch (this.responseManager.getRuntime()) {
      case 'browser':
        self.onmessage = (event: { data: Req }) => {
          this.requestHandler.handleRequest(event.data as Req);
        };
        break;
      case 'extension':
        chrome.runtime.onMessage.addListener(
          (request, _sender, _sendResponse) => {
            this.requestHandler.handleRequest(request as Req);
            return true;
          }
        );
        break;
      default:
        throw new Error('Invalid runtime');
    }
  }
}

export default SWWorker;
