# Deployment Guide

This guide recreates the completed Project 26 deployment.

## 1. Network plan

| Tier | Subnet | VM private IP | Public access |
|---|---|---:|---|
| Frontend | `10.26.1.0/24` | `10.26.1.5` | HTTP and SSH as required |
| Backend | `10.26.2.0/24` | `10.26.2.5` | Private in final state |
| Database | `10.26.3.0/24` | `10.26.3.4` | Private |

VNet: `10.26.0.0/16`

## 2. Database VM

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
sudo systemctl enable --now postgresql
```

Create a database user with a strong password. Do not copy a real password into Git.

```bash
sudo -u postgres psql
```

```sql
CREATE USER nexora_user WITH PASSWORD '<STRONG_PASSWORD>';
CREATE DATABASE nexora_db OWNER nexora_user;
\q
```

Load the schema and sample data:

```bash
sudo -u postgres psql -d nexora_db -f schema.sql
sudo -u postgres psql -d nexora_db -f sample-data.sql
sudo -u postgres psql -d nexora_db -f permissions.sql
```

Allow PostgreSQL to listen on the private network:

```bash
sudo sed -i "s/^#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf
```

Add this line to `/etc/postgresql/<version>/main/pg_hba.conf`:

```text
host nexora_db nexora_user 10.26.2.0/24 scram-sha-256
```

Restart and verify:

```bash
sudo systemctl restart postgresql
sudo ss -tulnp | grep 5432
```

## 3. Backend VM

```bash
sudo apt update
sudo apt install nodejs npm -y
mkdir -p ~/nexora-backend
```

Copy the contents of `backend/` into `~/nexora-backend`, then:

```bash
cd ~/nexora-backend
cp .env.example .env
nano .env
npm install
npm run check
```

Test directly:

```bash
npm start
```

In another shell:

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/db-test
curl http://localhost:5000/api/products
```

Run with PM2:

```bash
sudo npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Run the command printed by `pm2 startup`, then run `pm2 save` again.

## 4. Frontend VM

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl enable --now nginx
```

Copy the frontend files:

```bash
sudo cp frontend/index.html frontend/styles.css frontend/script.js /var/www/html/
```

Copy the Nginx configuration:

```bash
sudo cp nginx/nexora.conf /etc/nginx/sites-available/nexora
sudo ln -sf /etc/nginx/sites-available/nexora /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## 5. Verify through Nginx

From the frontend VM:

```bash
curl http://localhost/api/health
curl http://localhost/api/db-test
curl http://localhost/api/products
```

From another machine:

```bash
./scripts/verify-deployment.sh http://<FRONTEND_PUBLIC_IP>
```

## 6. Final security state

- Frontend VM: public IP enabled.
- Backend VM: remove any temporary public IP.
- Database VM: no public IP.
- PostgreSQL port `5432`: allow only from the backend subnet.
- Backend port `5000`: allow only from the frontend subnet.
- Never commit `.env`, SSH private keys, or cloud credentials.
