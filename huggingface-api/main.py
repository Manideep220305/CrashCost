from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
import cv2, torch, shap
import torch.nn.functional as F
import numpy as np
import pandas as pd
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
from ultralytics import YOLO
from catboost import CatBoostRegressor

app = FastAPI(title="CrashCost AI Engine")

@app.get("/")
async def root():
    return {
        "status": "online",
        "engine": "InsureVision V4 (Production)",
        "models": ["YOLOv11-Small", "CLIP-L-14", "CatBoost-V4"],
        "message": "System is active. Use POST /api/v1/audit for inference."
    }

# ==========================================
# 1. INITIALIZE AI MODELS
# ==========================================
print("⏳ Loading InsureVision Engine (Production Locked)...")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# UPDATED TO MATCH YOUR EXACT FILENAME
YOLO_MODEL = YOLO("best.pt")

CLIP_MODEL = CLIPModel.from_pretrained("openai/clip-vit-large-patch14-336").to(DEVICE)
CLIP_PROCESSOR = CLIPProcessor.from_pretrained("openai/clip-vit-large-patch14-336")

# UPDATED TO MATCH v4 TRAINED MODEL
PRICING_MODEL = CatBoostRegressor()
PRICING_MODEL.load_model("crashcost_pricing_model.cbm")
EXPLAINER = shap.TreeExplainer(PRICING_MODEL)

# Feature names must match EXACTLY what the v4 dataset used for training
# v4 removed 'severity' (derived from ratio) and added 'car_model_val'
FEATURE_NAMES = ["car_brand", "car_tier", "car_segment", "damage_location", "car_age", "damage_type", "damage_ratio", "internal_damage_flag", "car_model_val"]
HUMAN_REASONS = {
    "car_brand": "Manufacturer Part Premium",
    "car_tier": "Vehicle Tier Component Rates",
    "car_segment": "Bodywork Complexity",
    "damage_location": "Component Labor (Location-based)",
    "car_age": "Vehicle Depreciation Factor",
    "damage_type": "Specific Material Replacement Cost",
    "damage_ratio": "Extensive Surface Repair Area",
    "internal_damage_flag": "Internal Structural Check",
    "car_model_val": "Vehicle Market Value"
}

# Market value lookup for car_model_val computation at inference time
# Values in ₹ lakhs (new car price, before depreciation)
MARKET_VALUES = {
    ("Economy", "Hatchback"): 5.5,  ("Economy", "Sedan"): 8.0,   ("Economy", "SUV"): 10.0,
    ("Mid", "Hatchback"):     8.0,  ("Mid", "Sedan"):     12.0,  ("Mid", "SUV"):     16.0,
    ("Luxury", "Sedan"):      35.0, ("Luxury", "SUV"):    50.0,
}

def estimate_car_value(tier, segment, age):
    """Estimate current market value from tier, segment, and age."""
    # Normalize segment names (frontend may send lowercase)
    seg_map = {"hatchback": "Hatchback", "sedan": "Sedan", "suv": "SUV", "compact_suv": "SUV"}
    tier_map = {"budget": "Economy", "economy": "Economy", "mid": "Mid", "premium": "Luxury", "luxury": "Luxury"}
    norm_tier = tier_map.get(tier.lower(), "Mid")
    norm_seg = seg_map.get(segment.lower(), "Sedan")
    base = MARKET_VALUES.get((norm_tier, norm_seg), 10.0)
    dep = max(0.20, 1.0 - (age * 0.07))  # 7% per year, floor 20%
    return round(base * dep, 2)

print("✅ Models Online and Ready.")

# ==========================================
# 2. CLIP SURFACE AUDITOR & XAI GENERATOR
# ==========================================
def get_surface(crop_img, location=""):
    loc = location.lower()
    if loc in ["hood", "driver_door", "passenger_door", "door", "side", "roof", "trunk", "fender"]:
        return "metal"
    if loc in ["bumper", "front", "rear", "front_bumper", "rear_bumper"]:
        return "plastic"
    if loc in ["windshield", "window", "glass"]:
        return "glass"
    if loc in ["headlight", "taillight", "light"]:
        return "light"
    if loc in ["tire", "wheel"]:
        return "tire"

    prompts = [
        "car windshield glass surface",         
        "painted metal car body panel",         
        "plastic car bumper surface",     
        "car headlight lamp cover",       
        "rubber car tire wheel"           
    ]
    inputs = CLIP_PROCESSOR(text=prompts, images=crop_img, return_tensors="pt", padding=True).to(DEVICE)
    with torch.no_grad():
        outputs = CLIP_MODEL(**inputs)

    probs = outputs.logits_per_image.softmax(dim=1)[0]
    confidence = probs.max().item()
    idx = probs.argmax().item()
    labels = ["glass", "metal", "plastic", "light", "tire"]
    
    if confidence < 0.35:
        return "unknown"
        
    return labels[idx]

