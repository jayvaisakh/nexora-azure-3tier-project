# Frontend

Static HTML, CSS, and JavaScript served by Nginx on the public frontend VM.

The page calls `/api/products`. Nginx proxies this path to the private backend VM.

Deploy:

```bash
sudo cp index.html styles.css script.js /var/www/html/
sudo nginx -t
sudo systemctl restart nginx
```
