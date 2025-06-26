# 构建阶段
FROM node:18 AS builder

# 设置工作目录
WORKDIR /client-app

# 定义构建参数
# ARG VITE_API_BASE_URL

# 设置环境变量
# ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build:dev

# 生产阶段
FROM nginx:alpine

# 从构建阶段复制构建产物
COPY --from=builder /client-app/dist /usr/share/nginx/html

# 复制Nginx配置模板
# COPY nginx.conf /etc/nginx/templates/default.conf.template

# 设置默认环境变量
# ENV VITE_API_BASE_URL=http://13.239.30.88:8001/

# 暴露80端口
EXPOSE 80

# 使用Nginx的默认CMD
CMD ["nginx", "-g", "daemon off;"]
