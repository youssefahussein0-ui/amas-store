import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertGoogleDriveLink(url: string | null | undefined): string {
  if (!url) return "";
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/uc?id=${match[1]}`;
  }
  const match2 = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match2 && match2[1] && url.includes('drive.google.com')) {
    return `https://drive.google.com/uc?id=${match2[1]}`;
  }
  return url;
}
