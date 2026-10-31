# 🚀 Guia Completo de Deploy na Oracle Cloud (Always Free)

Este guia ensina como hospedar a aplicação **KIEZA** (Frontend React + Backend Express + MySQL + Uploads) na **Oracle Cloud Infrastructure (OCI)** de forma 100% gratuita no tier *Always Free*.

---

## 1. Por que a Oracle Cloud é excelente para este projeto?

- **Recursos Always Free generosos**: Até 4 OCPUs, 24 GB de memória RAM e 200 GB de disco SSD gratuito para sempre.
- **Armazenamento persistente para uploads**: Ao contrário de serviços como Render ou Vercel (onde arquivos enviados via upload são apagados quando o servidor reinicia), na Oracle Cloud seus uploads ficam seguros no disco permanente da VM.
- **Banco MySQL completo**: Você instala e gerencia o MySQL diretamente na máquina sem custos adicionais.

---

## 2. Passo 1: Criar a Instância na Oracle Cloud

1. Acesse o console da **Oracle Cloud** e vá em: **Compute > Instances > Create Instance**.
2. **Nome**: Escolha um nome (ex: `kieza-server`).
3. **Imagem e Formato (Image & Shape)**:
   - **Imagem**: Ubuntu 22.04 LTS ou Ubuntu 24.04.
   - **Shape**:
     - *Opção recomendada*: **Ampere (ARM)** - 2 a 4 OCPUs e 12 a 24 GB de RAM (Always Free).
     - *Opção alternativa*: **AMD VM.Standard.E2.1.Micro** (1 OCPU, 1 GB RAM - Always Free).
4. **Networking**: Selecione criar uma nova VCN e marque **Assign a public IPv4 address**.
5. **Add SSH Keys**: Baixe sua chave privada (`.key`) para conectar via terminal/PuTTY.
6. Clique em **Create**.

---

## 3. Passo 2: Liberar Portas no Firewall da Oracle (Security List)

Por padrão, a Oracle bloqueia conexões externas. É necessário liberar as portas HTTP e HTTPS:

1. No console da Oracle, vá na página da sua VM e clique na sua **Subnet** vinculada.
2. Clique na **Default Security List**.
3. Clique em **Add Ingress Rules**:
   - **Source CIDR**: `0.0.0.0/0`
   - **IP Protocol**: TCP
   - **Destination Port Range**: `80,443`
   - **Description**: Web HTTP e HTTPS
4. Clique em **Add Ingress Rules**.

---

## 4. Passo 3: Conectar via SSH e Configurar o Servidor

No seu terminal ou PowerShell:
```bash
ssh -i /caminho/para/sua-chave.key ubuntu@SEU_IP_PUBLICO
```

### 4.1. Atualizar o sistema e abrir o firewall interno do Ubuntu:
```bash
sudo apt update && sudo apt upgrade -y
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

### 4.2. Instalar Node.js 20, Git e PM2:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
sudo npm install -g pm2
```

### 4.3. Instalar e Configurar o MySQL:
```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

Entre no MySQL para criar o banco e o usuário da aplicação:
```bash
sudo mysql
```
Execute os comandos SQL dentro do console do MySQL:
```sql
CREATE DATABASE kieza_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kieza_user'@'localhost' IDENTIFIED BY 'SuaSenhaForteAqui123!';
GRANT ALL PRIVILEGES ON kieza_db.* TO 'kieza_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 5. Passo 4: Clonar o Projeto e Importar o Banco de Dados

1. No servidor, clone seu repositório:
   ```bash
   cd ~
   git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git app
   cd app
   ```

2. Importe o banco de dados `kieza_db.sql`:
   ```bash
   mysql -u kieza_user -p kieza_db < kieza_db.sql
   ```
   *(Digite a senha `SuaSenhaForteAqui123!` quando solicitada)*.

3. Instale as dependências e compile o frontend React:
   ```bash
   npm install
   npm run build
   ```

4. Crie o arquivo `.env` de produção:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Preencha com os dados configurados:
   ```env
   PORT=5000
   JWT_SECRET=coloque_uma_chave_super_longa_e_aleatoria_aqui
   DB_HOST=localhost
   DB_USER=kieza_user
   DB_PASSWORD=SuaSenhaForteAqui123!
   DB_NAME=kieza_db
   DB_PORT=3306
   REACT_APP_API_URL=
   ```
   *(Pressione `Ctrl + O` e `Enter` para salvar, e `Ctrl + X` para sair)*.

---

## 6. Passo 5: Iniciar a Aplicação com PM2

Inicie o servidor Node.js com o gerenciador de processos PM2 (ele mantém a aplicação rodando 24/7 e reinicia sozinho se a máquina reiniciar):

```bash
pm2 start src/backend/server.js --name "kieza-app"
pm2 save
pm2 startup
```
*(Copie e execute o comando sugerido pelo `pm2 startup` se solicitado)*.

---

## 7. Passo 6: Configurar o Nginx e Certificado SSL Gratuito (HTTPS)

1. Instale o Nginx:
   ```bash
   sudo apt install -y nginx
   ```

2. Crie a configuração do seu site no Nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/kieza
   ```

   Cole o seguinte conteúdo (substitua `seu-dominio.com` ou use o seu IP):
   ```nginx
   server {
       listen 80;
       server_name seu-dominio.com www.seu-dominio.com; # ou coloque o IP da Oracle

       # Limite de tamanho de upload para vídeos e imagens
       client_max_body_size 50M;

       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. Ative o site e reinicie o Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/kieza /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Instalar Certificado SSL Gratuito (Let's Encrypt / HTTPS)**:
   Se você tiver um domínio apontado para o IP da Oracle:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
   ```

Pronto! Sua aplicação estará no ar com HTTPS ativo, banco de dados MySQL integrado e alta performance!

