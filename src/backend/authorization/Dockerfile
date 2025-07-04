FROM python:3.11-slim-buster

WORKDIR /app

COPY src/backend/authorization/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "src.backend.authorization.main:app", "--host", "0.0.0.0", "--port", "8000"]