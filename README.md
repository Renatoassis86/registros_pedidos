# Módulo de Pedidos e Registros - Cidade Viva Education

Sistema independente para gestão de materiais, pedidos e relacionamento operacional com escolas parceiras.

## 🚀 Tecnologias
- **Next.js 14+** (App Router)
- **Supabase** (Banco de Dados, Auth, Storage)
- **Vanilla CSS** (Design System Premium & Customizado)

## 📁 Estrutura do Projeto
- `src/app/admin`: Módulo de gestão interna (Escolas, Preços, Pedidos, Ocorrências).
- `src/app/portal`: Módulo exclusivo da Escola (Novo Pedido, Suporte, Histórico).
- `src/lib/supabase.ts`: Configuração do cliente de banco de dados.
- `src/app/globals.css`: Design System (Cores: #F58220 e #003366).

## 🛠️ Como Iniciar Localmente
1. Entre na pasta: `cd pedidos_registros`
2. Instale as dependências: `npm install`
3. Rode em desenvolvimento: `npm run dev`

## 📦 Como Subir para o Novo Repositório
No terminal, execute:
```bash
cd pedidos_registros
git init
git remote add origin https://github.com/Renatoassis86/pedidos_registros.git
git add .
git commit -m "Initial commit: Módulo de Pedidos e Registros"
git branch -M main
git push -u origin main
```

## ✨ Funcionalidades Implementadas
### Administrativo
- [x] **Vitrine de Produtos**: Configuração de Kits e Preços.
- [x] **Gestão de Escolas**: Cadastro de parceiros.
- [x] **Central de Ocorrências**: Resposta a chamados em estilo Chat.

### Portal da Escola
- [x] **Novo Pedido**: Fluxo intuitivo com escolha de Kits/Reposições e cálculo automático.
- [x] **Histórico**: Acompanhamento de status dos pedidos.
- [x] **Suporte**: Abertura de ocorrências com anexo e comunicação direta.
