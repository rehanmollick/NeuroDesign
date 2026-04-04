#!/bin/bash
# Pre-warm the Modal endpoint 5 minutes before demo
# Run: bash scripts/warmup.sh

ENDPOINT="${MODAL_ENDPOINT:-https://your-modal-endpoint.modal.run}"

echo "Warming up $ENDPOINT..."
curl -s "$ENDPOINT/health" | python3 -m json.tool

echo "Done. Container is warm."
