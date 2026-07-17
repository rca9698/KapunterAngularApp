import { HttpRequest } from '@angular/common/http';

/**
 * Kapunter uses POST for reads and writes. Classify write/activity actions by API name.
 * Read/list endpoints stay unrestricted so polls and refreshes are not blocked.
 */
export function isActivityMutationRequest(req: HttpRequest<unknown>): boolean {
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return false;
  }

  const action = apiActionName(req.url);
  if (!action) {
    return method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
  }

  if (/^(Get|List|View)/i.test(action)) {
    return false;
  }
  if (/GetToken/i.test(action)) {
    return false;
  }

  return true;
}

export function activityRequestKey(req: HttpRequest<unknown>): string {
  const method = req.method.toUpperCase();
  const url = req.urlWithParams.split('?')[0].toLowerCase();
  return `${method}|${url}|${bodyFingerprint(req.body)}`;
}

function apiActionName(url: string): string {
  const path = url.split('?')[0];
  const slash = path.lastIndexOf('/');
  return slash >= 0 ? path.substring(slash + 1) : path;
}

function bodyFingerprint(body: unknown): string {
  if (body == null) {
    return '';
  }
  if (typeof body === 'string') {
    return body;
  }
  if (body instanceof FormData) {
    const parts: string[] = [];
    body.forEach((value, key) => {
      if (typeof File !== 'undefined' && value instanceof File) {
        parts.push(`${key}=file:${value.name}:${value.size}:${value.lastModified}`);
      } else {
        parts.push(`${key}=${String(value)}`);
      }
    });
    return parts.sort().join('&');
  }
  try {
    return JSON.stringify(body);
  } catch {
    return String(body);
  }
}
