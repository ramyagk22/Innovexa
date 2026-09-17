from fastapi import APIRouter, HTTPException
from database.mongodb import db_manager
import datetime
import uuid

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.post("/generate")
async def generate_report(payload: dict):
    screening_id = payload.get("screening_id")
    if not screening_id:
        raise HTTPException(status_code=400, detail="screening_id is required")

    screenings_col = db_manager.get_collection("screenings")
    reports_col = db_manager.get_collection("reports")

    screening = screenings_col.find_one({"screening_id": screening_id}) or screenings_col.find_one({"_id": screening_id})
    if not screening:
        raise HTTPException(status_code=404, detail="Screening record not found")

    report_id = f"REP-{uuid.uuid4().hex[:8].upper()}"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    doc_review = screening.get("doctor_review")
    doctor_status = doc_review.get("status", "Pending") if doc_review else "Pending Doctor Review"
    doctor_assessment = doc_review.get("doctor_assessment_label") if doc_review else "Pending Clinical Review"

    report_doc = {
        "report_id": report_id,
        "screening_id": screening_id,
        "patient_id": screening.get("patient_id"),
        "patient_name": screening.get("patient_name"),
        "patient_age": screening.get("patient_age"),
        "patient_gender": screening.get("patient_gender"),
        "generated_at": now_iso,
        "ai_result": screening.get("ai_prediction", {}).get("suspected_label", "Unknown"),
        "ai_confidence": screening.get("ai_prediction", {}).get("confidence_percentage", 0),
        "doctor_status": doctor_status,
        "doctor_assessment": doctor_assessment,
        "doctor_notes": doc_review.get("notes") if doc_review else None,
        "doctor_recommendation": doc_review.get("recommendation") if doc_review else None,
        "screening_data": screening
    }

    reports_col.insert_one(report_doc)
    report_doc["id"] = report_id
    if "_id" in report_doc:
        report_doc["_id"] = str(report_doc["_id"])
    if "_id" in report_doc.get("screening_data", {}):
        report_doc["screening_data"]["_id"] = str(report_doc["screening_data"]["_id"])
    return report_doc

@router.get("")
async def list_reports():
    reports_col = db_manager.get_collection("reports")
    reports = list(reports_col.find())
    reports.sort(key=lambda x: x.get("generated_at", ""), reverse=True)
    for r in reports:
        if "_id" in r:
            r["_id"] = str(r["_id"])
        if "_id" in r.get("screening_data", {}):
            r["screening_data"]["_id"] = str(r["screening_data"]["_id"])
        r["id"] = str(r.get("report_id", r.get("_id")))
    return reports

@router.get("/{id}")
async def get_report(id: str):
    reports_col = db_manager.get_collection("reports")
    report = reports_col.find_one({"report_id": id}) or reports_col.find_one({"_id": id})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if "_id" in report:
        report["_id"] = str(report["_id"])
    if "_id" in report.get("screening_data", {}):
        report["screening_data"]["_id"] = str(report["screening_data"]["_id"])
    report["id"] = str(report.get("report_id", report.get("_id")))
    return report
