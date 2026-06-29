# Estágio 1: Compilação do código React
FROM node:20-alpine AS build

WORKDIR /app

# Copia os ficheiros de dependências
COPY package*.json ./

# Instala as dependências do Node
RUN npm install

# Copia o restante código do projeto
COPY . .

# Compila o projeto gerando a pasta 'dist'
RUN npm run build

# Estágio 2: Servidor Web Nginx para servir os ficheiros estáticos
FROM nginx:alpine

# Copia os ficheiros compilados do estágio anterior para a pasta pública do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expõe a porta padrão do Nginx/Vite configurada no Docker Compose
EXPOSE 5173

# Ajusta a configuração do Nginx para escutar na porta 5173 (em vez da 80 padrão)
RUN sed -i 's/listen       80;/listen       5173;/g' /etc/nginx/conf.d/default.conf

# Faz o Nginx redirecionar todas as rotas para o index.html (evita erro 404 em SPA)
RUN sed -i '/location \/ {/a \        try_files $uri $uri/ /index.html;' /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
