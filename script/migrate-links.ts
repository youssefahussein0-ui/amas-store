import { storage } from '../server/storage';
import { convertGoogleDriveLink } from '../shared/utils';

async function migrate() {
  console.log('🚀 Starting link migration...');

  // Migrate Products
  const products = await storage.getProducts();
  console.log(`📦 Found ${products.length} products.`);
  for (const p of products) {
    const newUrl = convertGoogleDriveLink(p.imageUrl);
    const newAdditional = p.additionalImages 
      ? p.additionalImages.split(',').map(s => convertGoogleDriveLink(s.trim())).join(',')
      : null;

    if (newUrl !== p.imageUrl || newAdditional !== p.additionalImages) {
      await storage.updateProduct(p.id, { 
        imageUrl: newUrl, 
        additionalImages: newAdditional 
      });
      console.log(`✅ Updated product: ${p.name}`);
    }
  }

  // Migrate Categories
  const categories = await storage.getCategories();
  console.log(`📁 Found ${categories.length} categories.`);
  for (const c of categories) {
    const newUrl = convertGoogleDriveLink(c.imageUrl);
    if (newUrl !== c.imageUrl) {
      await storage.updateCategory(c.id, { imageUrl: newUrl });
      console.log(`✅ Updated category: ${c.nameEn}`);
    }
  }

  console.log('✨ Migration complete!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
