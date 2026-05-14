# Natolli Studio

Site Django simples para catálogo, pedidos e contato da Natolli Studio.

## Rodar localmente

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Abra `http://127.0.0.1:8000/`.

## Contatos para trocar

- WhatsApp: `loja/views.py`, constante `WHATSAPP_NUMBER`
- Instagram e cidade: `templates/loja/home.html`, seção `contato`
- Produtos e cores: `loja/views.py`, listas `PRODUCTS` e `COLORS`

## Pagamento recomendado

Para começar, o caminho mais simples é confirmar pedidos pelo WhatsApp e receber por Pix manual. Isso evita custo e complexidade antes de validar preços, prazos e demanda.

Quando a loja tiver volume, integre Mercado Pago Checkout Pro. Ele redireciona o cliente para o ambiente do Mercado Pago e permite cartão, Pix, boleto e carteira Mercado Pago, mantendo menos responsabilidade técnica no site do que um checkout transparente.

Para uma futura integração Django:

1. Criar um model `Order`.
2. Criar preferência de pagamento no backend com o SDK do Mercado Pago.
3. Redirecionar o cliente para `init_point`.
4. Receber notificações/webhooks para atualizar o status do pedido.
5. Guardar o `payment_id` e o status retornado.
