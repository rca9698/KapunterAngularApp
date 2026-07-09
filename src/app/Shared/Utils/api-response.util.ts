export interface KapunterApiResponse<T = unknown> {
  returnStatus?: number;
  ReturnStatus?: number;
  returnMessage?: string;
  ReturnMessage?: string;
  returnList?: T[];
  ReturnList?: T[];
  returnVal?: T;
  ReturnVal?: T;
}

export function readApiStatus(response: KapunterApiResponse | null | undefined): number | undefined {
  return response?.returnStatus ?? response?.ReturnStatus;
}

export function readApiMessage(response: KapunterApiResponse | null | undefined): string | undefined {
  return response?.returnMessage ?? response?.ReturnMessage;
}

export function readApiList<T>(response: KapunterApiResponse<T> | null | undefined): T[] {
  return response?.returnList ?? response?.ReturnList ?? [];
}
