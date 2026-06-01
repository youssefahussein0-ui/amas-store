export function convertGoogleDriveLink(url: string | null | undefined): string {
  if (!url) return "";
  
  const cleanUrl = url.trim();

  // If it's not related to Google services, return as is
  const isGoogle = cleanUrl.includes('drive.google.com') || 
                   cleanUrl.includes('docs.google.com') || 
                   cleanUrl.includes('googleusercontent.com');
                   
  if (!isGoogle) return cleanUrl;

  // Extract ID from various formats
  let id = "";
  
  // Format 1: /d/FILE_ID (matches /file/d/FILE_ID or googleusercontent.com/d/FILE_ID)
  const fileDMatch = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]{25,})/);
  // Format 2: id=FILE_ID
  const idParamMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]{25,})/);
  // Format 3: raw 33-char ID
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
