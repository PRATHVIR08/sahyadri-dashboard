import hashlib
import re
import secrets
from datetime import datetime, timedelta

from jose import JWTError, jwt

from .config import settings

COLLEGE_EMAIL = re.compile(rf"^[a-zA-Z0-9._%+-]+@{re.escape(settings.college_email_domain)}$")
PREFERRED_FORMAT = re.compile(r"^[a-z]+\.[a-z]+\.\d{2}@" + re.escape(settings.college_email_domain) + r"$", re.I)


def is_college_email(email: str) -> bool:
    return bool(COLLEGE_EMAIL.match(email.strip().lower()))


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000)
    return f"{salt}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt, digest = stored.split("$", 1)
    except ValueError:
        return False
    check = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000).hex()
    return secrets.compare_digest(check, digest)


def create_access_token(sub: str, role: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode({"sub": sub, "role": role, "exp": expire}, settings.secret_key, algorithm=settings.algorithm)


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])


def marks_to_grade(total: float) -> tuple[str, int]:
    if total >= 90:
        return "O", 10
    if total >= 80:
        return "A+", 9
    if total >= 70:
        return "A", 8
    if total >= 60:
        return "B+", 7
    if total >= 55:
        return "B", 6
    if total >= 50:
        return "C", 5
    if total >= 40:
        return "P", 4
    return "F", 0
