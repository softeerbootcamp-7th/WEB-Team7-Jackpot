#!/bin/bash

set -e

# Configuration
BLUE_PORT=8080
GREEN_PORT=8081
DOCKER_IMAGE="${DOCKER_IMAGE_NAME:-}" # Docker Hub 이미지 이름
BASE_CONTAINER_NAME="narratix-app"

echo "Starting deployment..."

if [ -z "${DOCKER_IMAGE}" ]; then
    echo "ERROR: DOCKER_IMAGE_NAME environment variable is not set."
    exit 1
fi

# 1. 현재 실행 중인 포트 확인 (lsof는 포트 확인용) (Blue가 실행 중이면 Target은 Green)
if sudo lsof -i :$BLUE_PORT > /dev/null; then
    echo "Current active port is $BLUE_PORT (BLUE). Deploying to $GREEN_PORT (GREEN)..."
    TARGET_PORT=$GREEN_PORT
    TARGET_COLOR="green"
    IDLE_PORT=$BLUE_PORT
    IDLE_COLOR="blue"
else
    echo "Current active port is NOT $BLUE_PORT. Deploying to $BLUE_PORT (BLUE)..."
    TARGET_PORT=$BLUE_PORT
    TARGET_COLOR="blue"
    IDLE_PORT=$GREEN_PORT
    IDLE_COLOR="green"
fi

TARGET_CONTAINER_NAME="${BASE_CONTAINER_NAME}-${TARGET_COLOR}"
IDLE_CONTAINER_NAME="${BASE_CONTAINER_NAME}-${IDLE_COLOR}"

# 2. 최신 이미지 Pull
echo "Pulling Docker image: ${DOCKER_IMAGE}..."
sudo docker pull "${DOCKER_IMAGE}"

# 3. 새로운 컨테이너 실행
echo "Starting new container: ${TARGET_CONTAINER_NAME} on port ${TARGET_PORT}..."

# 기존에 혹시 남아있을 수 있는 타겟 컨테이너 제거
sudo docker stop "${TARGET_CONTAINER_NAME}" 2>/dev/null || true
sudo docker rm "${TARGET_CONTAINER_NAME}" 2>/dev/null || true

sudo docker run -d \
    --name "${TARGET_CONTAINER_NAME}" \
    --restart always \
    -p "${TARGET_PORT}:8080" \
    -e SPRING_PROFILES_ACTIVE=prod \
    "${DOCKER_IMAGE}"

# 4. Health Check
echo "Waiting for health check on http://localhost:${TARGET_PORT}/api/v1/health ..."
RETRY_COUNT=0
MAX_RETRIES=15 # 5초 * 15 = 75초
SLEEP_TIME=5
HEALTH_SUCCESS=false

while [ ${RETRY_COUNT} -lt ${MAX_RETRIES} ]; do
    if curl -sf "http://localhost:${TARGET_PORT}/api/v1/health" > /dev/null 2>&1; then
        echo "Health check passed!"
        HEALTH_SUCCESS=true
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Waiting... (${RETRY_COUNT}/${MAX_RETRIES})"
    sleep $SLEEP_TIME
done

if [ "${HEALTH_SUCCESS}" != true ]; then
    echo "=========================================="
    echo "❌ ERROR: Health check failed after ${MAX_RETRIES} attempts"
    echo "=========================================="
    echo ""
    echo "📋 Container logs (last 100 lines):"
    echo "------------------------------------------"
    sudo docker logs --tail 100 "${TARGET_CONTAINER_NAME}" 2>&1
    echo "------------------------------------------"
    echo ""
    echo "🧹 Cleaning up failed container..."
    sudo docker stop "${TARGET_CONTAINER_NAME}" || true
    sudo docker rm "${TARGET_CONTAINER_NAME}" || true
    echo ""
    echo "Cleaning up unused images..."
    sudo docker image prune -f
    echo "========== Deployment FAILED =========="
    exit 1
fi

CONF_FILE="/etc/nginx/conf.d/site-url.inc"

# 5. Nginx 스위칭 (site-url.inc 수정)
echo "Switching Nginx traffic to ${TARGET_PORT}..."
echo "set \$service_url http://127.0.0.1:${TARGET_PORT};" | sudo tee ${CONF_FILE}

# Nginx 설정 테스트 및 Reload
if sudo nginx -t; then
    sudo nginx -s reload
    echo "Nginx reloaded."
else
    echo "Nginx config test failed! Rolling back..."
    echo "set \$service_url http://127.0.0.1:${IDLE_PORT};" | sudo tee ${CONF_FILE}
    exit 1
fi

# 6. 이전 컨테이너 정리하여 메모리 확보
echo "Stopping previous container: ${IDLE_CONTAINER_NAME}..."
sudo docker stop "${IDLE_CONTAINER_NAME}" 2>/dev/null || true
sudo docker rm "${IDLE_CONTAINER_NAME}" 2>/dev/null || true

# 미사용 이미지 정리
sudo docker image prune -f

echo "🎉 Deployment successful!"
echo "New container '${TARGET_CONTAINER_NAME}' is now serving traffic on port ${TARGET_PORT}."

echo "Running containers:"
sudo docker ps