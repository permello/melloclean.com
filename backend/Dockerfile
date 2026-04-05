FROM python:3.12-slim

WORKDIR /app/backend

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY company.json /app/company.json

CMD ["sh", "-c", "alembic upgrade head && flask run --host=0.0.0.0 --port=5000"]
