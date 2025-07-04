from fastapi import Request
from fastapi.exceptions import HTTPException

def get_current_user(request: Request):
    if not hasattr(request.state, "user_email"):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {
        "email": request.state.user_email,
        "role": request.state.role,
    }

def validate_user_role(user_info: dict, required_roles: list[str] = None):
    if required_roles is None:
        return

    if user_info.get("role") not in required_roles:
        raise HTTPException(status_code=403, detail="Forbidden: insufficient permissions")