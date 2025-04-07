-- Criação da tabela de perfis (se ainda não existir)
CREATE TABLE IF NOT EXISTS public.perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('admin', 'estudante')),
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentário na tabela
COMMENT ON TABLE public.perfis IS 'Perfis de usuários do sistema do Restaurante Universitário';

-- Criação da tabela de tickets
CREATE TABLE IF NOT EXISTS public.tickets (
  id TEXT PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0 AND quantidade <= 10),
  valor_total DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado')),
  subsidiado BOOLEAN DEFAULT FALSE,
  utilizado BOOLEAN DEFAULT FALSE,
  data_utilizacao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentário na tabela
COMMENT ON TABLE public.tickets IS 'Tickets de almoço do Restaurante Universitário';

-- Criação de índices para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_tickets_usuario_id ON public.tickets(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tickets_data ON public.tickets(data);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at);

-- Criação da tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS public.configuracoes (
  id SERIAL PRIMARY KEY,
  chave TEXT UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descricao TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentário na tabela
COMMENT ON TABLE public.configuracoes IS 'Configurações do sistema do Restaurante Universitário';

-- Inserir configurações iniciais
INSERT INTO public.configuracoes (chave, valor, descricao)
VALUES 
  ('preco_subsidiado', '2.00', 'Preço do ticket subsidiado'),
  ('preco_nao_subsidiado', '13.00', 'Preço do ticket não subsidiado'),
  ('limite_tickets_diario', '5', 'Limite de tickets por usuário por dia'),
  ('horario_inicio_almoco', '11:00', 'Horário de início do almoço'),
  ('horario_fim_almoco', '14:00', 'Horário de fim do almoço')
ON CONFLICT (chave) DO UPDATE SET
  valor = EXCLUDED.valor,
  descricao = EXCLUDED.descricao,
  updated_at = NOW();

