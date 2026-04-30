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
  const idMatch = url.match(/[-\w]{25,}/); // Google Drive IDs are usually 33 characters, but let's be safe
  
  if (idMatch && idMatch[0]) {
    return `https://lh3.googleusercontent.com/d/${idMatch[0]}`;
  }

  return url;
}
