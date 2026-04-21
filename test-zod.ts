import { products } from "./shared/schema";
import { createInsertSchema } from "drizzle-zod";
const schema = createInsertSchema(products).omit({ id: true, createdAt: true });
console.log(schema.shape);
