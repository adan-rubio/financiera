# Etapa 1: Construir el frontend
FROM node:18 AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Etapa 2: Construir el backend
FROM python:3.9 AS backend-build
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --user -r requirements.txt
COPY backend/ .

# Etapa 3: Imagen final
FROM nginx:alpine
COPY --from=frontend-build /app/build /usr/share/nginx/html
COPY --from=backend-build /app/backend /app/backend
COPY --from=backend-build /root/.local /root/.local
RUN apk add --no-cache python3 && \
    ln -s /root/.local/bin/* /usr/local/bin/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY start.sh /start.sh
RUN chmod +x /start.sh
EXPOSE 80
CMD ["/start.sh"]