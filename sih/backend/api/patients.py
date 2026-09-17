from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import datetime
import uuid
from schemas.schemas import PatientCreate, PatientResponse
from database.mongodb import db_manager

router = APIRouter(prefix="/api/patients", tags=["Patients"])

@router.post("", response_model=PatientResponse)
async def create_patient(req: PatientCreate):
    patients_col = db_manager.get_collection("patients")

    # Generate patient ID like RE-2026-006 if not provided
    p_id = req.patient_id
    if not p_id or not p_id.strip():
        count = patients_col.count_documents({}) + 1
        p_id = f"RE-2026-{count:03d}"

    # Check for existing patient ID
    existing = patients_col.find_one({"patient_id": p_id})
    if existing:
        raise HTTPException(status_code=400, detail=f"Patient ID {p_id} already registered.")

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    doc = {
        "patient_id": p_id,
        "name": req.name.strip(),
        "age": req.age,
        "gender": req.gender,
        "phone": req.phone,
        "diabetes_duration_years": req.diabetes_duration_years,
        "blood_sugar_fasting": req.blood_sugar_fasting,
        "location": req.location or "Rural Health Centre",
        "created_at": now_iso,
        "last_screening_date": None,
        "latest_result": "Pending Screening",
        "doctor_status": "None",
        "screening_count": 0
    }

    res = patients_col.insert_one(doc)
    doc["id"] = str(res.inserted_id if hasattr(res, 'inserted_id') else doc.get("_id", str(uuid.uuid4())))
    return PatientResponse(**doc)

@router.get("", response_model=List[PatientResponse])
async def list_patients(
    search: Optional[str] = Query(None, description="Search by name or patient ID"),
    filter: Optional[str] = Query("all", description="Filter: all, recently_screened, pending_review")
):
    patients_col = db_manager.get_collection("patients")
    query = {}

    all_docs = list(patients_col.find())

    results = []
    for d in all_docs:
        # Search filter
        if search and search.strip():
            s = search.strip().lower()
            if s not in d.get("name", "").lower() and s not in d.get("patient_id", "").lower():
                continue

        # Status filter
        if filter == "recently_screened" and not d.get("last_screening_date"):
            continue
        elif filter == "pending_review" and d.get("doctor_status") != "Pending":
            continue

        item = dict(d)
        item["id"] = str(item.get("_id", item.get("patient_id")))
        results.append(PatientResponse(**item))

    # Sort most recent first
    results.sort(key=lambda x: x.last_screening_date or x.created_at, reverse=True)
    return results

@router.get("/{id}", response_model=PatientResponse)
async def get_patient(id: str):
    patients_col = db_manager.get_collection("patients")
    # Search by patient_id or _id
    doc = patients_col.find_one({"patient_id": id}) or patients_col.find_one({"_id": id})
    if not doc:
        raise HTTPException(status_code=404, detail="Patient not found")

    item = dict(doc)
    item["id"] = str(item.get("_id", item.get("patient_id")))
    return PatientResponse(**item)

@router.get("/{id}/history")
async def get_patient_history(id: str):
    screenings_col = db_manager.get_collection("screenings")
    screenings = list(screenings_col.find({"patient_id": id}))
    
    # Sort chronological
    screenings.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    for s in screenings:
        if "_id" in s:
            s["_id"] = str(s["_id"])
        s["id"] = str(s.get("_id", s.get("id")))
    return screenings
