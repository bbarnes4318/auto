#!/bin/bash
# Deployment script for Auto Insurance Dashboard

echo "Building and deploying to GitHub..."

# Add all changes
git add .

# Commit with timestamp
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"

# Push to main branch
git push origin main

echo "Deployment complete! Check DigitalOcean App Platform for automatic deployment."
