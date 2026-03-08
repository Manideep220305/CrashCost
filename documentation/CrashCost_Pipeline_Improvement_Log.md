# InsureVision CrashCost ML Pipeline: Iteration & Improvement Log

This document serves as a comprehensive record of the development, iteration, and refinement of the **CrashCost AI Engine's** synthetic pricing dataset and CatBoost regression model.

---

## 1. Initial State & Problem Identification

The original `generate_dataset.py` (v1) had several critical flaws that prevented the CatBoost model from learning effectively:
- **Redundant Feature (Data Leakage):** The `severity` column was deterministically derived from `damage_ratio`, providing no new information but acting as a strong leak.
- **Overly Deterministic Cost:** Only 5% Gaussian noise was added, meaning the cost was almost a direct mathematical formula. Models trained on this overfit heavily and don't generalize to the real world.
- **Small Dataset:** 5,000 rows were insufficient for CatBoost to learn complex categorical interactions.
- **Unrealistic Distributions:** `car_age` and `damage_ratio` used uniform distributions, whereas real-world data is heavily skewed (most damage is minor; most cars are 2-7 years old). Damage types (scratch, dent, etc.) were equally probable.

The original CatBoost training script also lacked:
- A proper Train/Test split.
- Hyperparameter tuning.
- Robust evaluation metrics (RMSE, MAE, R², MAPE).

---

## 2. Iteration 1: The v2 Dataset & Model Pipeline

We structured a 25,000-row synthetic dataset (v2) with the following improvements:
- **Realistic Distributions:** Used a Beta distribution `beta(2,6)` for `damage_ratio` (clustering around 0.05-0.15) and a Gamma distribution for `car_age`.
- **Weighted Probabilities:** Reflected reality by making `scratch` and `dent` the most common damage types, and `Economy` tier the most common car segment.
- **Removed Leakage:** Removed the `severity` column entirely.
- **Added Market Value:** Introduced `car_model_val` (base value depreciated by age) to give the model a signal that expensive cars have expensive parts.
- **Noise & Interactions:** Added ~12% labor noise and non-linear interactions (e.g., Luxury + Front damage costs a premium).

A robust **v2 CatBoost Pipeline** was established:
- 80/20 train/test split.
- Early stopping, depth=8, and L2 regularization (`l2_leaf_reg=3.0`).
- Model export to `.cbm` format.

**User Feedback on v2:**
The user approved the v2 dataset structure, noting the Beta distribution for `damage_ratio` and weighted damage types were major improvements. Minor tweaks were requested:
1.  Lower the maximum `damage_ratio` cap from 0.45 to 0.35.
2.  Increase the `front` location multiplier from 1.25 to 1.35 (accounting for bumper, grill, sensors, headlights).

---

## 3. Iteration 2: Fixing Performance Issues (v3)

Upon training the v2 dataset, the results were:
`R² = 0.86, MAPE = 28%`

These metrics were mediocre for a synthetic, formula-driven dataset. A root-cause analysis identified 4 issues:
1.  **Weak `damage_ratio` Signal:** The feature importance for `damage_ratio` was only 4.3%. The multiplier exponent was too low, so the ratio didn't swing the price enough.
2.  **Too Much Compounding Noise:** Compounding 12% labor noise, random base cost standard deviations, and wide depreciation bands created 20-25% unlearnable variance.
3.  **Unreachable Internal Damage:** The `internal_damage_flag` threshold was set to `ratio > 0.20`, but the strict Beta distribution meant the ratio almost never hit 0.20 (only a 0.3% trigger rate).

**The v3 Fix:**
- Fixed base costs (removed the `np.random.normal` per-type variance).
- Increased the scaling exponent (e.g., `5.0 * (damage_ratio ** 0.9)`) so `damage_ratio` drove cost significantly more.
- Reduced pure noise (labor noise down to 7%, tighter depreciation bands).
- Lowered the internal damage threshold to `ratio > 0.12`, yielding a realistic ~6-8% trigger rate.

---

## 4. Iteration 3: Real-World Grounding (v4)

Instead of relying on arbitrary base costs and multipliers, we rewrote the generator (v4) to be **grounded in actual 2024-2025 repair cost data from India** (GoMechanic, CarVaidya, WindshieldExperts, IndiaMART).

**The Pivot:**
Instead of `base × multiplier`, v4 uses defined, real-world cost ranges for every `(damage_type, tier)` combination. The `damage_ratio` acts as a sigmoid interpolator within that specific range.

