from fastapi import APIRouter, HTTPException, Depends
from schemas.schemas import DoctorReviewInput, DoctorReviewResponse, DR_CLASS_LABELS, DR_SUSPECTED_LABELS
from database.mongodb import db_manager
import datetime
import uuid

router = APIRouter(prefix="/api/doctor", tags=["Doctor Review"])

@router.get("/pending")
async def get_pending_reviews():
    screenings_col = db_manager.get_collection("screenings")
    pending = list(screenings_col.find({"status": "pending_review"}))
    pending.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    for p in pending:
        p["id"] = str(p.get("screening_id", p.get("_id")))
    return pending

@router.post("/review", response_model=DoctorReviewResponse)
async def submit_doctor_review(review: DoctorReviewInput):
    screenings_col = db_manager.get_collection("screenings")
    reviews_col = db_manager.get_collection("doctor_reviews")
    patients_col = db_manager.get_collection("patients")

    screening = screenings_col.find_one({"screening_id": review.screening_id}) or screenings_col.find_one({"_id": review.screening_id})
    if not screening:
        raise HTTPException(status_code=404, detail="Screening record not found.")

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    assessment_label = DR_SUSPECTED_LABELS.get(review.doctor_assessment_class, f"Grade {review.doctor_assessment_class}")

    doctor_review_doc = {
        "review_id": f"REV-{uuid.uuid4().hex[:8].upper()}",
        "screening_id": review.screening_id,
        "doctor_id": "usr_doc_01",
        "doctor_name": "Dr. K. Ramanathan, MD (Ophth)",
        "doctor_assessment_class": review.doctor_assessment_class,
        "doctor_assessment_label": assessment_label,
        "status": review.status,
        "notes": review.notes or "Review verified based on fundus photography and Grad-CAM attention regions.",
        "recommendation": review.recommendation or "Maintain routine HbA1c control and follow-up.",
        "reviewed_at": now_iso
    }

    # Store review in dedicated collection
    reviews_col.insert_one(doctor_review_doc)
    if "_id" in doctor_review_doc:
        doctor_review_doc["_id"] = str(doctor_review_doc["_id"])

    # Update screening with doctor review while PRESERVING original AI prediction
    screenings_col.update_one(
        {"screening_id": review.screening_id},
        {
            "$set": {
                "doctor_review": doctor_review_doc,
                "status": "reviewed"
            }
        }
    )

    # Update patient doctor status
    patient_id = screening.get("patient_id")
    if patient_id:
        status_label = "Confirmed" if review.status == "confirmed" else ("Modified" if review.status == "modified" else "Recapture")
        patients_col.update_one(
            {"patient_id": patient_id},
            {
                "$set": {
                    "doctor_status": status_label,
                    "latest_result": assessment_label
                }
            }
        )

    return DoctorReviewResponse(**doctor_review_doc)
