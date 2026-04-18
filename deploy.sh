#!/bin/bash
cd /var/www/amas-store
git pull origin main
npm install
npm run build
npx drizzle-kit push
pm2 restart amas-store
echo "✅ Deployment complete!"
