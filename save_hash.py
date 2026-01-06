from passlib.hash import pbkdf2_sha256

h = pbkdf2_sha256.hash("password123")
with open("valid_hash.txt", "w") as f:
    f.write(h)
print(f"Hash saved: {h}")
