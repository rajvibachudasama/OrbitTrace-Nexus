import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import Token, UserLogin, UserResponse
from app.auth import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

def seed_users_if_needed(db: Session):
    default_users = [
        ("admin", "admin@orbittrace.space", "nexus2026!", "ADMIN"),
        ("operator", "operator@orbittrace.space", "operator2026!", "OPERATOR"),
        ("analyst", "analyst@orbittrace.space", "analyst2026!", "ANALYST")
    ]
    for username, email, pwd, role in default_users:
        existing = db.query(User).filter(User.username == username).first()
        if not existing:
            u = User(
                username=username,
                email=email,
                hashed_password=get_password_hash(pwd),
                role=role,
                is_active=True
            )
            db.add(u)
    db.commit()

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    seed_users_if_needed(db)
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
