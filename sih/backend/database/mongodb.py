import os
import logging
from typing import Dict, Any, List, Optional
import pymongo
from pymongo import MongoClient
from dotenv import load_dotenv
import datetime
import uuid

load_dotenv()

logger = logging.getLogger("ruraleye.db")

MONGODB_URI = os.getenv("MONGODB_URI", "")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ruraleye")

class InMemoryCollection:
    """Thread-safe in-memory fallback mimicking PyMongo collection API"""
    def __init__(self, name: str):
        self.name = name
        self.docs: List[Dict[str, Any]] = []

    def insert_one(self, doc: Dict[str, Any]):
        doc_copy = dict(doc)
        if "_id" not in doc_copy:
            doc_copy["_id"] = str(uuid.uuid4())
        self.docs.append(doc_copy)
        class InsertResult:
            inserted_id = doc_copy["_id"]
        return InsertResult()

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for d in self.docs:
            match = True
            for k, v in query.items():
                if d.get(k) != v:
                    match = False
                    break
            if match:
                return dict(d)
        return None

    def find(self, query: Optional[Dict[str, Any]] = None, sort: Optional[List] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        results = []
        q = query or {}
        for d in self.docs:
            match = True
            for k, v in q.items():
                if k == "$or" and isinstance(v, list):
                    or_match = any(all(d.get(subk) == subv for subk, subv in item.items()) for item in v)
                    if not or_match:
                        match = False
                        break
                elif d.get(k) != v:
                    match = False
                    break
            if match:
                results.append(dict(d))

        if sort:
            for key, direction in reversed(sort):
                results.sort(key=lambda x: x.get(key, ""), reverse=(direction == pymongo.DESCENDING or direction == -1))

        if limit:
            results = results[:limit]
        return results

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        for d in self.docs:
            match = True
            for k, v in query.items():
                if d.get(k) != v:
                    match = False
                    break
            if match:
                if "$set" in update:
                    d.update(update["$set"])
                class UpdateResult:
                    modified_count = 1
                return UpdateResult()
        class UpdateResult:
            modified_count = 0
        return UpdateResult()

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        if not query:
            return len(self.docs)
        return len(self.find(query))


class DatabaseManager:
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db = None
        self.is_connected = False
        self.use_fallback = False
        self.fallback_collections: Dict[str, InMemoryCollection] = {}

    def connect(self):
        uri = os.getenv("MONGODB_URI", "")
        db_name = os.getenv("DATABASE_NAME", "ruraleye")
        if uri and ("mongodb://" in uri or "mongodb+srv://" in uri):
            try:
                logger.info("Attempting MongoDB connection...")
                # 3 second timeout for responsive fallback
                self.client = MongoClient(uri, serverSelectionTimeoutMS=3000)
                # Check connection
                self.client.admin.command('ping')
                self.db = self.client[db_name]
                self.is_connected = True
                self.use_fallback = False
                logger.info(f"Connected to MongoDB Atlas: {db_name}")
                self._seed_initial_data_if_empty()
                return
            except Exception as e:
                logger.warning(f"MongoDB connection failed: {e}. Switching to high-reliability clinical in-memory store.")

        self.use_fallback = True
        self.is_connected = False
        self._init_fallback_db()

    def _init_fallback_db(self):
        for col in ["users", "patients", "screenings", "doctor_reviews", "reports", "audit_logs"]:
            if col not in self.fallback_collections:
                self.fallback_collections[col] = InMemoryCollection(col)
        self._seed_initial_data_if_empty()

    def get_collection(self, name: str):
        if self.is_connected and self.db is not None:
            return self.db[name]
        if name not in self.fallback_collections:
            self.fallback_collections[name] = InMemoryCollection(name)
        return self.fallback_collections[name]

    def _seed_initial_data_if_empty(self):
        patients_col = self.get_collection("patients")
        if patients_col.count_documents({}) == 0:
            logger.info("Seeding realistic sample clinical demo patients for SIH 2026...")
            demo_patients = [
                {
                    "patient_id": "RE-2026-001",
                    "name": "Muthuvel Karuppan",
                    "age": 58,
                    "gender": "Male",
                    "phone": "+91 94432 18901",
                    "diabetes_duration_years": 12.0,
                    "location": "Valangaiman Primary Health Centre",
                    "created_at": "2026-08-15T09:30:00",
                    "last_screening_date": "2026-09-02T10:15:00",
                    "latest_result": "Moderate DR Suspected",
                    "doctor_status": "Confirmed",
                    "screening_count": 2
                },
                {
                    "patient_id": "RE-2026-002",
                    "name": "Lakshmi Narayanan",
                    "age": 64,
                    "gender": "Female",
                    "phone": "+91 98421 65432",
                    "diabetes_duration_years": 8.5,
                    "location": "Thiruvaiyaru Health Sub-centre",
                    "created_at": "2026-08-20T11:00:00",
                    "last_screening_date": "2026-09-05T14:20:00",
                    "latest_result": "Mild DR Suspected",
                    "doctor_status": "Pending",
                    "screening_count": 1
                },
                {
                    "patient_id": "RE-2026-003",
                    "name": "Senthil Kumar",
                    "age": 47,
                    "gender": "Male",
                    "phone": "+91 97890 23456",
                    "diabetes_duration_years": 4.0,
                    "location": "Papanasam Rural Clinic",
                    "created_at": "2026-08-25T10:45:00",
                    "last_screening_date": "2026-09-06T09:10:00",
                    "latest_result": "No DR Detected",
                    "doctor_status": "Confirmed",
                    "screening_count": 1
                },
                {
                    "patient_id": "RE-2026-004",
                    "name": "Meenakshi Sundaram",
                    "age": 71,
                    "gender": "Female",
                    "phone": "+91 94863 77889",
                    "diabetes_duration_years": 18.0,
                    "location": "Kumbakonam Taluk Hospital",
                    "created_at": "2026-09-01T15:00:00",
                    "last_screening_date": "2026-09-07T11:40:00",
                    "latest_result": "Severe DR Suspected",
                    "doctor_status": "Pending",
                    "screening_count": 3
                },
                {
                    "patient_id": "RE-2026-005",
                    "name": "Arunachalam Pillai",
                    "age": 53,
                    "gender": "Male",
                    "phone": "+91 99401 54321",
                    "diabetes_duration_years": 6.0,
                    "location": "Budalur Rural Dispensary",
                    "created_at": "2026-09-03T10:00:00",
                    "last_screening_date": "2026-09-08T09:30:00",
                    "latest_result": "Proliferative DR Suspected",
                    "doctor_status": "Pending",
                    "screening_count": 1
                }
            ]
            for p in demo_patients:
                patients_col.insert_one(p)

db_manager = DatabaseManager()
