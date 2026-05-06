"""
ORHUN AI — Backend API (FastAPI)
Runs on Oracle ARM Ubuntu server.

This backend:
- Verifies Supabase JWT tokens
- Manages credit consumption (atomic)
- Proxies generation requests to HuggingFace Space
- Uploads results to Supabase Storage
- Saves song metadata to Supabase DB
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

# ============================================================
# Configuration
# ============================================================
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
HF_SPACE_URL = os.getenv("HF_SPACE_URL", "")
HF_TOKEN = os.getenv("HF_TOKEN", "")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("orhun-backend")


# ============================================================
# Lifespan (startup/shutdown)
# ============================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Orhun Backend starting...")
    logger.info(f"   Supabase URL: {SUPABASE_URL[:30]}...")
    logger.info(f"   HF Space URL: {HF_SPACE_URL}")
    logger.info(f"   Allowed origins: {ALLOWED_ORIGINS}")
    
    if not all([SUPABASE_URL, SUPABASE_SERVICE_KEY, HF_SPACE_URL]):
        logger.warning("⚠️  Some env variables are missing!")
    
    yield
    logger.info("👋 Shutting down...")


# ============================================================
# App
# ============================================================
app = FastAPI(
    title="Orhun AI Backend",
    version="0.1.0",
    description="API for orhun-ai.vercel.app",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["*"],
)


# ============================================================
# Health check
# ============================================================
@app.get("/")
async def root():
    return {"name": "Orhun AI Backend", "version": "0.1.0", "status": "ok"}


@app.get("/health")
async def health():
    """Health check endpoint — Oracle monitoring uchun."""
    return {
        "status": "ok",
        "supabase_configured": bool(SUPABASE_URL and SUPABASE_SERVICE_KEY),
        "hf_configured": bool(HF_SPACE_URL),
    }


# ============================================================
# Models (Pydantic)
# ============================================================
class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=500)
    lyrics: Optional[str] = Field(default=None, max_length=3000)
    genre_ids: list[int] = Field(default_factory=list, max_length=5)
    voice_type: str = Field(..., pattern="^(male|female|instrumental)$")
    duration: int = Field(default=180, ge=60, le=240)


class GenerateResponse(BaseModel):
    song_id: str
    status: str  # "queued" | "ready" | "error"
    message: Optional[str] = None


# ============================================================
# Auth dependency (Supabase JWT verification)
# ============================================================
async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """
    Frontend Supabase JWT token yuboradi.
    Biz uni tekshirib user_id qaytaramiz.
    
    HOZIRCHA SKELETON — to'liq implementatsiya Hafta 2'da.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    # TODO: Hafta 2'da implementation
    # import jwt
    # payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
    # return {"id": payload["sub"], "email": payload["email"]}
    
    return {"id": "demo-user-id", "token": token}


# ============================================================
# Test endpoint — HF Space ulanishini tekshirish
# ============================================================
@app.get("/test-hf")
async def test_huggingface():
    """
    HuggingFace Space ishlayotganini tekshirish.
    Curl: curl http://YOUR-IP:8000/test-hf
    """
    if not HF_SPACE_URL:
        return {"error": "HF_SPACE_URL not configured"}
    
    try:
        from gradio_client import Client
        client = Client(HF_SPACE_URL.replace("https://", "").replace(".hf.space", "").rstrip("/"))
        return {
            "status": "connected",
            "space_url": HF_SPACE_URL,
            "info": "HF Space is reachable",
        }
    except Exception as e:
        logger.error(f"HF test failed: {e}")
        return {"status": "error", "message": str(e)}


# ============================================================
# Main generate endpoint (HOZIRCHA SKELETON)
# Hafta 3'da to'liq implementatsiya bo'ladi
# ============================================================
@app.post("/api/generate", response_model=GenerateResponse)
async def generate_song(
    req: GenerateRequest,
    user: dict = Depends(get_current_user),
):
    """
    Foydalanuvchi promtidan qo'shiq yaratish.
    
    Pipeline (Hafta 3'da to'liq amalga oshiriladi):
    1. JWT dan user_id olish ✓
    2. Supabase'da kreditni atomic kamaytirish (consume_credit RPC)
    3. songs jadvaliga "is_ready=false" yozuv qo'shish
    4. HF Space'ga API call (gradio_client orqali)
    5. Audio'ni Supabase Storage'ga yuklash
    6. songs yozuvini yangilash (audio_url, is_ready=true)
    7. song_id qaytarish
    """
    logger.info(f"Generate request from user {user.get('id')}: {req.prompt[:50]}")
    
    # TODO: Hafta 3'da implementation
    return GenerateResponse(
        song_id="not-implemented-yet",
        status="error",
        message="Generate endpoint will be implemented in Week 3",
    )


# ============================================================
# Run (development)
# ============================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
