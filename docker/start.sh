# Build the Docker image
docker build -t skav-os .

# Run the container
# Maps host port 6080 to container port 6080
echo "Starting SKAV TECH OS..."
echo "Access via browser at http://localhost:6080/vnc.html"
docker run -p 6080:6080 -p 5901:5901 -d --name skav-os-container skav-os
