import os
import sys

# Ensure backend root is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from main import app

def test_full_pipeline():
    with TestClient(app) as client:
        print("\n--- 1. Testing Root Health Endpoint ---")
        res = client.get("/")
        assert res.status_code == 200, f"Root failed: {res.text}"
        print("[OK] Root OK:", res.json()["project"], "| Model loaded:", res.json()["model_loaded"])

        print("\n--- 2. Testing Auth Login (Healthcare Worker Demo) ---")
        res = client.post("/api/auth/login", json={"email": "asha@ruraleye.org", "password": "demo123"})
        assert res.status_code == 200, f"Login failed: {res.text}"
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("[OK] Auth OK:", res.json()["user"]["name"], "| Role:", res.json()["user"]["role"])

        print("\n--- 3. Testing Patient Listing & Seed Data ---")
        res = client.get("/api/patients")
        assert res.status_code == 200, f"Patients list failed: {res.text}"
        patients = res.json()
        assert len(patients) >= 1, "Expected at least 1 patient"
        test_patient = patients[0]
        print(f"[OK] Patients OK: {len(patients)} patients loaded (First: {test_patient['name']} [{test_patient['patient_id']}])")

        print("\n--- 4. Testing Image Quality Gate on sample_normal.jpg ---")
        res = client.post("/api/screening/quality", json={"filename": "sample_normal.jpg"})
        assert res.status_code == 200, f"Quality check failed: {res.text}"
        quality_data = res.json()
        print(f"[OK] Quality Gate OK: Status={quality_data['status']} | Blur={quality_data['blur_score']} | Contrast={quality_data['contrast_score']}")

        print("\n--- 5. Testing Real Keras DR Model Prediction on sample_dr.jpg ---")
        res = client.post("/api/screening/predict", json={"filename": "sample_dr.jpg", "patient_id": test_patient["patient_id"]})
        assert res.status_code == 200, f"Prediction failed: {res.text}"
        pred_data = res.json()
        print(f"[OK] Model Prediction OK: Class={pred_data['predicted_class']} ({pred_data['class_name']}) | Conf={pred_data['confidence_percentage']}%")

        print("\n--- 6. Testing Screening Explain (Grad-CAM + Reliability + Gemini) ---")
        res = client.post("/api/screening/explain", json={"filename": "sample_dr.jpg", "patient_id": test_patient["patient_id"]})
        assert res.status_code == 200, f"Explain failed: {res.text}"
        screening_data = res.json()
        scr_id = screening_data["screening_id"]
        print(f"[OK] Screening Finalized OK: ID={scr_id}")
        print(f"  Grad-CAM Overlay: {screening_data['gradcam']['overlay_url']}")
        print(f"  Reliability: {screening_data['reliability']['level']} ({screening_data['reliability']['score']}%)")
        print(f"  Gemini Explanation EN: {screening_data['gemini_explanation']['english_summary'][:60]}...")

        print("\n--- 7. Testing Doctor Review Handover ---")
        res = client.post("/api/doctor/review", json={
            "screening_id": scr_id,
            "doctor_assessment_class": pred_data["predicted_class"],
            "status": "confirmed",
            "notes": "Verified microaneurysms and hard exudate clusters in parafoveal zone. Clinical correlation matches AI.",
            "recommendation": "Prompt dilated ophthalmic examination within 2 weeks."
        })
        assert res.status_code == 200, f"Doctor review failed: {res.text}"
        print("[OK] Doctor Review OK: Status=Confirmed by", res.json()["doctor_name"])

        print("\n--- 8. Testing Clinical Report Generation ---")
        res = client.post("/api/reports/generate", json={"screening_id": scr_id})
        assert res.status_code == 200, f"Report generation failed: {res.text}"
        print("[OK] Report Generation OK: Report ID=", res.json()["report_id"])

        print("\n--- 9. Testing Dashboard Aggregated Stats ---")
        res = client.get("/api/dashboard/stats")
        assert res.status_code == 200, f"Dashboard stats failed: {res.text}"
        stats = res.json()
        print(f"[OK] Dashboard Stats OK: Total Patients={stats['total_patients']} | Pending Reviews={stats['pending_doctor_reviews']}")

        print("\n=======================================================")
        print("ALL 9 BACKEND SERVICES & MODEL WORKFLOWS VERIFIED 100%!")
        print("=======================================================\n")

if __name__ == "__main__":
    test_full_pipeline()
