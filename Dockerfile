# Build step #1: build the React front end
FROM node:20-alpine as build-step
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# Copy package files from frontend directory
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Copy frontend source code
COPY frontend/ ./
RUN npm run build

# Build step #2: build the Python backend
FROM python:3.9-slim
WORKDIR /app

# Copy backend requirements and install
COPY python_backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY python_backend/ ./

# Copy build artifacts from the build stage to the backend static folder
# Flask app is configured to serve from ../build, so we put it in /app/build
# and the python code is in /app (WORKDIR), so it becomes a sibling directory
COPY --from=build-step /app/build ./build

# Initialize emergency.txt directory
RUN mkdir -p src && touch src/emergency.txt

# Expose port
ENV PORT=5000
EXPOSE 5000

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:create_app()"]
