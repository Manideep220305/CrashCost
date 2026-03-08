"""
InsureVision CrashCost — Synthetic Pricing Dataset Generator (v4)
=================================================================
GROUNDED IN REAL-WORLD DATA from:
  - GoMechanic.in (dent/painting prices by car type)
  - CarVaidya.com (scratch repair ranges)
  - WindshieldExperts.com (glass replacement by model)
  - IndiaMART (headlight/bumper part prices)
  - Team-BHP, Reddit r/CarsIndia (real repair quotes)

Real Indian repair cost ranges (2024-2025):
  Economy (Maruti/Hyundai):
    scratch: ₹500-3,000 | dent: ₹1,500-7,000 | bumper: ₹4,000-11,000
    glass: ₹4,500-8,000 | headlight: ₹2,000-8,000 | tire: ₹2,500-6,000
  Mid (Honda/Kia/Toyota):
    scratch: ₹1,000-5,000 | dent: ₹3,000-12,000 | bumper: ₹6,000-17,000
    glass: ₹7,500-15,000 | headlight: ₹8,000-20,000 | tire: ₹4,000-9,000
  Luxury (BMW/Mercedes/Audi):
    scratch: ₹3,000-15,000 | dent: ₹8,000-30,000 | bumper: ₹15,000-50,000
    glass: ₹30,000-50,000 | headlight: ₹20,000-42,000 | tire: ₹10,000-25,000
"""

import pandas as pd
import numpy as np
import random

print("⚙️  Generating InsureVision v4 Pricing Dataset (Real-World Grounded)...")

np.random.seed(42)
random.seed(42)

NUM_ROWS = 25_000

# =============================================================
# 1. DAMAGE TYPES — Weighted (scratches/dents most common)
# =============================================================
damage_types = ["scratch", "dent", "glass_damage", "lamp_broken", "damaged_tire"]
damage_weights = [0.30, 0.30, 0.18, 0.12, 0.10]

# =============================================================
# 2. BRANDS — Grouped by tier
# =============================================================
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

# =============================================================
# 3. REAL-WORLD COST RANGES — Per (damage_type, tier)
#    Source: GoMechanic, CarVaidya, WindshieldExperts, IndiaMART
#    [min_cost, mid_cost, max_cost] in ₹
#    These are the BASE repair costs for MINOR damage (ratio ~0.05)
#    Costs scale up with damage_ratio for MODERATE and SEVERE
# =============================================================
real_cost_ranges = {
    # Economy tier (Maruti, Hyundai, Tata)
    ("scratch",      "Economy"): (800,   2000,  3500),
    ("dent",         "Economy"): (1500,  4000,  8000),
    ("glass_damage", "Economy"): (4500,  6000,  9000),
    ("lamp_broken",  "Economy"): (2000,  5000,  10000),
    ("damaged_tire", "Economy"): (2500,  4000,  6500),

    # Mid tier (Honda, Kia, Toyota, Skoda)
    ("scratch",      "Mid"):     (1200,  3000,  6000),
    ("dent",         "Mid"):     (3000,  7000,  15000),
    ("glass_damage", "Mid"):     (7500,  12000, 18000),
    ("lamp_broken",  "Mid"):     (6000,  12000, 22000),
    ("damaged_tire", "Mid"):     (4000,  6500,  10000),

    # Luxury tier (BMW, Mercedes, Audi)
    ("scratch",      "Luxury"):  (3000,  8000,  18000),
    ("dent",         "Luxury"):  (8000,  18000, 35000),
    ("glass_damage", "Luxury"):  (25000, 40000, 60000),
    ("lamp_broken",  "Luxury"):  (15000, 30000, 50000),
    ("damaged_tire", "Luxury"):  (8000,  15000, 28000),
}

segment_multipliers  = {"Hatchback": 0.90, "Sedan": 1.0, "SUV": 1.20}
location_multipliers = {"front": 1.30, "rear": 1.0, "side": 1.10}

# =============================================================
# 4. BASE MARKET VALUES — (₹ lakhs, new car price)
# =============================================================
base_market_values = {
    ("Economy", "Hatchback"): 5.5,  ("Economy", "Sedan"): 8.0,   ("Economy", "SUV"): 10.0,
    ("Mid", "Hatchback"):     8.0,  ("Mid", "Sedan"):     12.0,  ("Mid", "SUV"):     16.0,
    ("Luxury", "Sedan"):      35.0, ("Luxury", "SUV"):    50.0,
}


# =============================================================
# GENERATE DATA
# =============================================================
data = []

