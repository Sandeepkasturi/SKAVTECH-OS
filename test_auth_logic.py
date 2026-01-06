from backend.auth import verify_password, FAKE_USERS_DB

user = FAKE_USERS_DB["admin"]
input_pass = "password123"
hash = user["password_hash"]

print(f"User: {user['username']}")
print(f"Hash: {hash}")
print(f"Input: {input_pass}")

try:
    result = verify_password(input_pass, hash)
    print(f"Verification Result: {result}")
except Exception as e:
    print(f"Verification FAILED with error: {e}")
