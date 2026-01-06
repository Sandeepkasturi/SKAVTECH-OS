import sys
import os

# Add parent dir to sys.path to allow importing agent
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from backend.auth import create_access_token, verify_password, FAKE_USERS_DB, verify_token
from agent.executor import ActionExecutor

app = FastAPI(title="CloudOS Remote Controller API")
executor = ActionExecutor()

class LoginRequest(BaseModel):
    username: str
    password: str

class CommandRequest(BaseModel):
    command: str

@app.get("/")
def read_root():
    return {"status": "CloudOS Controller Online"}

from fastapi.responses import JSONResponse

@app.post("/auth/login")
def login(request: LoginRequest):
    try:
        user = FAKE_USERS_DB.get(request.username)
        if not user:
            print(f"Login failed: User {request.username} not found")
            return JSONResponse(status_code=401, content={"detail": "Invalid credentials"})
            
        if not verify_password(request.password, user["password_hash"]):
            print(f"Login failed: Password mismatch for {request.username}")
            return JSONResponse(status_code=401, content={"detail": "Invalid credentials"})
        
        access_token = create_access_token(data={"sub": user["username"]})
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"INTERNAL LOGIN ERROR: {e}")
        return JSONResponse(status_code=500, content={"detail": f"Internal Server Error: {str(e)}"})

@app.get("/os/status")
def get_status(user: dict = Depends(verify_token)):
    """
    Get system status from the Agent. Protected route.
    """
    return executor.get_system_status()

@app.post("/os/action")
def execute_action(request: CommandRequest, user: dict = Depends(verify_token)):
    """
    Execute a command via the Agent. Protected route.
    """
    result = executor.execute_action(request.command)
    if result.get("status") == "failed":
        raise HTTPException(status_code=400, detail=result.get("error", "Execution failed"))
    
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
