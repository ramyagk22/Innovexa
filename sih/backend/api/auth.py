from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from schemas.schemas import LoginRequest, TokenResponse, UserResponse
from utils.security import DEMO_USERS, verify_password, create_access_token, decode_access_token
import datetime

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    email = req.email.strip().lower()
    user = DEMO_USERS.get(email)
    
    if not user:
        # Check if matching demo email or allow demo shortcut
        for u_email, u_data in DEMO_USERS.items():
            if email in [u_email, u_data["role"], u_data["name"].lower()]:
                user = u_data
                break

    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please use a provided demo credential."
        )

    token_data = {
        "sub": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"]
    }
    token = create_access_token(token_data, datetime.timedelta(hours=24))

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "organization": user["organization"]
        }
    )

@router.get("/me")
async def get_me(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        # Return default healthcare worker demo profile if not logged in for smooth presentation
        demo = DEMO_USERS["asha@ruraleye.org"]
        return {
            "id": demo["id"],
            "email": demo["email"],
            "name": demo["name"],
            "role": demo["role"],
            "organization": demo["organization"]
        }

    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalid or expired")

    return payload