### The v4 Generator Script (`generate_dataset.py`)
```python
import pandas as pd
import numpy as np
import random

print("⚙️  Generating InsureVision v4 Pricing Dataset (Real-World Grounded)...")

np.random.seed(42)
random.seed(42)

NUM_ROWS = 25_000

damage_types = ["scratch", "dent", "glass_damage", "lamp_broken", "damaged_tire"]
damage_weights = [0.30, 0.30, 0.18, 0.12, 0.10]

brands = {
    "Economy": ["Maruti Suzuki", "Tata", "Hyundai", "Renault", "Nissan"],
    "Mid":     ["Honda", "Volkswagen", "Skoda", "Kia", "MG", "Toyota"],
    "Luxury":  ["BMW", "Mercedes", "Audi", "Volvo", "Jaguar"]
}

tier_weights = {"Economy": 0.55, "Mid": 0.30, "Luxury": 0.15}

segment_dist = {
    "Economy": {"segments": ["Hatchback", "Sedan", "SUV"],  "probs": [0.55, 0.25, 0.20]},
    "Mid":     {"segments": ["Hatchback", "Sedan", "SUV"],  "probs": [0.10, 0.35, 0.55]},
    "Luxury":  {"segments": ["Sedan", "SUV"],               "probs": [0.35, 0.65]}
}

locations = ["front", "rear", "side"]
location_weights = [0.45, 0.30, 0.25]

# Real-world Indian repair cost ranges [min, mid, max] in ₹
real_cost_ranges = {
    ("scratch",      "Economy"): (800,   2000,  3500),
    ("dent",         "Economy"): (1500,  4000,  8000),
    ("glass_damage", "Economy"): (4500,  6000,  9000),
    ("lamp_broken",  "Economy"): (2000,  5000,  10000),
    ("damaged_tire", "Economy"): (2500,  4000,  6500),

    ("scratch",      "Mid"):     (1200,  3000,  6000),
    ("dent",         "Mid"):     (3000,  7000,  15000),
    ("glass_damage", "Mid"):     (7500,  12000, 18000),
    ("lamp_broken",  "Mid"):     (6000,  12000, 22000),
    ("damaged_tire", "Mid"):     (4000,  6500,  10000),

    ("scratch",      "Luxury"):  (3000,  8000,  18000),
    ("dent",         "Luxury"):  (8000,  18000, 35000),
    ("glass_damage", "Luxury"):  (25000, 40000, 60000),
    ("lamp_broken",  "Luxury"):  (15000, 30000, 50000),
    ("damaged_tire", "Luxury"):  (8000,  15000, 28000),
}

segment_multipliers  = {"Hatchback": 0.90, "Sedan": 1.0, "SUV": 1.20}
location_multipliers = {"front": 1.30, "rear": 1.0, "side": 1.10}

base_market_values = {
    ("Economy", "Hatchback"): 5.5,  ("Economy", "Sedan"): 8.0,   ("Economy", "SUV"): 10.0,
    ("Mid", "Hatchback"):     8.0,  ("Mid", "Sedan"):     12.0,  ("Mid", "SUV"):     16.0,
    ("Luxury", "Sedan"):      35.0, ("Luxury", "SUV"):    50.0,
}

data = []

for _ in range(NUM_ROWS):
    tier = np.random.choice(list(tier_weights.keys()), p=list(tier_weights.values()))
    brand = random.choice(brands[tier])
    segment = np.random.choice(segment_dist[tier]["segments"], p=segment_dist[tier]["probs"])

    damage = np.random.choice(damage_types, p=damage_weights)
    location = np.random.choice(locations, p=location_weights)

    age = int(np.clip(np.random.gamma(shape=3.0, scale=2.0), 0, 20))
    damage_ratio = round(np.clip(np.random.beta(a=2.0, b=5.0) * 0.45, 0.01, 0.40), 3)

    base_val = base_market_values.get((tier, segment), 10.0)
    dep_factor = max(0.20, 1.0 - (age * 0.07))
    car_model_val = round(base_val * dep_factor * np.random.normal(1.0, 0.05), 2)
    car_model_val = max(1.5, car_model_val)

    cost_min, cost_mid, cost_max = real_cost_ranges[(damage, tier)]
    
    # Smooth interpolation based on ratio
    t = np.clip(damage_ratio / 0.35, 0, 1)
    t_curved = t ** 0.7
    cost = cost_min + (cost_max - cost_min) * t_curved

    cost *= segment_multipliers[segment]
    cost *= location_multipliers[location]

    if age <= 2:     age_factor = np.random.uniform(0.98, 1.05)
    elif age <= 5:   age_factor = np.random.uniform(0.90, 0.98)
    elif age <= 10:  age_factor = np.random.uniform(0.78, 0.88)
    else:            age_factor = np.random.uniform(0.65, 0.78)
    cost *= age_factor

    internal_flag = 0
    if damage_ratio > 0.15 and damage in ["dent", "lamp_broken", "glass_damage"]:
        prob = 0.20 if location == "front" else 0.08
        if random.random() < prob:
            internal_flag = 1
            internal_base = {"Economy": 10000, "Mid": 18000, "Luxury": 35000}
            cost += internal_base[tier]

    noise = np.random.normal(1.0, 0.06)
    final_cost = int(cost * noise)
    final_cost = max(500, min(250000, final_cost))
    final_cost = round(final_cost, -2)

    data.append([
        brand, tier, segment, location, age,
        damage, damage_ratio, internal_flag, car_model_val,
        final_cost
    ])

df = pd.DataFrame(data, columns=[
    "car_brand", "car_tier", "car_segment", "damage_location", "car_age",
    "damage_type", "damage_ratio", "internal_damage_flag", "car_model_val",
    "repair_cost"
])

df.to_csv("insurevision_pricing_data_v4.csv", index=False)
```

