FROM ubuntu:latest

# Avoid prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Update and install essential packages
RUN apt-get update && apt-get install -y \
    software-properties-common \
    wget \
    gnupg \
    unzip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && apt-get install -y google-chrome-stable

# Install XFCE Desktop & VNC Server (Core Desktop)
RUN apt-get update && apt-get install -y \
    xfce4 \
    xfce4-goodies \
    tigervnc-standalone-server \
    novnc \
    websockify \
    dbus-x11 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install System Tools & Utilities
RUN apt-get update && apt-get install -y \
    net-tools \
    curl \
    git \
    supervisor \
    openssh-server \
    vim \
    nano \
    sudo \
    htop \
    neofetch \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Applications (Office, Media, ETC)
RUN apt-get update && apt-get install -y \
    libreoffice \
    vlc \
    geany \
    ristretto \
    file-roller \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create a non-root user 'skav' with password 'password' (change in production!)
RUN useradd -m -s /bin/bash skav && \
    echo "skav:password" | chpasswd && \
    adduser skav sudo

# Set working directory
WORKDIR /home/skav

# Setup VNC password and xstartup script
RUN mkdir -p /home/skav/.vnc && \
    echo "password" | vncpasswd -f > /home/skav/.vnc/passwd && \
    chmod 600 /home/skav/.vnc/passwd && \
    chown -R skav:skav /home/skav/.vnc

COPY xstartup /home/skav/.vnc/xstartup
RUN sed -i 's/\r$//' /home/skav/.vnc/xstartup && \
    chmod +x /home/skav/.vnc/xstartup && \
    chown skav:skav /home/skav/.vnc/xstartup

# Configure Supervisor to run VNC and Websockify
RUN mkdir -p /var/log/supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Configure Chrome Wrapper
COPY chrome-wrapper /usr/local/bin/google-chrome-stable
RUN sed -i 's/\r$//' /usr/local/bin/google-chrome-stable && \
    chmod +x /usr/local/bin/google-chrome-stable && \
    ln -sf /usr/local/bin/google-chrome-stable /usr/bin/google-chrome && \
    ln -sf /usr/local/bin/google-chrome-stable /usr/bin/chrome && \
    ln -sf /usr/local/bin/google-chrome-stable /usr/bin/google-chrome-stable

# Expose ports: 6080 for web access (noVNC), 5901 for VNC direct
EXPOSE 6080 5901

# Switch to user skav for safety (optional, but supervisor usually runs as root and spawns user processes)
# For simplicity with Supervisor, we'll keep root entrypoint but run services as skav
USER root

# Clean up any previous session locks
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
