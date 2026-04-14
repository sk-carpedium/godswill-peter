#!/bin/bash
# shadcn-setup.sh — Install all required shadcn/ui components
# Run this ONCE in your frontend project after npm install
# Place at: scripts/shadcn-setup.sh

echo "Installing shadcn/ui components..."

# Initialize shadcn/ui (skip if already done)
npx shadcn@latest init --defaults 2>/dev/null || true

# Install every component used in the app
components=(
  accordion alert alert-dialog aspect-ratio avatar badge breadcrumb
  button calendar card carousel checkbox collapsible command
  context-menu dialog drawer dropdown-menu form hover-card
  input label menubar navigation-menu pagination popover progress
  radio-group resizable scroll-area select separator sheet sidebar
  skeleton slider switch table tabs textarea toast toggle
  toggle-group tooltip input-otp sonner
)

for component in "${components[@]}"; do
  echo "Adding $component..."
  npx shadcn@latest add "$component" --overwrite -y 2>/dev/null || true
done

echo "✅ All shadcn/ui components installed"
