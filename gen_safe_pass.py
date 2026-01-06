from passlib.hash import pbkdf2_sha256

hash = pbkdf2_sha256.hash("password123")
print(hash)
