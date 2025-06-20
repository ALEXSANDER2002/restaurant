-- Inicialização do banco de dados para Restaurant UNIFESSPA
-- Este script é executado automaticamente quando o container PostgreSQL é criado

-- Criar database se não existir
SELECT 'CREATE DATABASE restaurant'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'restaurant')\gexec

-- Conectar ao database restaurant
\c restaurant;

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Criar schema padrão se não existir
CREATE SCHEMA IF NOT EXISTS public;

-- Garantir permissões
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Criar usuário para a aplicação (opcional, para maior segurança)
-- DO $$
-- BEGIN
--     IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'restaurant_user') THEN
--         CREATE USER restaurant_user WITH PASSWORD 'restaurant_password';
--         GRANT CONNECT ON DATABASE restaurant TO restaurant_user;
--         GRANT USAGE ON SCHEMA public TO restaurant_user;
--         GRANT CREATE ON SCHEMA public TO restaurant_user;
--         ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO restaurant_user;
--         ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO restaurant_user;
--     END IF;
-- END
-- $$;

-- Log de inicialização
SELECT 'Database restaurant initialized successfully' as status; 