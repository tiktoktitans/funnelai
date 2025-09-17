#!/bin/bash

echo "🚀 Setting up FunnelAI..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@8.14.1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Copy environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your API keys and database credentials"
fi

# Generate Prisma client
echo "🗃 Generating Prisma client..."
pnpm db:generate

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your credentials"
echo "2. Run 'pnpm db:push' to create database tables"
echo "3. Run 'pnpm dev' to start the development server"
echo ""
echo "Visit http://localhost:3000 to see your app!"