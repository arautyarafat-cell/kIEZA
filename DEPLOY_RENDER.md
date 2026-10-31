# 🚀 Guia Completo de Deploy no Render (render.com)

Este guia ensina o passo a passo completo para hospedar a aplicação **KIEZA** (Frontend React + Backend Express + MySQL) no **Render**.

---

## 1. Como a arquitetura funciona no Render?

- **Aplicação Completa (Frontend + Backend)**: O Render executa o comando `npm run build` para compilar o React e inicia com `npm start` (`node src/backend/server.js`). O backend Express entrega a API e serve as telas do React com alta performance.
- **Banco de Dados MySQL**: O Render oferece banco PostgreSQL gratuito, mas **não** possui MySQL nativo gratuito. Por isso, usamos um banco MySQL gratuito na nuvem (veja o Passo 1 abaixo).

---

## 2. Passo 1: Criar o Banco de Dados MySQL Gratuito na Nuvem

Escolha uma das opções gratuitas abaixo para hospedar seu MySQL:

### Opção A: TiDB Cloud (Recomendada - 100% Gratuito e Rápido)
1. Acesse [tidbcloud.com](https://tidbcloud.com) e crie uma conta gratuita.
2. Crie um cluster **Serverless** (grátis para sempre, até 5 GB).
3. Clique em **Connect** e obtenha os dados de conexão:
   - **Host**: ex: `gateway01.eu-central-1.prod.aws.tidbcloud.com`
   - **Port**: `4000`
   - **User**: seu usuário
   - **Password**: sua senha
   - **Database**: `kieza_db`
   - **SSL**: `true`
4. Na aba **SQL Editor** do TiDB Cloud, abra o arquivo `kieza_db.sql` do projeto, copie o conteúdo e execute para criar todas as tabelas.

### Opção B: Clever Cloud (com phpMyAdmin web incluído)
1. Acesse [clever-cloud.com](https://www.clever-cloud.com/) e crie uma conta.
2. Clique em **Create an Add-on > MySQL** (plano gratuito).
3. Abra o **phpMyAdmin** fornecido no painel e importe diretamente o arquivo `kieza_db.sql`.
4. Copie as credenciais (Host, User, Password, Database Name, Port).

---

## 3. Passo 2: Subir o Projeto para o GitHub

Se ainda não enviou seu código para o GitHub:

1. Crie um repositório no seu [GitHub](https://github.com/new) (privado ou público).
2. No terminal do seu computador (na pasta do projeto):
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git branch -M main
   git push -u origin main
   ```

---

## 4. Passo 3: Criar o Serviço no Render

Você pode escolher o método automático (Blueprint) ou o manual:

### Método A: Automático via Blueprint (Recomendado)
Já deixamos o arquivo `render.yaml` preparado na raiz do seu projeto!
1. Acesse o painel do [Render](https://dashboard.render.com).
2. Clique no botão **New +** no topo direito e selecione **Blueprint**.
3. Conecte sua conta do GitHub e selecione o repositório da KIEZA.
4. O Render detectará automaticamente o arquivo `render.yaml`.
5. Preencha apenas os valores das credenciais do seu banco de dados quando solicitado:
   - `DB_HOST`: Host do seu MySQL na nuvem
   - `DB_USER`: Usuário do MySQL
   - `DB_PASSWORD`: Senha do MySQL
   - `DB_NAME`: Nome do banco (ex: `kieza_db`)
   - `DB_PORT`: Porta (geralmente `3306` ou `4000`)
   - `DB_SSL`: `true` (se usar TiDB ou Aiven) ou `false`
6. Clique em **Apply**. O Render fará o build e colocará o site no ar!

---

### Método B: Manual (Web Service)
Se preferir criar manualmente:
1. No painel do Render, clique em **New + > Web Service**.
2. Selecione o repositório do GitHub.
3. Configure os seguintes campos:
   - **Name**: `kieza-app`
   - **Region**: Frankfurt (Europa) ou Ohio (EUA)
   - **Branch**: `main` (ou `master`)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. Na seção **Environment Variables**, adicione:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `JWT_SECRET` = (clique em generate ou digite uma chave segura)
   - `DB_HOST` = (host do seu banco)
   - `DB_USER` = (usuário do seu banco)
   - `DB_PASSWORD` = (senha do seu banco)
   - `DB_NAME` = (nome do seu banco)
   - `DB_PORT` = `3306` (ou `4000`)
   - `DB_SSL` = `true` (ou `false`)
5. Clique em **Deploy Web Service**.

---

## 5. Dicas Importantes sobre o Plano Gratuito do Render

### 1. Como evitar que o Render hiberne (Keep-Alive):
No plano gratuito, o Render coloca o serviço em modo de espera após 15 minutos sem visitas. Na próxima visita, ele demora cerca de 50 segundos para ligar.
- **Solução Gratuita**: Crie uma conta no [cron-job.org](https://cron-job.org) ou [uptimerobot.com](https://uptimerobot.com) e crie um monitoramento HTTP apontando para a sua URL do Render a cada 10 minutos. Isso mantém seu site acordado 24 horas por dia sem custo!

### 2. Uploads de arquivos no Render:
No plano gratuito do Render, o disco local é efêmero (arquivos novos enviados por upload são apagados quando o servidor reinicia).
- As fotos já existentes do projeto continuam sempre funcionando porque estão no repositório.
- Para uploads novos persistirem no Render a longo prazo, você pode adicionar um **Render Disk** (plano pago Starter) ou configurar um serviço de storage em nuvem (Cloudinary / Supabase Storage). Na Oracle Cloud (VPS), esse problema não existe porque o disco é permanente.
