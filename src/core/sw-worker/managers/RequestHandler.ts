import { ResponseManager } from './ResponseManager';
import { RouteManager } from './RouteManager';
import { parseParamsAndSearchParams } from '../../../utils/pathUtils';
import type { Req } from '../types/types';

export class RequestHandler {
  private routeManager: RouteManager;
  private responseManager: ResponseManager;

  constructor(routeManager: RouteManager, responseManager: ResponseManager) {
    this.routeManager = routeManager;
    this.responseManager = responseManager;
  }

  handleRequest(data: Req) {
    const { body, headers, method, route, status, statusText } = data;
    const { params, searchParams } = parseParamsAndSearchParams(route);
    const req: Req = {
      route,
      method,
      headers: new Headers(headers),
      body,
      status,
      statusText,
      params,
      searchParams,
    };
    this.handleReq(req);
  }

  private async handleReq(event: Req) {
    const { route, method } = event;
    const handler = this.routeManager.findHandler(route, method);

    if (handler) {
      const responseHelper = this.responseManager.createResponseHelper();
      try {
        handler(event, responseHelper);
      } catch (error) {
        console.error('Error in the handler:', error);
        this.responseManager.sendResponse(
          JSON.stringify({ error: 'Internal Worker Error' }),
          {
            headers: new Headers({ 'Content-Type': 'application/json' }),
            status: 500,
            statusText: 'Internal Worker Error',
          }
        );
      }
    } else {
      this.responseManager.sendResponse(
        JSON.stringify({ error: 'Not Found' }),
        {
          headers: new Headers({ 'Content-Type': 'application/json' }),
          status: 404,
          statusText: 'Not Found',
        }
      );
    }
  }
}
