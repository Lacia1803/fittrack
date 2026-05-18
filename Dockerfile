# Base image
FROM node:18-alpine

WORKDIR /app

# Cài đặt thư viện hệ thống cần thiết
RUN apk add --no-cache libc6-compat

# Copy package configuration
COPY package*.json ./

# Cài đặt clean dependencies
RUN npm ci

# Copy toàn bộ mã nguồn dự án
COPY . .

# Tắt telemetry của Next.js để tăng tốc độ và bảo mật
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Build ứng dụng Next.js sang bản production tối ưu hóa
RUN npm run build

# Mở cổng 3000
EXPOSE 3000

# Chạy Next.js production server
CMD ["npm", "start"]
