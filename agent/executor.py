import subprocess
import shutil
import psutil
import platform
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ActionExecutor:
    """
    Secure command executor for CloudOS Control Agent.
    Enforces an allowlist of commands to prevent arbitrary execution.
    """
    
    ALLOWED_COMMANDS = {}
    COMMANDS_FILE = "commands.json"

    def __init__(self):
        self.os_type = platform.system()
        self.load_commands()

    def load_commands(self):
        import json
        import os
        
        # Default commands
        defaults = {
            "restart_nginx": ["sudo", "systemctl", "restart", "nginx"],
            "stop_nginx": ["sudo", "systemctl", "stop", "nginx"],
            "start_nginx": ["sudo", "systemctl", "start", "nginx"],
            "get_logs": ["tail", "-n", "50", "/var/log/syslog"],
            "update_system": ["sudo", "apt", "update"],
            "whoami": ["whoami"],
            "start_desktop": ["bash", "agent/scripts/start_vnc.sh"],
            "stop_desktop": ["pkill", "-f", "vnc"],
        }
        
        if os.path.exists(self.COMMANDS_FILE):
            try:
                with open(self.COMMANDS_FILE, 'r') as f:
                    self.ALLOWED_COMMANDS = json.load(f)
            except Exception as e:
                logger.error(f"Failed to load commands: {e}")
                self.ALLOWED_COMMANDS = defaults
        else:
            self.ALLOWED_COMMANDS = defaults
            self.save_commands()

    def save_commands(self):
        import json
        with open(self.COMMANDS_FILE, 'w') as f:
            json.dump(self.ALLOWED_COMMANDS, f, indent=4)

    def add_command(self, name: str, command: str):
        # command string needs to be split for subprocess if it's a simple string
        # For simplicity in this UI, we might assume the user types a full command string
        # which we then split securely or use shell=True (Riskier, but "Agent" implies control).
        # ideally we split by shlex.
        import shlex
        try:
            parts = shlex.split(command)
            self.ALLOWED_COMMANDS[name] = parts
            self.save_commands()
            return True
        except Exception as e:
            logger.error(f"Failed to parse command: {e}")
            return False

    def get_commands(self):
        return self.ALLOWED_COMMANDS

    def is_allowed(self, action_name: str) -> bool:
        return action_name in self.ALLOWED_COMMANDS

    def execute_action(self, action_name: str):
        """
        Executes a pre-defined action from the allowlist.
        """
        if not self.is_allowed(action_name):
            logger.warning(f"Attempted execution of unauthorized action: {action_name}")
            return {"error": "Action not allowed", "status": "failed"}

        command = self.ALLOWED_COMMANDS[action_name]
        
        try:
            logger.info(f"Executing action: {action_name}")
            # Capture output
            result = subprocess.run(
                command, 
                capture_output=True, 
                text=True, 
                timeout=10,
                check=False
            )
            
            return {
                "status": "success" if result.returncode == 0 else "error",
                "stdout": result.stdout.strip(),
                "stderr": result.stderr.strip(),
                "code": result.returncode
            }
        except Exception as e:
            logger.error(f"Execution failed: {str(e)}")
            return {"error": str(e), "status": "failed"}

    def get_system_status(self):
        """
        Retrieves real-time system metrics using psutil.
        """
        try:
            cpu_usage = psutil.cpu_percent(interval=1)
            virtual_mem = psutil.virtual_memory()
            disk_usage = shutil.disk_usage("/")

            return {
                "status": "online",
                "os": f"{platform.system()} {platform.release()}",
                "cpu_usage": f"{cpu_usage}%",
                "ram_usage": f"{virtual_mem.used / (1024**3):.2f}GB / {virtual_mem.total / (1024**3):.2f}GB",
                "disk_usage": f"{(disk_usage.used / disk_usage.total) * 100:.1f}%",
                "uptime": "N/A" # TODO: implementing uptime based on OS
            }
        except Exception as e:
            logger.error(f"Failed to get system status: {str(e)}")
            return {"error": "Failed to retrieve status"}

if __name__ == "__main__":
    # Test execution
    executor = ActionExecutor()
    print("System Status:", executor.get_system_status())
    print("Test whoami:", executor.execute_action("whoami"))
