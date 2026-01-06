#!/bin/bash
# start_vnc.sh
# Starts VNC server and noVNC

# Set screen resolution
export GEOMETRY="1280x720"

# Kill existing instances
pkill -f vnc
rm -rf /tmp/.X* /tmp/.X11-unix/X*

# Start VNC Server (on display :1)
# Note: User must set 'vncpasswd' once beforehand
vncserver :1 -geometry $GEOMETRY -depth 24

# websockify is now handled by the Python backend via FastAPI
echo "VNC server started on :1"

echo "VNC and noVNC started. Connect at http://<IP>:6080/vnc.html"
