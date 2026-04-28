import { db } from "../server/db";
import { categories } from "../shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding categories...");
  
  const newCats = [
    {
      slug: "Clothing",
      nameEn: "Clothing",
      nameAr: "الملابس",
      imageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000"
    },
    {
      slug: "Shoes",
      nameEn: "Shoes",
      nameAr: "الأحذية",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000"
    }
  ];

  for (const cat of newCats) {
    const existing = await db.select().from(categories).where(eq(categories.slug, cat.slug));
    if (existing.length === 0) {
      await db.insert(categories).values(cat);
      console.log(`Added category: ${cat.nameEn}`);
    } else {
      console.log(`Category already exists: ${cat.nameEn}`);
    }
  }

  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
