# Golden Raspberry API

## Como rodar com Docker

1. Clone o repositório.
1. Certifique-se de que o Docker está instalado na máquina.
2. Execute o comando utilizando o bash na pasta raiz do projeto `docker-compose up` ou `docker build . && docker run -p 3000:3000`.
3. Acesse a API em `http://localhost:3000/movies/prizes`.

## Rodando os testes de integração com Docker
1. Certifique-se de que o Docker está rodando e que o container se chama: golden_raspberry_api
2. Execute o comando no bash:
   ```bash
   docker exec -it golden_raspberry_api npm run test:e2e

### Sem Docker (Rodando diretamente na sua máquina)

1. Clone o repositório.
2. Certifique-se de que você tem o [Node.js](https://nodejs.org) na v22.13.1 e o [npm](https://www.npmjs.com/) instalados.
3. Instale as dependências digitando o comando na pasta raiz do projeto:
   ```bash
   npm install
4. Execute o npm para subir a aplicação localmente:
   ```bash
   npm run start:dev
5. Acesse a API em `http://localhost:3000/movies/prizes`.

## Rodando os testes de integração

1. Execute o comando utilizando o bash na pasta raiz do projeto:
   ```bash
   npm run test:e2e

## Para trocar os dados do banco

1. Abra a pasta data e localize o arquivo Movielist.csv
2. Substitua os dados mantendo a estrutura dos campos e cabeçalho ou substitua o arquivo inteiro mantendo o mesmo nome de arquivo, estrutura de campos e cabeçalho.
3. Caso esteja utilizando o Docker é necessário usar o comando `docker-compose down`, depois novamente o comando `docker-compose up`, se não utilizar o docker-compose e subir diretamente os containers, é necessário baixalos e subir novamente para que o arquivo modificado seja copiado para dentro do container. Vide Dockerfile.



