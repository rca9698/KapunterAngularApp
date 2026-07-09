export function buildSiteLogoUrl(
  basePath: string,
  documentDetailId?: string | null,
  fileExtension?: string | null
): string | null {
  const id = String(documentDetailId ?? '').trim();
  const ext = String(fileExtension ?? '').trim();

  if (!id) {
    return null;
  }

  return `${basePath}${id}${ext}`;
}
