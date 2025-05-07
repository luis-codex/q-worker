import type { Handler } from '../types/types';
import { normalizePath } from '../../../utils/pathUtils';

export class RouteManager {
  private routes: Map<string, Map<string, Handler>> = new Map();

  validateMethod(method: string) {
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE'];
    if (!validMethods.includes(method)) {
      throw new Error(`Invalid method: ${method}`);
    }
  }

  addRoute(method: string, path: string, handler: Handler) {
    this.validateMethod(method);
    const normalizedPath = normalizePath(path);
    if (!this.routes.has(normalizedPath)) {
      this.routes.set(normalizedPath, new Map());
    }
    const methodMap = this.routes.get(normalizedPath)!;
    if (methodMap.has(method)) {
      throw new Error(
        `The route ${method} ${normalizedPath} is already registered.`
      );
    }
    methodMap.set(method, handler);
  }

  findHandler(route: string, method: string): Handler | undefined {
    const normalizedRoute = normalizePath(route);
    return this.routes.get(normalizedRoute)?.get(method);
  }

  getRoutes() {
    return this.routes;
  }
}
