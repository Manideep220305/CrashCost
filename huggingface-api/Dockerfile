FROM python:3.11-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1

# Install modern system dependencies for OpenCV (Debian Trixie Compatible)
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libgl1 \
    libglx-mesa0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# CRITICAL BUILD SPEEDUP: Install CPU-only PyTorch (skips 2.5GB CUDA download)
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install the rest of the dependencies
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Hugging Face Spaces port
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]