#!/bin/bash

echo "🚀 Setting up Composio UserId Integration Tests"
echo "============================================="

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install Bun first:"
    echo "   curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun is installed"

# Install dependencies
echo "📦 Installing dependencies..."
bun install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check for environment file
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found, copying from example..."
    cp .env.example .env.local
    echo "📝 Please edit .env.local and add your API keys:"
    echo "   - COMPOSIO_API_KEY (required)"
    echo "   - OPENAI_API_KEY (optional for LangGraph tests)"
    echo ""
    echo "   You can get your Composio API key from: https://app.composio.dev/api-keys"
    echo ""
    echo "🔧 After setting up your .env.local file, run:"
    echo "   bun test"
    exit 0
fi

echo "✅ Environment file exists"

# Check if API keys are configured
if ! grep -q "your_composio_api_key_here" .env.local; then
    echo "✅ COMPOSIO_API_KEY appears to be configured"
else
    echo "⚠️  Please configure COMPOSIO_API_KEY in .env.local"
    exit 1
fi

echo "🎉 Test setup complete!"
echo ""
echo "Available test commands:"
echo "  bun test              # Run all tests"
echo "  bun test:basic        # Run basic tests only"
echo "  bun test:langgraph    # Run LangGraph tests only"
echo "  bun test:advanced     # Run advanced tests only"
echo ""
echo "Ready to test Composio userId integration! 🧪"

