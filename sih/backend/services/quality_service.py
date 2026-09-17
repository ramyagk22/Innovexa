import cv2
import numpy as np
import os
from typing import Dict, Any, List
from schemas.schemas import QualityMetrics, QualityStatus

def analyze_image_quality(image_path: str) -> QualityMetrics:
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found at {image_path}")

    # Read image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Could not decode image file.")

    height, width = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 1. Segment retinal disc from black background (threshold > 15)
    retina_mask = gray > 18
    retina_pixels = gray[retina_mask] if np.any(retina_mask) else gray.flatten()

    # 2. Blur / Sharpness calculation using Laplacian variance
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    # Normalize blur score to 0 - 100
    # laplacian_var < 50 is blurry, > 150 is very sharp
    blur_score = float(min(100.0, max(5.0, (laplacian_var / 2.5))))

    # 3. Brightness calculation on retinal disc
    mean_brightness = float(np.mean(retina_pixels))
    # Ideal retinal mean is ~90 to 160. Score decreases if too dark (<60) or overexposed (>200)
    if mean_brightness < 60:
        brightness_score = float(max(10.0, (mean_brightness / 60.0) * 60.0))
    elif mean_brightness > 200:
        brightness_score = float(max(15.0, 100.0 - ((mean_brightness - 200) * 1.5)))
    else:
        # Ideal range
        brightness_score = float(min(98.0, 75.0 + ((mean_brightness - 60) / 100.0) * 23.0))

    # 4. Contrast calculation (standard deviation of retinal disc pixels)
    contrast_std = float(np.std(retina_pixels))
    # Normal retinal std is 35 - 75
    contrast_score = float(min(100.0, max(10.0, (contrast_std / 55.0) * 90.0)))

    # 5. Field of View (FoV) coverage calculation
    coverage_ratio = float(np.count_nonzero(retina_mask) / (height * width))
    # Standard fundus images cover 40% to 85% of frame
    if 0.35 <= coverage_ratio <= 0.95:
        fov_score = 92.0
    elif coverage_ratio < 0.20:
        fov_score = 35.0
    else:
        fov_score = 65.0

    # Minimum resolution check
    resolution_ok = (width >= 224 and height >= 224)

    reasons: List[str] = []
    status = QualityStatus.GOOD
    can_proceed = True

    # Rule-based Clinical Quality Gate
    if not resolution_ok:
        reasons.append("Image resolution is below the minimum required 224x224 pixels.")
        status = QualityStatus.POOR
        can_proceed = False

    if blur_score < 30.0:
        reasons.append(f"Significant motion or optical blur detected (sharpness: {blur_score:.1f}/100).")
        status = QualityStatus.POOR
        can_proceed = False

    if brightness_score < 30.0:
        reasons.append(f"Severe underexposure / darkness in retinal field (score: {brightness_score:.1f}/100).")
        status = QualityStatus.POOR
        can_proceed = False

    if brightness_score > 90.0 and mean_brightness > 215:
        reasons.append(f"Severe glare or flash washout over retinal disc.")
        status = QualityStatus.POOR
        can_proceed = False

    if contrast_score < 25.0:
        reasons.append(f"Insufficient vascular and retinal contrast (score: {contrast_score:.1f}/100).")
        if status != QualityStatus.POOR:
            status = QualityStatus.BORDERLINE

    if status != QualityStatus.POOR:
        if blur_score < 50.0 or brightness_score < 50.0 or contrast_score < 45.0:
            status = QualityStatus.BORDERLINE
            if not reasons:
                reasons.append("Image is slightly dim or lacks vascular contrast; CLAHE enhancement recommended.")

    if status == QualityStatus.GOOD:
        message = "Image quality is sufficient for AI screening."
        reasons = ["Clear retinal disc and macula visibility.", "Adequate contrast and illumination."]
    elif status == QualityStatus.BORDERLINE:
        message = "Image quality is borderline. Enhancement will be attempted."
    else:
        message = "Image quality is insufficient. Recapture recommended."

    return QualityMetrics(
        blur_score=round(blur_score, 1),
        brightness_score=round(brightness_score, 1),
        contrast_score=round(contrast_score, 1),
        fov_score=round(fov_score, 1),
        resolution={"width": width, "height": height},
        status=status,
        reasons=reasons,
        message=message,
        can_proceed=can_proceed
    )
