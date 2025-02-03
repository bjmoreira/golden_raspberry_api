FROM node:22

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências primeiro
COPY package*.json ./

# Instala as dependências e o Nodemon globalmente
RUN npm install && \
    npm install -g nodemon && \
    npm install @nestjs/common @nestjs/core @nestjs/platform-express rxjs @nestjs/typeorm typeorm sqlite3 csv-parser supertest jest @types/supertest @types/jest

# Copia o restante dos arquivos para o container
COPY . .

# Copia o arquivo de filmes para dentro do container
COPY data/Movielist.csv /app/data/Movielist.csv

# Expondo a porta usada pelo NestJS
EXPOSE 3000

# Comando para rodar o servidor em modo desenvolvimento
CMD ["npm", "run", "start:dev"]
