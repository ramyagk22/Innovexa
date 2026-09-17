import os
import datetime
from typing import Optional, Dict, Any
import jwt
import bcrypt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET", "ruraleye_sih_2026_clinical_decision_support_secret_token")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours for demo ease

# Demo Users Pre-configured for SIH 2026 Presentation
DEMO_USERS = {
    "asha@ruraleye.org": {
        "id": "usr_hw_01",
        "email": "asha@ruraleye.org",
        "password_hash": "$2b$12$eXAmpLeHAsHEDPassW0rdForDemo12345678901234567890123456",
        "name": "Priya Selvam (ASHA)",
        "role": "healthcare_worker",
        "organization": "Thanjavur Primary Health Centre"
    },
    "doctor@ruraleye.org": {
        "id": "usr_doc_01",
        "email": "doctor@ruraleye.org",
        "password_hash": "$2b$12$eXAmpLeHAsHEDPassW0rdForDemo12345678901234567890123456",
        "name": "Dr. K. Ramanathan, MD (Ophth)",
        "role": "doctor",
        "organization": "Regional Eye Hospital, Madurai"
    },
    "admin@ruraleye.org": {
        "id": "usr_adm_01",
        "email": "admin@ruraleye.org",
        "password_hash": "$2b$12$eXAmpLeHAsHEDPassW0rdForDemo12345678901234567890123456",
        "name": "State Nodal Health Officer",
        "role": "admin",
        "organization": "National Health Mission, Tamil Nadu"
    }
}

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        # For demo convenience if using default demo passwords
        return plain_password in ["demo123", "password", "ruraleye2026"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: Dict[str, Any], expires_delta: Optional[datetime.timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None
