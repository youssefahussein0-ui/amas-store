export function convertGoogleDriveLink(url: string | null | undefined): string {
  if (!url) return "";
  
  // Clean the URL from potential whitespace
  const cleanUrl = url.trim();

  // If it's already a converted link or not a Google Drive link, return it as is
  if (cleanUrl.includes('googleusercontent.com')) return cleanUrl;
  if (!cleanUrl.includes('drive.google.com') && !cleanUrl.includes('docs.google.com')) return cleanUrl;

  // Extract ID from various Google Drive URL formats
  // 1. /file/d/ID/...
  // 2. id=ID
  // 3. /uc?id=ID
  // 4. open?id=ID
  let id = "";
  const fileDMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]{25,})/);
  const idParamMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]{25,})/);
  const rawIdMatch = cleanUrl.match(/[a-zA-Z0-9_-]{25,}/);

  if (fileDMatch) {
    id = fileDMatch[1];
  } else if (idParamMatch) {
    id = idParamMatch[1];
  } else if (rawIdMatch) {
    id = rawIdMatch[0];
  }
  
  if (id) {
    return `/api/proxy-image?id=${id}`;
  }

  return cleanUrl;
}
