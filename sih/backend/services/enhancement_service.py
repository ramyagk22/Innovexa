import cv2
import numpy as np
import os
from services.quality_service import analyze_image_quality
from schemas.schemas import EnhanceResponse, QualityMetrics

def enhance_fundus_image(input_path: str, output_dir: str) -> EnhanceResponse:
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input image not found: {input_path}")

    img = cv2.imread(input_path)
    if img is None:
        raise ValueError("Failed to load image for enhancement.")

    # 1. Convert to LAB color space to operate on luminance (L) channel independently
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)

    # 2. CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    enhanced_l = clahe.apply(l_channel)

    # 3. Subtle edge-preserving bilateral filtering to reduce sensor noise
    denoised_l = cv2.bilateralFilter(enhanced_l, d=5, sigmaColor=25, sigmaSpace=25)

    # 4. Merge enhanced channels back
    enhanced_lab = cv2.merge((denoised_l, a_channel, b_channel))
    enhanced_bgr = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

    # 5. Mild unsharp masking to enhance vascular micro-structures
    gaussian = cv2.GaussianBlur(enhanced_bgr, (0, 0), 2.0)
    enhanced_final = cv2.addWeighted(enhanced_bgr, 1.25, gaussian, -0.25, 0)

    filename = os.path.basename(input_path)
    enhanced_filename = f"enhanced_{filename}"
    enhanced_path = os.path.join(output_dir, enhanced_filename)
    cv2.imwrite(enhanced_path, enhanced_final)

    # Re-evaluate quality metrics on both
    orig_metrics = analyze_image_quality(input_path)
    enh_metrics = analyze_image_quality(enhanced_path)

    status_improved = (enh_metrics.contrast_score > orig_metrics.contrast_score) or (enh_metrics.status != orig_metrics.status)

    return EnhanceResponse(
        original_url=f"/uploads/{filename}",
        enhanced_url=f"/uploads/{enhanced_filename}",
        original_metrics=orig_metrics,
        enhanced_metrics=enh_metrics,
        status_improved=status_improved
    )
