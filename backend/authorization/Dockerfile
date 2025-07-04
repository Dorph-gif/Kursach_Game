FROM python:3.11-slim-buster

WORKDIR /app

COPY backend/authorization/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "backend.authorization.main:app", "--host", "0.0.0.0", "--port", "8000"]