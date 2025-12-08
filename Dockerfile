# ----------------------------------------------------------------------
# 2. SYSTEM PREREQUISITES & UTILITIES
# Combine all apt-get install commands into a single RUN layer for efficiency.
# ----------------------------------------------------------------------
FROM node:20-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        git \
        build-essential \
        xdg-utils \
        firefox-esr \
    && \
    rm -rf /var/lib/apt/lists/*
# ----------------------------------------------------------------------
# 3. INSTALL CLI TOOLS
# This section remains separate as it uses a different tool (npm).
# ----------------------------------------------------------------------
RUN echo "Installing Claude Code and Raindrop CLI..." && \
    npm install -g @anthropic-ai/claude-code \
    @liquidmetal-ai/raindrop

# ----------------------------------------------------------------------
# 4. CONTAINER SETUP
# ----------------------------------------------------------------------
WORKDIR /app

# Expose common development ports
EXPOSE 3000 3001 4000 5000 5173 8000 8080 9000

CMD ["bash"]