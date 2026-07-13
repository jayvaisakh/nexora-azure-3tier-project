#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost}"

echo "Checking Nexora deployment at: ${BASE_URL}"

echo "\n1. Frontend"
curl --fail --silent --show-error "${BASE_URL}/" >/dev/null
echo "Frontend reachable"

echo "\n2. Backend health"
curl --fail --silent --show-error "${BASE_URL}/api/health"
echo

echo "\n3. Database connectivity"
curl --fail --silent --show-error "${BASE_URL}/api/db-test"
echo

echo "\n4. Products API"
curl --fail --silent --show-error "${BASE_URL}/api/products"
echo

echo "\nAll checks completed successfully."
