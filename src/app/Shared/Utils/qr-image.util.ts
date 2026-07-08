/**
 * Build a public blob URL for an admin/user QR image.
 * Prefers stored qrPath from API when available.
 */
export function buildQrImageUrl(
  qrBasePath: string | undefined,
  documentDetailId?: string | null,
  fileExtension?: string | null,
  qrPath?: string | null
): string {
  if (qrPath?.trim()) {
    return qrPath.trim();
  }

  if (!qrBasePath || !documentDetailId?.trim()) {
    return '';
  }

  const base = qrBasePath.endsWith('/') ? qrBasePath : `${qrBasePath}/`;
  const ext = normalizeFileExtension(fileExtension);
  if (!ext) {
    return `${base}${documentDetailId.trim()}`;
  }

  return `${base}${documentDetailId.trim()}.${ext}`;
}

/** Legacy uploads stored blobs under a leading-slash folder name (/QR/...). */
export function buildLegacyQrBlobUrl(
  qrBasePath: string | undefined,
  documentDetailId?: string | null,
  fileExtension?: string | null
): string {
  if (!qrBasePath || !documentDetailId?.trim()) {
    return '';
  }

  const ext = normalizeFileExtension(fileExtension);
  const fileName = ext ? `${documentDetailId.trim()}.${ext}` : documentDetailId.trim();
  const match = qrBasePath.match(/^(https:\/\/[^/]+\/[^/]+)\//i);
  if (!match) {
    return '';
  }

  return `${match[1]}/%2FQR/${fileName}`;
}

export function buildQrImageUrlFromDetail(
  qrBasePath: string | undefined,
  detail?: { documentDetailId?: string | null; fileExtenstion?: string | null; qrPath?: string | null } | null
): string {
  if (!detail) {
    return '';
  }

  return buildQrImageUrl(
    qrBasePath,
    detail.documentDetailId,
    detail.fileExtenstion,
    detail.qrPath
  );
}

export function resolveQrImageUrl(
  qrBasePath: string | undefined,
  detail?: { documentDetailId?: string | null; fileExtenstion?: string | null; qrPath?: string | null } | null,
  preferLegacy = false
): string {
  const primary = buildQrImageUrlFromDetail(qrBasePath, detail);
  if (preferLegacy) {
    const legacy = buildLegacyQrBlobUrl(qrBasePath, detail?.documentDetailId, detail?.fileExtenstion);
    return legacy || primary;
  }

  return primary;
}

export function normalizeFileExtension(extension?: string | null): string {
  if (!extension?.trim()) {
    return '';
  }
  return extension.trim().replace(/^\./, '');
}

export function isApiSuccess(response: any): boolean {
  return Number(response?.returnStatus) === 1;
}

export function pickFirstPaymentDetail(response: any): any | null {
  if (!isApiSuccess(response)) {
    return null;
  }

  if (response.returnVal) {
    return response.returnVal;
  }

  const list = response.returnList as any[] | undefined;
  if (!list?.length) {
    return null;
  }

  return (
    list.find(
      (item) =>
        item?.isDefault === true ||
        item?.isDefault === 1 ||
        item?.isDefault === '1' ||
        item?.isDefault === 'true'
    ) ?? list[0]
  );
}
