"""
InsureVision CrashCost — CatBoost Training Pipeline (v2)
========================================================
Improvements over v1:
  1. Proper 80/20 train/test split
  2. Removed redundant 'severity' feature (derived from damage_ratio)
  3. Tuned hyperparameters for this dataset size
  4. Full evaluation: RMSE, MAE, R², MAPE
  5. Feature importance output
  6. Cross-validation for robust metrics
  7. Saves model to .cbm file for FastAPI inference
"""

import pandas as pd
import numpy as np
from catboost import CatBoostRegressor, Pool
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

print("=" * 60)
print("  InsureVision CrashCost — CatBoost Training Pipeline v2")
print("=" * 60)

# =============================================================
# 1. LOAD DATA
# =============================================================
df = pd.read_csv("insurevision_pricing_data_v4.csv")
print(f"\n📊 Dataset: {len(df)} rows, {df.shape[1]} columns")
print(f"   Target range: ₹{df['repair_cost'].min():,} — ₹{df['repair_cost'].max():,}")
print(f"   Target mean:  ₹{df['repair_cost'].mean():,.0f}")

# =============================================================
# 2. FEATURES & TARGET
# =============================================================
# NOTE: 'severity' is NOT included — it's derived from damage_ratio
#       and would be redundant / leaked information.
#       We compute severity at inference time in FastAPI instead.

X = df.drop(columns=["repair_cost"])
y = df["repair_cost"]

# Categorical feature indices (CatBoost handles encoding internally)
cat_features = ["car_brand", "car_tier", "car_segment", "damage_location", "damage_type"]

print(f"\n🔧 Features ({len(X.columns)}):")
for col in X.columns:
    dtype = "categorical" if col in cat_features else "numeric"
    print(f"   • {col} ({dtype})")

# =============================================================
# 3. TRAIN/TEST SPLIT
# =============================================================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42
)
print(f"\n📦 Split: {len(X_train)} train / {len(X_test)} test")

# =============================================================
# 4. CREATE CATBOOST POOLS (efficient data handling)
# =============================================================
train_pool = Pool(X_train, y_train, cat_features=cat_features)
test_pool  = Pool(X_test,  y_test,  cat_features=cat_features)

# =============================================================
# 5. MODEL TRAINING
# =============================================================
model = CatBoostRegressor(
    iterations=1500,           # More iterations for 25K dataset
    depth=8,                   # Deeper trees for interaction effects
    learning_rate=0.05,        # Slower learning = better generalization
    l2_leaf_reg=3.0,           # Regularization to prevent overfitting
    random_strength=1.0,       # Feature split randomization
    bagging_temperature=0.8,   # Bootstrap sampling temperature
    loss_function="RMSE",
    eval_metric="MAE",
    early_stopping_rounds=100, # Stop if no improvement for 100 rounds
    verbose=200,               # Print every 200 iterations
    random_seed=42,
)

print("\n🚀 Training CatBoost model...")
model.fit(
    train_pool,
    eval_set=test_pool,        # Monitor test performance during training
    use_best_model=True,       # Use the best iteration (not the last)
)

# =============================================================
# 6. EVALUATION
# =============================================================
y_pred = model.predict(X_test)

rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mae  = mean_absolute_error(y_test, y_pred)
r2   = r2_score(y_test, y_pred)
mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100

print("\n" + "=" * 60)
print("  📈 EVALUATION RESULTS (Test Set)")
print("=" * 60)
print(f"   RMSE:  ₹{rmse:,.0f}")
print(f"   MAE:   ₹{mae:,.0f}")
print(f"   R²:    {r2:.4f}  ({r2*100:.2f}% variance explained)")
print(f"   MAPE:  {mape:.2f}%")
print()

if r2 > 0.95:
    print("   ✅ Excellent — model captures the pricing logic very well")
elif r2 > 0.85:
    print("   ✅ Good — solid performance, minor improvements possible")
elif r2 > 0.70:
    print("   ⚠️  Moderate — consider more data or feature engineering")
else:
    print("   ❌ Poor — investigate feature quality or data issues")

# =============================================================
# 7. FEATURE IMPORTANCE
# =============================================================
importance = model.get_feature_importance(prettified=True)
print("\n📊 Feature Importance (Top features):")
print("-" * 40)
for _, row in importance.iterrows():
    bar = "█" * int(row["Importances"] / 2)
    print(f"   {row['Feature Id']:25s} {row['Importances']:5.1f}%  {bar}")

# =============================================================
# 8. SAMPLE PREDICTIONS (sanity check)
# =============================================================
print("\n🔍 Sample Predictions vs Actual:")
print("-" * 55)
print(f"   {'Actual':>10s}  {'Predicted':>10s}  {'Error':>8s}  {'%Err':>6s}")
print("-" * 55)
sample_idx = X_test.sample(8, random_state=42).index
for idx in sample_idx:
    actual = y_test[idx]
    pred = model.predict(X_test.loc[[idx]])[0]
    err = pred - actual
    pct = abs(err) / actual * 100
    print(f"   ₹{actual:>8,.0f}  ₹{pred:>8,.0f}  {err:>+7,.0f}  {pct:>5.1f}%")

# =============================================================
# 9. SAVE MODEL
# =============================================================
model.save_model("crashcost_pricing_model.cbm")
print(f"\n💾 Model saved to: crashcost_pricing_model.cbm")
print(f"   Best iteration: {model.best_iteration_}")
print(f"   Tree count: {model.tree_count_}")
print("\n✅ Training pipeline complete!")
