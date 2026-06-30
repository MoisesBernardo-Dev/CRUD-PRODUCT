FROM php:8.2-fpm-alpine

# Instala extensões necessárias para o Laravel e MySQL
RUN docker-php-ext-install pdo pdo_mysql

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
EXPOSE 8000

# Comando para iniciar o servidor embutido do Laravel
CMD php artisan serve --host=0.0.0.0 --port=8000
