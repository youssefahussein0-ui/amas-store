import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { convertGoogleDriveLink } from "@shared/utils";
export { convertGoogleDriveLink };

export function validateEgyptianPhone(phone: string): boolean {
  // Egyptian phone numbers: 010, 011, 012, 015 followed by 8 digits
  const regex = /^(010|011|012|015)[0-9]{8}$/;
  return regex.test(phone);
}

export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, params);
  }
}
