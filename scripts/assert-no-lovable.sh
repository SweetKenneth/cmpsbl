#!/usr/bin/env bash
set -e

echo "🔍 Checking for Lovable AI references..."

# Search for Lovable AI patterns in code
if grep -RiqE "LOVABLE_API_KEY|ai\.gateway\.lovable\.dev" supabase/functions src; then
  echo "❌ Lovable AI reference detected. Build blocked."
  echo "All AI calls must go through pf-nexus-router (free-tier stack)."
  exit 1
fi

echo "✅ No Lovable AI references found. Build OK."
