from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hash = pwd_context.hash("password123")
with open("hash.txt", "w") as f:
    f.write(hash)
