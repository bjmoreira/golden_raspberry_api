# Golden Raspberry API

## Como rodar com Docker

1. Clone o repositório.
1. Certifique-se de que o Docker está instalado na máquina.
2. Rode `docker-compose up` ou `docker build . && docker run -p 3000:3000`.
3. Acesse a API em `http://localhost:3000/movies/prizes`.

## Rodando os testes de integração com Docker
1. Certifique-se de que o Docker está rodando e que o container se chama:'golden_raspberry_api'.
2. Use o comando:
   ```bash
   docker exec -it golden_raspberry_api npm run test:e2e

### Sem Docker (Rodando diretamente na sua máquina)

1. Clone o repositório.
2. Certifique-se de que você tem o [Node.js](https://nodejs.org) na v22.13.1 e o [npm](https://www.npmjs.com/) instalados.
3. Instale as dependências do projeto:
   ```bash
   npm install
4. Execute o npm para subir a aplicação localmente:
   ```bash
   npm run start:dev
5. Acesse a API em `http://localhost:3000/movies/prizes`.

## Rodando os testes de integração

1. Execute o comando:
   ```bash
   npm run test:e2e

