FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir "letta>=0.1.0"

ENV PORT=8283
ENV HOST=0.0.0.0
ENV LETTA_ENVIRONMENT=production

EXPOSE 8283

CMD ["sh", "-c", "letta server --host 0.0.0.0 --port ${PORT:-8283}"]
