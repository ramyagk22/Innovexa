import numpy as np
from typing import List
from schemas.schemas import QualityMetrics, PredictionResult, ReliabilityResult, QualityStatus

def compute_reliability(quality: QualityMetrics, prediction: PredictionResult) -> ReliabilityResult:
    """
    Computes an AI decision-support reliability indicator based on:
    1. Input image optical clarity and contrast (from OpenCV Quality Gate)
    2. Primary model confidence
    3. Prediction entropy / margin across the 5 DR stages
    """
    factors: List[str] = []

    # Quality factor
    if quality.status == QualityStatus.GOOD:
        q_factor = 0.90
        factors.append("Retinal disc clarity and contrast are optimal.")
    elif quality.status == QualityStatus.BORDERLINE:
        q_factor = 0.55
        factors.append("Borderline image quality may affect subtle microvascular lesion detection.")
    else:
        q_factor = 0.15
        factors.append("Poor retinal illumination or motion blur severely degrades AI reliability.")

    # Shannon Entropy across class probabilities
    probs = [cp.probability for cp in prediction.probabilities]
    probs_clean = [p for p in probs if p > 1e-6]
    entropy = -sum(p * np.log(p) for p in probs_clean)
    max_entropy = np.log(5.0)  # ~1.6094 for 5 classes
    normalized_entropy = float(entropy / max_entropy)  # 0 (completely certain) to 1 (pure random uniform)

    if normalized_entropy < 0.35:
        factors.append("Model output distribution shows strong singular class separation.")
    elif normalized_entropy < 0.70:
        factors.append("Moderate probability dispersion between adjacent DR grades.")
    else:
        factors.append("High class dispersion across multiple DR stages.")

    # Confidence margin between top-1 and top-2
    sorted_probs = sorted(probs, reverse=True)
    top1 = sorted_probs[0]
    top2 = sorted_probs[1] if len(sorted_probs) > 1 else 0.0
    margin = top1 - top2

    # Weighted composite score [0.0 - 1.0]
    composite = (q_factor * 0.40) + (top1 * 0.35) + ((1.0 - normalized_entropy) * 0.25)
    score_percentage = round(composite * 100.0, 1)

    if quality.status == QualityStatus.POOR or composite < 0.45:
        level = "LOW"
        message = "Elevated prediction ambiguity or insufficient image clarity. Clinical ophthalmologist evaluation required."
    elif composite < 0.72:
        level = "MEDIUM"
        message = "Doctor review recommended to confirm borderline lesion indicators."
    else:
        level = "HIGH"
        message = "Strong image clarity and clear feature correspondence. Standard doctor verification advised."

    return ReliabilityResult(
        level=level,
        score=score_percentage,
        factors=factors,
        message=message,
        disclaimer="AI decision-support reliability indicator; does not represent clinical certainty."
    )
