#!/bin/bash
# ═══════════════════════════════════════════════
# deploy.sh — Levels App · Firebase Hosting
# Usage : ./deploy.sh "description optionnelle"
# ═══════════════════════════════════════════════

VERSION=$(date +"%Y-%m-%d_%H-%M")
DESC=${1:-"mise à jour"}

echo "🚀 Déploiement Levels App — $VERSION"
echo "📝 $DESC"
echo ""

# 1. Sauvegarder la version actuelle
mkdir -p versions
cp index.html "versions/${VERSION}_${DESC// /-}.html"
echo "✅ Version sauvegardée : versions/${VERSION}"

# 2. Déployer sur Firebase
firebase deploy --only hosting --message "$VERSION — $DESC"

echo ""
echo "✅ Déployé sur https://levels-app-f50a9.web.app"
echo "🔁 Rollback possible depuis : https://console.firebase.google.com/project/levels-app-f50a9/hosting"
