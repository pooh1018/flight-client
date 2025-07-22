#!/bin/bash

# 部署脚本
set -e

echo "==== 开始自动部署 ===="
cd ~/app/flight-client

# 拉取最新代码
echo "---- 拉取最新代码 ----"
git pull origin dev-v0.0.1

# npm install
#echo "---- npm install ----"
#npm install

# 编译项目
#echo "---- 编译项目 ----"
#npm run build:prod

# 构建Docker镜像
echo "---- 构建Docker镜像 ----"
docker build -t flight-client:latest .

# 停止并删除旧容器
echo "---- 停止并删除旧容器 ----"
docker-compose down frontend

# 启动新容器
echo "---- 启动新容器 ----"
docker-compose up frontend -d

echo "==== 部署完成 ===="