def compute_iou(box_a, box_b):
    """Compute Intersection over Union between two [x1,y1,x2,y2] boxes."""
    xa = max(box_a[0], box_b[0])
    ya = max(box_a[1], box_b[1])
    xb = min(box_a[2], box_b[2])
    yb = min(box_a[3], box_b[3])
    inter = max(0, xb - xa) * max(0, yb - ya)
    area_a = (box_a[2] - box_a[0]) * (box_a[3] - box_a[1])
    area_b = (box_b[2] - box_b[0]) * (box_b[3] - box_b[1])
    union = area_a + area_b - inter
    return inter / union if union > 0 else 0

def generate_short_summary(label, severity, surface, reasons):
    """Returns a concise 1-2 sentence summary for the detection."""
    damage_desc = label.replace('_', ' ').lower()
    surface_desc = f"{surface} " if surface not in ["unknown"] else ""
    return (
        f"{severity.capitalize()} {damage_desc} on {surface_desc}panel. "
        f"Cost driven by {reasons[0].lower()} and {reasons[1].lower()}."
    )

def generate_descriptive_narrative(label, severity, ratio, location, surface, tier, brand, segment, age, price, reasons, internal_flag, conf, mask_available=True, replacement_warning=False):
    """Generates a concise engineering report for the frontend."""
    damage_desc = label.replace('_', ' ').lower()
    
    report = (
        f"Damage detected: {severity.capitalize()} {damage_desc} on {location} {surface} surface.\n"
        f"Estimated repair cost: INR {int(price):,}.\n\n"
        f"Main cost drivers:\n"
        f"• {reasons[0]}\n"
        f"• {reasons[1]}"
    )

    if internal_flag == 1:
        report += "\n\nWarning: High damage ratio detected. Internal rule engine recommends detailed workshop inspection for underlying structural/sensor damage."

    if replacement_warning:
        report += "\n\nAction Required: Due to the extreme extent of the damage (>40% area), a full component replacement is highly recommended over standard repair."

    return report.strip()

