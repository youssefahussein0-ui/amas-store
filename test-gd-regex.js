function convertGoogleDriveLink(url) {
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

const testUrl = "https://drive.google.com/file/d/15c03gcVxaGDW3Fj14bTpXSlq7DRE2S6c/view?usp=drive_link";
console.log(convertGoogleDriveLink(testUrl));
