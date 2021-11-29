FROM nginx

ENV NODE_ENV=production

WORKDIR /www
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist .
