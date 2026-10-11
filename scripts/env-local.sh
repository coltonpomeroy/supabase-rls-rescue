#!/usr/bin/env bash
# Writes .env.local from the running local Supabase stack (`supabase start`).
set -euo pipefail
eval "$(supabase status -o env 2>/dev/null | grep -E '^(API_URL|ANON_KEY|SERVICE_ROLE_KEY)=')"
cat > .env.local <<ENV
NEXT_PUBLIC_SUPABASE_URL=$API_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY
ENV
echo "Wrote .env.local"
