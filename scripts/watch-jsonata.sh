#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Usage: npm run jsonata:watch <filename.jsonata>"
    echo "Example: npm run jsonata:watch evrim.jsonata"
    exit 1
fi

JSONATA_FILE=$1

echo "🚀 Starting JSONata watch mode for: $JSONATA_FILE"
echo "👀 Watching src/jsonata directory for changes..."
echo "Press Ctrl+C to stop"

npx nodemon --watch src/jsonata --ext js,ts,json,jsonata --exec "tsc && node dist/run-jsonata.js $JSONATA_FILE"
