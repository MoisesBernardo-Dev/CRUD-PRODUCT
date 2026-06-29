FROM php:8.2-fpm-alpine

# Instala as dependências do sistema e as extensões PHP para PostgreSQL e MySQL
RUN apk add --no-repeat postgresql-dev \
    && docker-php-ext-install pdo pdo_pgsql pdo_mysql

# Instala o Composer internamente
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Define o diretório de trabalho dentro do container
WORKDIR /var/www

# Copia os ficheiros do projeto para o container
COPY . .

# Instala as dependências do Composer
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Define as permissões corretas para as pastas do Laravel
RUN chmod -R 777 storage bootstrap/cache

# Expõe a porta padrão do serviço
EXPOSE 8001

# Comando para iniciar o servidor embutido do Laravel
CMD php artisan serve --host=0.0.0.0 --port=8001
