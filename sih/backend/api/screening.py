from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel
import os
import uuid
import datetime
import shutil
from typing import Optional, Dict, Any

from schemas.schemas import (
    QualityMetrics, 
    QualityStatus, 
    EnhanceResponse, 
    PredictionResult, 
    GradCAMResult, 
    ReliabilityResult, 
    GeminiExplanation,
    ScreeningDetail
)
from services.quality_service import analyze_image_quality
from services.enhancement_service import enhance_fundus_image
from services.model_service import model_service
from services.gradcam_service import generate_gradcam
from services.reliability_service import compute_reliability
from services.gemini_service import generate_clinical_explanation
from database.mongodb import db_manager

router = APIRouter(prefix="/api/screening", tags=["Screening"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class QualityCheckRequest(BaseModel):
    filename: str

class EnhanceRequest(BaseModel):
    filename: str

class PredictRequest(BaseModel):
    filename: str
    patient_id: str
    override: Optional[bool] = False

class ExplainRequest(BaseModel):
    filename: str
    patient_id: str
    target_class: Optional[int] = None
    override: Optional[bool] = False

@router.post("/upload")
async def upload_retinal_image(file: UploadFile = File(...)):
    # Validate extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a standard retinal photograph (.jpg, .jpeg, .png)."
        )

    # Unique stored filename
    unique_filename = f"fundus_{uuid.uuid4().hex[:12]}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size_mb = round(os.path.getsize(dest_path) / (1024 * 1024), 2)
    if file_size_mb > 25.0:
        os.remove(dest_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image file exceeds maximum allowable size (25 MB). Current: {file_size_mb} MB"
        )

    return {
        "filename": unique_filename,
        "url": f"/uploads/{unique_filename}",
        "size_mb": file_size_mb,
        "message": "Retinal fundus image uploaded successfully. Ready for Quality Gate check."
    }

@router.post("/quality", response_model=QualityMetrics)
async def check_quality(req: QualityCheckRequest):
    img_path = os.path.join(UPLOAD_DIR, req.filename)
    if not os.path.exists(img_path):
        raise HTTPException(status_code=404, detail="Image file not found.")

    try:
        metrics = analyze_image_quality(img_path)
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image quality inspection error: {str(e)}")

@router.post("/enhance", response_model=EnhanceResponse)
async def enhance_image(req: EnhanceRequest):
    img_path = os.path.join(UPLOAD_DIR, req.filename)
    if not os.path.exists(img_path):
        raise HTTPException(status_code=404, detail="Image file not found.")

    try:
        res = enhance_fundus_image(img_path, UPLOAD_DIR)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image enhancement error: {str(e)}")

@router.post("/predict", response_model=PredictionResult)
async def predict_retina(req: PredictRequest):
    img_path = os.path.join(UPLOAD_DIR, req.filename)
    if not os.path.exists(img_path):
        raise HTTPException(status_code=404, detail="Image file not found.")

    # Quality Gate Enforcement
    metrics = analyze_image_quality(img_path)
    if metrics.status == QualityStatus.POOR and not req.override:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": "Quality Gate Rejection",
                "message": "Image quality is POOR. Diabetic Retinopathy prediction cannot be safely executed on degraded fundus photographs. Please recapture image.",
                "metrics": metrics.model_dump()
            }
        )

    try:
        prediction = model_service.predict(img_path)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diabetic Retinopathy prediction error: {str(e)}")

@router.post("/explain")
async def explain_and_finalize_screening(req: ExplainRequest):
    img_path = os.path.join(UPLOAD_DIR, req.filename)
    if not os.path.exists(img_path):
        raise HTTPException(status_code=404, detail="Image file not found.")

    # 1. Quality Check
    metrics = analyze_image_quality(img_path)
    if metrics.status == QualityStatus.POOR and not req.override:
        raise HTTPException(status_code=400, detail="Cannot generate explanation for POOR quality image.")

    # 2. Authentic DR prediction
    prediction = model_service.predict(img_path)

    # 3. Authentic Grad-CAM feature map from Keras model
    gradcam = generate_gradcam(img_path, UPLOAD_DIR, target_class=prediction.predicted_class)

    # 4. Reliability Evaluation
    reliability = compute_reliability(metrics, prediction)

    # 5. Gemini Bilingual Explanation (with fallback)
    gemini_exp = generate_clinical_explanation(
        prediction=prediction,
        quality=metrics,
        reliability=reliability,
        attention_summary=gradcam.attention_summary
    )

    # 6. Store Screening in MongoDB
    patients_col = db_manager.get_collection("patients")
    screenings_col = db_manager.get_collection("screenings")

    patient = patients_col.find_one({"patient_id": req.patient_id})
    patient_name = patient.get("name", "Anonymous Patient") if patient else "Patient"
    patient_age = patient.get("age", 50) if patient else 50
    patient_gender = patient.get("gender", "Unknown") if patient else "Unknown"

    screening_id = f"SCR-{uuid.uuid4().hex[:8].upper()}"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    enhanced_filename = f"enhanced_{req.filename}"
    enhanced_exists = os.path.exists(os.path.join(UPLOAD_DIR, enhanced_filename))

    screening_doc = {
        "screening_id": screening_id,
        "patient_id": req.patient_id,
        "patient_name": patient_name,
        "patient_age": patient_age,
        "patient_gender": patient_gender,
        "created_at": now_iso,
        "image_url": f"/uploads/{req.filename}",
        "enhanced_image_url": f"/uploads/{enhanced_filename}" if enhanced_exists else None,
        "quality_metrics": metrics.model_dump(),
        "ai_prediction": prediction.model_dump(),
        "gradcam": gradcam.model_dump(),
        "reliability": reliability.model_dump(),
        "gemini_explanation": gemini_exp.model_dump(),
        "doctor_review": None,
        "status": "pending_review"
    }

    screenings_col.insert_one(screening_doc)

    # Update patient record
    if patient:
        patients_col.update_one(
            {"patient_id": req.patient_id},
            {
                "$set": {
                    "last_screening_date": now_iso,
                    "latest_result": prediction.suspected_label,
                    "doctor_status": "Pending Review"
                },
                "$inc": {"screening_count": 1}
            }
        )

    screening_doc["id"] = screening_id
    if "_id" in screening_doc:
        screening_doc["_id"] = str(screening_doc["_id"])
    return screening_doc

@router.get("/{id}")
async def get_screening(id: str):
    screenings_col = db_manager.get_collection("screenings")
    doc = screenings_col.find_one({"screening_id": id}) or screenings_col.find_one({"_id": id})
    if not doc:
        raise HTTPException(status_code=404, detail="Screening record not found.")

    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    doc["id"] = str(doc.get("screening_id", doc.get("_id")))
    return doc
