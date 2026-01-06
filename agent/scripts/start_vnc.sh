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

# Start noVNC (websockify)
# Redirects port 6080 to local VNC port 5901
# Assumes noVNC is installed at /usr/share/novnc or user will fix path
# Using websockify directly if available
if command -v websockify &> /dev/null; then
    websockify -D --web=/usr/share/novnc/ 6080 localhost:5901
else
    echo "Error: websockify not found. Please install novnc."
    exit 1
fi

echo "VNC and noVNC started. Connect at http://<IP>:6080/vnc.html"