for _ in range(NUM_ROWS):
    # --- Pick tier/brand/segment (weighted) ---
    tier = np.random.choice(list(tier_weights.keys()), p=list(tier_weights.values()))
    brand = random.choice(brands[tier])
    segment = np.random.choice(segment_dist[tier]["segments"], p=segment_dist[tier]["probs"])

    # --- Pick damage/location (weighted) ---
    damage = np.random.choice(damage_types, p=damage_weights)
    location = np.random.choice(locations, p=location_weights)

    # --- Car age (Gamma-distributed, peaks at 4-6 years) ---
    age = int(np.clip(np.random.gamma(shape=3.0, scale=2.0), 0, 20))

    # --- Damage ratio (Beta-distributed, most damage is minor) ---
    damage_ratio = round(np.clip(np.random.beta(a=2.0, b=5.0) * 0.45, 0.01, 0.40), 3)

    # --- Car market value (depreciates with age) ---
    base_val = base_market_values.get((tier, segment), 10.0)
    dep_factor = max(0.20, 1.0 - (age * 0.07))
    car_model_val = round(base_val * dep_factor * np.random.normal(1.0, 0.05), 2)
    car_model_val = max(1.5, car_model_val)

    # ==========================================================
    # COST CALCULATION (grounded in real ranges)
    # ==========================================================

    # A) Look up the real cost range for this (damage, tier) combo
    cost_min, cost_mid, cost_max = real_cost_ranges[(damage, tier)]

    # B) Use damage_ratio to interpolate within the real range
    #    ratio ~0.01-0.05 → near minimum (minor scratch/dent)
    #    ratio ~0.10-0.20 → near midpoint (moderate damage)
    #    ratio ~0.25-0.40 → near maximum (severe, panel replacement)
    #    We use a sigmoid-like curve to make the transition smooth
    t = np.clip(damage_ratio / 0.35, 0, 1)  # Normalize to [0, 1]
    t_curved = t ** 0.7  # Slightly sublinear (diminishing returns)

    cost = cost_min + (cost_max - cost_min) * t_curved

    # C) Segment multiplier (SUVs bigger panels = more cost)
    cost *= segment_multipliers[segment]

    # D) Location multiplier (front has bumper/sensors/grill)
    cost *= location_multipliers[location]

    # E) Age-based adjustment
    #    New cars = OEM parts (expensive), old = aftermarket (cheaper)
    if age <= 2:
        age_factor = np.random.uniform(0.98, 1.05)
    elif age <= 5:
        age_factor = np.random.uniform(0.90, 0.98)
    elif age <= 10:
        age_factor = np.random.uniform(0.78, 0.88)
    else:
        age_factor = np.random.uniform(0.65, 0.78)
    cost *= age_factor

    # F) Internal/structural damage (for serious impacts)
    internal_flag = 0
    if damage_ratio > 0.15 and damage in ["dent", "lamp_broken", "glass_damage"]:
        prob = 0.20 if location == "front" else 0.08
        if random.random() < prob:
            internal_flag = 1
            # Structural repair: ₹8k-15k economy, ₹12k-25k mid, ₹25k-50k luxury
            internal_base = {"Economy": 10000, "Mid": 18000, "Luxury": 35000}
            cost += internal_base[tier]

    # G) Final noise (±6% — real-world shop-to-shop variance)
    noise = np.random.normal(1.0, 0.06)
    final_cost = int(cost * noise)

    # H) Sanity clipping
    final_cost = max(500, min(250000, final_cost))
    final_cost = round(final_cost, -2)

    data.append([
        brand, tier, segment, location, age,
        damage, damage_ratio, internal_flag, car_model_val,
        final_cost
    ])

# =============================================================
# BUILD DATAFRAME
# =============================================================
df = pd.DataFrame(data, columns=[
    "car_brand", "car_tier", "car_segment", "damage_location", "car_age",
    "damage_type", "damage_ratio", "internal_damage_flag", "car_model_val",
    "repair_cost"
])

df.to_csv("insurevision_pricing_data_v4.csv", index=False)

print("\n✅ Dataset Generated! Stats:")
print(f"   Rows: {len(df)}")
print(f"\n   repair_cost distribution:")
print(df["repair_cost"].describe().round(0).to_string())
print(f"\n   Tier distribution:")
print(df["car_tier"].value_counts().to_string())
print(f"\n   Damage type distribution:")
print(df["damage_type"].value_counts().to_string())
print(f"\n   Internal damage rate: {df['internal_damage_flag'].mean():.1%}")

# Show real-world sanity check
print("\n📊 Sanity Check — Avg repair cost by tier × damage:")
pivot = df.pivot_table(values="repair_cost", index="damage_type", columns="car_tier", aggfunc="mean").round(0)
print(pivot[["Economy", "Mid", "Luxury"]].to_string())
