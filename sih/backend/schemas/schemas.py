from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    HEALTHCARE_WORKER = "healthcare_worker"
    DOCTOR = "doctor"
    ADMIN = "admin"

class QualityStatus(str, Enum):
    GOOD = "GOOD"
    BORDERLINE = "BORDERLINE"
    POOR = "POOR"

class DRClass(int, Enum):
    NO_DR = 0
    MILD = 1
    MODERATE = 2
    SEVERE = 3
    PROLIFERATIVE = 4

DR_CLASS_LABELS = {
    0: "No Diabetic Retinopathy",
    1: "Mild Non-Proliferative DR",
    2: "Moderate Non-Proliferative DR",
    3: "Severe Non-Proliferative DR",
    4: "Proliferative Diabetic Retinopathy"
}

DR_SUSPECTED_LABELS = {
    0: "No DR Detected",
    1: "Mild DR Suspected",
    2: "Moderate DR Suspected",
    3: "Severe DR Suspected",
    4: "Proliferative DR Suspected"
}

# --- Auth Schemas ---
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: UserRole
    organization: Optional[str] = "Rural Health Center"

# --- Patient Schemas ---
class PatientCreate(BaseModel):
    patient_id: Optional[str] = None
    name: str
    age: int
    gender: str
    phone: Optional[str] = None
    diabetes_duration_years: Optional[float] = None
    blood_sugar_fasting: Optional[float] = None
    location: Optional[str] = "Rural Clinic"

class PatientResponse(BaseModel):
    id: str
    patient_id: str
    name: str
    age: int
    gender: str
    phone: Optional[str] = None
    diabetes_duration_years: Optional[float] = None
    location: Optional[str] = None
    created_at: str
    last_screening_date: Optional[str] = None
    latest_result: Optional[str] = None
    doctor_status: Optional[str] = "None"
    screening_count: int = 0

# --- Quality Schemas ---
class QualityMetrics(BaseModel):
    blur_score: float
    brightness_score: float
    contrast_score: float
    fov_score: float
    resolution: Dict[str, int]
    status: QualityStatus
    reasons: List[str]
    message: str
    can_proceed: bool

# --- Enhancement Schemas ---
class EnhanceResponse(BaseModel):
    original_url: str
    enhanced_url: str
    original_metrics: QualityMetrics
    enhanced_metrics: QualityMetrics
    status_improved: bool

# --- Prediction & XAI Schemas ---
class ClassProbability(BaseModel):
    class_index: int
    class_name: str
    suspected_label: str
    probability: float
    percentage: float

class PredictionResult(BaseModel):
    predicted_class: int
    class_name: str
    suspected_label: str
    confidence: float
    confidence_percentage: float
    probabilities: List[ClassProbability]

class GradCAMResult(BaseModel):
    heatmap_url: str
    overlay_url: str
    attention_summary: str
    disclaimer: str = "Model attention visualization is an AI decision-support tool and not a clinically validated lesion map."

class ReliabilityResult(BaseModel):
    level: str  # "HIGH", "MEDIUM", "LOW"
    score: float
    factors: List[str]
    message: str
    disclaimer: str = "AI decision-support reliability indicator; does not represent clinical certainty."

class GeminiExplanation(BaseModel):
    english_summary: str
    tamil_summary: str
    patient_guidance_en: str
    patient_guidance_ta: str
    clinical_note_en: str
    source: str = "gemini-flash"

# --- Screening Master Schema ---
class ScreeningCreate(BaseModel):
    patient_id: str
    image_filename: str
    notes: Optional[str] = None

class DoctorReviewInput(BaseModel):
    screening_id: str
    doctor_assessment_class: int
    status: str  # "confirmed", "modified", "recapture_requested"
    notes: Optional[str] = None
    recommendation: Optional[str] = None

class DoctorReviewResponse(BaseModel):
    screening_id: str
    doctor_id: str
    doctor_name: str
    doctor_assessment_class: int
    doctor_assessment_label: str
    status: str
    notes: Optional[str] = None
    recommendation: Optional[str] = None
    reviewed_at: str

class ScreeningDetail(BaseModel):
    id: str
    patient_id: str
    patient_name: str
    patient_age: int
    patient_gender: str
    created_at: str
    image_url: str
    enhanced_image_url: Optional[str] = None
    quality_metrics: QualityMetrics
    ai_prediction: Optional[PredictionResult] = None
    gradcam: Optional[GradCAMResult] = None
    reliability: Optional[ReliabilityResult] = None
    gemini_explanation: Optional[GeminiExplanation] = None
    doctor_review: Optional[DoctorReviewResponse] = None
    status: str  # "completed", "quality_failed", "pending_review", "reviewed"

# --- Report Schema ---
class ReportResponse(BaseModel):
    report_id: str
    screening_id: str
    patient_id: str
    patient_name: str
    generated_at: str
    ai_result: str
    doctor_status: str
    doctor_assessment: Optional[str] = None
    report_data: Dict[str, Any]

# --- Dashboard Stats ---
class DashboardStats(BaseModel):
    total_patients: int
    today_screenings: int
    pending_doctor_reviews: int
    poor_quality_images: int
    dr_distribution: Dict[str, int]
    quality_distribution: Dict[str, int]
    timeline: List[Dict[str, Any]]
    recent_screenings: List[Dict[str, Any]]
    priority_alerts: List[Dict[str, Any]]
