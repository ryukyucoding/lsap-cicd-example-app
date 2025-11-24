# 使用官方 Node.js LTS 映像
FROM node:24-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package 檔案
COPY package*.json ./

# 安裝生產環境依賴
RUN npm install --production

# 複製所有應用程式檔案
COPY . .

# 暴露應用程式端口
EXPOSE 3000

# 啟動應用程式
CMD ["npm", "start"]