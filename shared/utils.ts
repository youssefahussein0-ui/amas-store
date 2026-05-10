export function convertGoogleDriveLink(url: string | null | undefined): string {
  if (!url) return "";
  
  // If it's already a converted link or not a Google Drive link, return it as is
  if (url.includes('googleusercontent.com')) return url;
  if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) return url;

  // Extract ID from various Google Drive URL formats
  // 1. /file/d/ID/...
  // 2. id=ID
  // 3. open?id=ID
  // 4. /uc?id=ID
  let idMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]{25,})/);
  if (!idMatch) idMatch = url.match(/id=([a-zA-Z0-9_-]{25,})/);
  if (!idMatch) idMatch = url.match(/[-\w]{25,}/); // Fallback to raw ID matcher
  
  if (idMatch && idMatch[0]) {
    return `https://lh3.googleusercontent.com/d/${idMatch[0]}`;
  }

  return url;
}
