from fastapi import APIRouter

router = APIRouter()

@router.get("/form-builder/health")
async def form_builder_health() -> dict:
    return {"status": "ok", "module": "form_builder"}
