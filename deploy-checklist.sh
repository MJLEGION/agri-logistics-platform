#!/bin/bash
# Deployment Checklist Script
# Run before deploying to ensure everything is configured correctly

echo "🚀 Agri-Logistics Platform - Deployment Checklist"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ISSUES=0

# 1. Check if .env is in .gitignore
echo "1. Checking .gitignore..."
if grep -q "^\.env$" .gitignore; then
    echo -e "${GREEN}✓ .env is in .gitignore${NC}"
else
    echo -e "${RED}✗ .env is NOT in .gitignore!${NC}"
    echo "  → Add '.env' to your .gitignore file"
    ISSUES=$((ISSUES+1))
fi

# 2. Check if .env is tracked by git
echo ""
echo "2. Checking if .env is tracked by git..."
if git ls-files --error-unmatch .env > /dev/null 2>&1; then
    echo -e "${RED}✗ .env IS tracked by git (SECURITY RISK)${NC}"
    echo "  → Run: git rm --cached .env"
    echo "  → Then commit: git commit -m 'Remove .env from git tracking'"
    ISSUES=$((ISSUES+1))
else
    echo -e "${GREEN}✓ .env is not tracked by git${NC}"
fi

# 3. Check if .env.example exists
echo ""
echo "3. Checking for .env.example..."
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✓ .env.example exists${NC}"
else
    echo -e "${YELLOW}⚠ .env.example not found${NC}"
    echo "  → Create .env.example with placeholder values"
fi

# 4. Check for sensitive keys in .env
echo ""
echo "4. Checking for sensitive configuration..."
if [ -f ".env" ]; then
    if grep -q "EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=pk_test" .env || \
       grep -q "your_key_here" .env || \
       grep -q "xxxxx" .env; then
        echo -e "${YELLOW}⚠ Placeholder API keys detected${NC}"
        echo "  → Replace placeholder keys with real ones for production"
    else
        echo -e "${GREEN}✓ API keys appear to be configured${NC}"
    fi
fi

# 5. Check if build works
echo ""
echo "5. Checking if project builds..."
if expo export:web --dev > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    echo "  → Run 'npx expo export:web' to see errors"
    ISSUES=$((ISSUES+1))
fi

# 6. Check TypeScript compilation
echo ""
echo "6. Checking TypeScript..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✓ No TypeScript errors${NC}"
else
    ERRORS=$(npx tsc --noEmit 2>&1 | grep "error TS" | wc -l)
    echo -e "${YELLOW}⚠ ${ERRORS} TypeScript errors found${NC}"
    echo "  → Run 'npx tsc --noEmit' to see details"
fi

# Summary
echo ""
echo "=================================================="
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed! Ready to deploy.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Follow DEPLOYMENT.md guide"
    echo "2. Deploy backend to Render"
    echo "3. Deploy frontend to Vercel"
else
    echo -e "${RED}✗ Found ${ISSUES} critical issue(s) that need fixing.${NC}"
    echo "  → Fix the issues above before deploying"
fi
echo "=================================================="