### The CatBoost Training Script (`train_catboost.py`)
```python
import pandas as pd
import numpy as np
from catboost import CatBoostRegressor, Pool
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

df = pd.read_csv("insurevision_pricing_data_v4.csv")
X = df.drop(columns=["repair_cost"])
y = df["repair_cost"]

cat_features = ["car_brand", "car_tier", "car_segment", "damage_location", "damage_type"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)

train_pool = Pool(X_train, y_train, cat_features=cat_features)
test_pool  = Pool(X_test,  y_test,  cat_features=cat_features)

model = CatBoostRegressor(
    iterations=1500,
    depth=8,
    learning_rate=0.05,
    l2_leaf_reg=3.0,
    random_strength=1.0,
    bagging_temperature=0.8,
    loss_function="RMSE",
    eval_metric="MAE",
    early_stopping_rounds=100,
    verbose=200,
    random_seed=42,
)

model.fit(train_pool, eval_set=test_pool, use_best_model=True)
y_pred = model.predict(X_test)
r2 = r2_score(y_test, y_pred)
model.save_model("crashcost_pricing_model.cbm")
```

---

## 5. Inference Adjustments (`main.py`)

With v4, `severity` is no longer a model input feature. Instead, `car_model_val` (market value) was added. We modified `main.py` to:
1. Update `FEATURE_NAMES` arrays.
2. Remove `severity` from the model prediction row.
3. Add a helper function `estimate_car_value(tier, segment, age)` that runs at inference time to compute the `car_model_val` using the same depreciation logic (7% / year) used in training.

*(Severity is still computed from `fill_ratio` inside `main.py`, but solely for display and XAI text narrative, not regression prediction).*

---

## 6. Brutal Pipeline Assessment

A review of `main.py` revealed strong practices alongside some critical risks:

**The Good:**
- **IoU Deduplication:** Sorting YOLO boxes by confidence and tossing overlapping bounds prevents multiple billing for the same cluster of damage.
- **Multimodal Classification:** Using CLIP to detect surface material (metal, plastic, glass) perfectly complements the geometric detection of YOLO.

**The Flaws & Risks:**
1.  **Mask vs Image Coordinates:** `results.masks.data` gives masks at model-resolution (e.g., 640x640), but `y1, y2, x1, x2` are bounding box coordinates in the original image dimensions. Without resizing the mask up to the original dimension before slicing with YOLO coordinates, the bounding box cut of the NumPy array returns garbage, heavily corrupting `mask_area` and `fill_ratio`.
2.  **Estimate Range Issue:** The API returned `[total_price - 1406, total_price + 1406]`. This is dangerous because an ₹800 repair yields a huge range, while a ₹140,000 repair yields a 1% margin. This should be fixed to an adaptive `±15%` standard deviation bound.
3.  **CLIP Label Override:** If CLIP incorrectly flags a "metal" dent as a "tire", the code currently forcefully overrides the YOLO label, derailing the final cost estimate.
4.  **No-Mask Fallback Danger:** If tracking with a non-seg model (or if masks fail), the system hardcodes `fill_ratio = 0.05` for every object. Thus every crash is mapped to "MINOR".
