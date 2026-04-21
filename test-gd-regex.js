const urls = [
  "https://drive.google.com/file/d/1XyZ_abc123/view?usp=sharing",
  "https://drive.google.com/open?id=1XyZ_abc123",
  "https://example.com/image.jpg"
];

const convertGoogleDriveLink = (url) => {
  if (!url) return url;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/uc?id=${match[1]}`;
  }
  const match2 = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match2 && match2[1] && url.includes('drive.google.com')) {
    return `https://drive.google.com/uc?id=${match2[1]}`;
  }
  return url;
};

urls.forEach(u => console.log(convertGoogleDriveLink(u)));
