# Node.js'i temel alıyoruz
FROM node:22.14-alpine3.21

# Çalışma dizini oluşturuyoruz
WORKDIR /app

# package.json ve package-lock.json dosyalarını çalışma dizinine kopyalıyoruz
COPY package*.json ./ 

# Prisma şeması ve diğer gerekli dosyaları kopyalıyoruz
COPY prisma ./prisma

# Bağımlılıkları yüklüyoruz
RUN npm install

# Uygulama dosyalarını kopyalıyoruz
COPY . .

# Prisma client'ı oluşturuyoruz
RUN npx prisma generate

# Uygulama için gerekli portu açıyoruz
EXPOSE 5005

# Uygulama çalıştırma komutunu tanımlıyoruz
CMD ["npm", "start"]
