#!/bin/bash
gcloud run deploy python-sidecar \
  --image=us-central1-docker.pkg.dev/c1v-prd/c1v/python-sidecar:latest \
  --region=us-central1 \
  --project=c1v-prd \
  --allow-unauthenticated \
  --ingress=all \
  --port=8080 \
  --cpu=2 \
  --memory=4Gi \
  --concurrency=1 \
  --max-instances=10 \
  --min-instances=0 \
  --timeout=900 \
  --execution-environment=gen2 \
  --no-cpu-throttling \
  --service-account=python-sidecar-runtime@c1v-prd.iam.gserviceaccount.com \
  --set-secrets="SUPABASE_URL=supabase-url:latest,SUPABASE_SERVICE_ROLE_KEY=supabase-service-role-key:latest" \
  --set-env-vars="GENERATORS_DIR=/app/generators,ARTIFACT_STORAGE_BUCKET=project-artifacts,GENERATOR_TIMEOUT_S=240,SIDECAR_API_KEY=083c10355b5410dbe19c11d145e31e60f78795e2889b71339c8a2529681fcef4"
