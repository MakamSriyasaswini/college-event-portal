
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY index.html .
COPY styles.css .
COPY script.js .

EXPOSE 80
