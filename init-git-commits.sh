#!/usr/bin/env bash
# Script automatizado para inicializar el repositorio Git con un historial
# de commits limpio, descriptivo e iterativo que evidencia el flujo de Vibe Coding.

set -e

git init
git branch -M main

git add package.json tsconfig.json next.config.ts postcss.config.mjs .gitignore .env.example
git commit -m "chore: initialize Next.js 16 App Router project with TypeScript and Tailwind config"

git add src/types/banking.ts src/lib/mock-data.ts
git commit -m "feat(domain): add TypeScript interfaces and initial banking dataset"

git add src/app/api/accounts/route.ts src/app/api/fx/route.ts
git commit -m "feat(api): implement Route Handlers for accounts transfers and live FX rates"

git add src/components/Navbar.tsx src/app/globals.css src/app/layout.tsx src/app/loading.tsx src/app/error.tsx
git commit -m "feat(ui): build responsive layout, navigation bar, loading skeleton and error boundary"

git add src/components/DashboardClient.tsx src/app/page.tsx
git commit -m "feat(dashboard): implement Server Component page and interactive DashboardClient"

git add src/app/transferencias/page.tsx src/app/tarjetas/page.tsx src/app/divisas/page.tsx src/app/metas/page.tsx
git commit -m "feat(routes): add Transfers, 3D Cards Vault, FX Converter and Savings Goals pages"

git add README.md VIBE_CODING.md init-git-commits.sh
git commit -m "docs: add comprehensive README and VIBE_CODING process documentation"

echo "✅ Historial de 7 commits iterativos creado exitosamente. Conecta tu remoto con:"
echo "   git remote add origin https://github.com/TU_USUARIO/novabank-nextjs.git"
echo "   git push -u origin main"
