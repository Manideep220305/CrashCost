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
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Rename your 'copy' files to match the main.py script
RUN mv "best copy.pt" "best.pt" || true
RUN mv "insurevision_pricing_v1 copy.cbm" "insurevision_pricing_v1.cbm" || true

# Hugging Face Spaces port
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]