# Churn Signal — Dashboard

The Next.js app half of the churn prediction platform. For the full project write-up
(dataset notes, model results, architecture decisions), see the `README.md` in the
`churn-training-pipeline` package — this file just covers running/deploying this app.

## What's here

- `app/` — dashboard page + API routes (`/api/customers`, `/api/predict`)
- `components/` — customer table, drill-down panel, model performance panel, real-time
  scoring form, the signal-bar risk indicator
- `lib/` — server-side data access, ONNX inference, TypeScript port of the Python
  feature engineering (kept in sync with `feature_engineering.py` in the training repo)
- `data/` — model artifacts (ONNX model, calibration curve, scored customers, metrics)
  consumed server-side only — not served as static assets

## Run locally

```bash
npm install
npm run build && npm run start   # production build
# or
npm run dev                      # dev server with hot reload
```

## Deploy to Vercel

Push this folder (with `data/` committed) to a Git repo and import it in Vercel — no
special config needed beyond what's already in `next.config.ts`
(`serverExternalPackages: ["onnxruntime-node"]`, for the real-time scoring model's
native binary). Test `/api/predict` once on the live deployment to confirm the ONNX
runtime installed correctly during Vercel's build.

## Refreshing the data

If you retrain the model (see the training pipeline repo), copy the regenerated
artifacts into `data/`:

```
customer_scores.json
metrics.json
feature_importance.json
churn_model.onnx
calibration_curve.json
preprocessing_meta.json
```

No code changes needed unless the feature schema itself changes — in that case also
update `lib/feature-engineering.ts` to match `feature_engineering.py`.
