import sys
import os

# Add parent dir to sys.path to allow importing agent
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, Depends, WebSocket
from fastapi.staticfiles import StaticFiles
from starlette.websockets import WebSocketDisconnect
import websockets
import asyncio
from pydantic import BaseModel
from backend.auth import create_access_token, verify_password, FAKE_USERS_DB, verify_token
from agent.executor import ActionExecutor

app = FastAPI(title="CloudOS Remote Controller API")
app = FastAPI(title="CloudOS Remote Controller API")

# Mount noVNC static files
# We assume /usr/share/novnc is available (standard ubuntu package)
if os.path.exists("/usr/share/novnc"):
    app.mount("/novnc", StaticFiles(directory="/usr/share/novnc", html=True), name="novnc")

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
def get_status():
    """
    Get system status from the Agent. Public route.
    """
    return executor.get_system_status()

@app.post("/os/action")
def execute_action(request: CommandRequest):
    """
    Execute a command via the Agent. Public route.
    """
    result = executor.execute_action(request.command)
    if result.get("status") == "failed":
        raise HTTPException(status_code=400, detail=result.get("error", "Execution failed"))
    
    return result

class NewCommandRequest(BaseModel):
    name: str
    command: str

@app.get("/os/commands")
def get_commands():
    return executor.get_commands()

@app.post("/os/commands")
def add_command(request: NewCommandRequest):
    success = executor.add_command(request.name, request.command)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to add command")
    return {"status": "success", "commands": executor.get_commands()}

@app.websocket("/websockify")
async def vnc_proxy(websocket: WebSocket):
    """
    WebSocket proxy to local VNC server (localhost:5901)
    """
    await websocket.accept()
    vnc_host = "localhost"
    vnc_port = 5901

    try:
        async with websockets.connect(f"ws://{vnc_host}:{vnc_port}", subprotocols=['binary']) as vnc_ws:
            async def forward_to_vnc():
                try:
                    while True:
                        data = await websocket.receive_bytes()
                        await vnc_ws.send(data)
                except WebSocketDisconnect:
                    pass
                except Exception as e:
                    print(f"Error forwarding to VNC: {e}")

            async def forward_to_client():
                try:
                    while True:
                        data = await vnc_ws.recv()
                        await websocket.send_bytes(data)
                except Exception as e:
                     print(f"Error forwarding to Client: {e}")

            await asyncio.gather(forward_to_vnc(), forward_to_client())
    except Exception as e:
        print(f"VNC Connection Error: {e}")
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
