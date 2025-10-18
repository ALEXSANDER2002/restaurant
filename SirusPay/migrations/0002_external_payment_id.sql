-- Adiciona coluna para vincular pagamento no Mercado Pago
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS external_payment_id varchar(100); 