# ==========================================
# 3. API ENDPOINT (MERN INTEGRATION)
# ==========================================
@app.post("/api/v1/audit")
async def process_audit(
    image: UploadFile = File(...),
    brand: str = Form(...),
    tier: str = Form(...),
    segment: str = Form(...),
    location: str = Form(...),
    age: int = Form(...)
):
    try:
        # 1. Read Image safely
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Image Validation Added
        if img is None:
            return JSONResponse(status_code=400, content={"status": "error", "message": "Invalid image file uploaded."})
            
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        h, w, _ = img.shape
        
        # 2. YOLO Prediction
        results = YOLO_MODEL.predict(img, conf=0.25, verbose=False)[0]
        
        if results.boxes is None or len(results.boxes) == 0:
            return JSONResponse(content={"status": "success", "detections": [], "total_estimate": 0, "estimate_range": [0,0]})

        detections = []
        total_price = 0

        # Fix B: Sort boxes by confidence (descending) for IoU-based merging
        num_boxes = len(results.boxes)
        box_indices = sorted(range(num_boxes), key=lambda j: float(results.boxes.conf[j]), reverse=True)
        kept_boxes = []  # list of [x1, y1, x2, y2] for IoU checks
        det_count = 0

        for i in box_indices:
            if det_count >= 3:
                break

            cls_name = YOLO_MODEL.names[int(results.boxes.cls[i])]
            conf = float(results.boxes.conf[i])

            if conf < 0.40 or cls_name == "damage":
                continue

            x1, y1, x2, y2 = map(int, results.boxes.xyxy[i].cpu().numpy())
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w, x2), min(h, y2)
            box_width, box_height = x2 - x1, y2 - y1
            
            if box_width <= 0 or box_height <= 0:
                continue

            # Fix B: Skip if this box overlaps heavily with an already-kept box
            current_box = [x1, y1, x2, y2]
            is_duplicate = False
            for kept in kept_boxes:
                if compute_iou(current_box, kept) > 0.5:
                    is_duplicate = True
                    break
            if is_duplicate:
                continue
            kept_boxes.append(current_box)

            target = 250
            pad_x = max(30, (target - box_width) // 2)
            pad_y = max(30, (target - box_height) // 2)
            
            cx1, cy1 = max(0, x1 - pad_x), max(0, y1 - pad_y)
            cx2, cy2 = min(w, x2 + pad_x), min(h, y2 + pad_y)
            
            crop_pil = Image.fromarray(rgb[cy1:cy2, cx1:cx2])
            surface = get_surface(crop_pil, location)
            
            fill_ratio = 0.05
            severity = "MINOR"
            mask_available = False
            
            box_area = box_width * box_height
            
            if results.masks is not None and i < len(results.masks.data):
                # Fix B: Resize mask from model resolution (640x640) to original image resolution (h, w)
                mask_tensor = results.masks.data[i].float().unsqueeze(0).unsqueeze(0)  # [1, 1, H_model, W_model]
                mask_resized = F.interpolate(mask_tensor, size=(h, w), mode='bilinear', align_corners=False).squeeze() > 0.5
                
                # Now we can safely slice using original image coordinates (x1, y1, x2, y2)
                mask_crop = mask_resized.cpu().numpy()[y1:y2, x1:x2]
                mask_area = mask_crop.sum()
                
                if box_area > 0 and mask_area > 0:
                    mask_available = True
                    fill_ratio = mask_area / box_area
                    # Ratio Clamped to prevent mask overshoots
                    fill_ratio = min(0.85, fill_ratio)
            
            # Fix B (Fallback): If no mask data, use bbox relative to image size
            if not mask_available:
                img_area = h * w
                fallback_ratio = (box_area / img_area) * 1.5  # bboxes are larger than actual damage
                fill_ratio = min(0.85, max(0.01, fallback_ratio))

            if fill_ratio < 0.08: severity = "MINOR"
            elif fill_ratio < 0.25: severity = "MODERATE"
            else: severity = "SEVERE"

            # Fix D: Sanity rule on tiny ratio
            if fill_ratio < 0.02:
                severity = "MINOR"

            # Fix C: CLIP-Dominant Override Logic
            # Trust CLIP's material physics over YOLO's damage shapes
            if surface == "glass":
                final_label = "glass shatter"  # Glass shatters/cracks, doesn't dent
            elif surface == "light":
                final_label = "lamp_broken"   # Hard plastic shatters/breaks, doesn't dent
            elif surface == "tire":
                final_label = "damaged_tire"  # Tires puncture/tear, don't dent
            
            # For metal/plastic body panels, trust YOLO but filter impossibilities
            elif surface in ["metal", "plastic"]:
                if cls_name in ["crack", "glass shatter"]:
                    # Metal/plastic doesn't shatter like glass.
                    # If it's a huge area (>15%), it's a severe dent/crumple.
                    final_label = "dent" if fill_ratio > 0.15 else "scratch"
                else:
                    final_label = cls_name
            else:
                final_label = cls_name

            internal_flag = 0
            if fill_ratio > 0.25 and final_label in ["dent", "lamp_broken", "glass_damage"]:
                internal_flag = 1

            car_model_val = estimate_car_value(tier, segment, age)
            row = [brand, tier, segment, location, age, final_label, round(fill_ratio, 3), internal_flag, car_model_val]
            price = PRICING_MODEL.predict([row])[0]
            price = max(800, min(250000, price))

            # Fix D: Reduce price for tiny-ratio detections
            if fill_ratio < 0.02:
                price = max(800, price * 0.7)

            total_price += price

            df_row = pd.DataFrame([row], columns=FEATURE_NAMES)
            s_val = EXPLAINER.shap_values(df_row)[0]
            top_idx = np.argsort(s_val)[-2:]
            
            reasons = []
            for idx in top_idx:
                reason = HUMAN_REASONS.get(FEATURE_NAMES[idx], "Labor Parameters")
                if FEATURE_NAMES[idx] == "car_tier":
                    reason = f"{tier.capitalize()}-Tier Component Rates"
                reasons.append(reason)

            # Fix C: Generate both short summary and full narrative
            summary = generate_short_summary(
                label=final_label, severity=severity, surface=surface, reasons=reasons
            )

            replacement_warning = False
            if fill_ratio > 0.40 and final_label in ["crack", "glass shatter", "lamp_broken", "dent"]:
                replacement_warning = True

            narrative = generate_descriptive_narrative(
                label=final_label, severity=severity, ratio=fill_ratio, 
                location=location, surface=surface, tier=tier, 
                brand=brand, segment=segment, age=age, 
                price=price, reasons=reasons, internal_flag=internal_flag,
                conf=conf, mask_available=mask_available,
                replacement_warning=replacement_warning
            )

            det_count += 1
            detections.append({
                "id": det_count,
                "label": final_label.upper(),
                "confidence": round(conf, 2),
                "surface_detected": surface,
                "severity": severity,
                "ratio": round(fill_ratio, 3),
                "bbox": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
                "price": int(price),
                "drivers": reasons,
                "summary": summary,
                "narrative": narrative
            })

        # Fix E: Actuarial bounds (±15% for <50k, ±8% for >50k)
        if total_price < 50000:
            min_est = max(800, int(total_price * 0.85))
            max_est = int(total_price * 1.15)
        else:
            min_est = int(total_price * 0.92)  # 8% variance
            max_est = int(total_price * 1.08)  # 8% variance

        return JSONResponse(content={
            "status": "success",
            "context": {"brand": brand, "tier": tier, "segment": segment, "location": location},
            "image_size": {"width": w, "height": h},
            "total_estimate": int(total_price),
            "estimate_range": [min_est, max_est],
            "detections": detections
        })

    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})