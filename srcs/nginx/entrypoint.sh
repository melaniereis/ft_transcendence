#!/bin/sh
# Substitui ${DOMAIN} no template e inicia o nginx

echo "Substituindo DOMAIN no template..."
envsubst '${DOMAIN}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

echo "Iniciando Nginx..."
exec nginx -g 'daemon off;'
