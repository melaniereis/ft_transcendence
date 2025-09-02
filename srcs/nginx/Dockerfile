FROM owasp/modsecurity-crs:nginx

USER root

# Remove default Nginx config para evitar conflitos
RUN rm -f /etc/nginx/conf.d/default.conf

# Cria diretórios necessários com permissões corretas
RUN mkdir -p /etc/nginx/conf \
    && mkdir -p /etc/modsecurity.d \
    && mkdir -p /etc/nginx/certs \
    && mkdir -p /etc/nginx/includes \
    && mkdir -p /etc/nginx/modsecurity.d \
    && chown -R nginx:nginx /etc/nginx/conf /etc/modsecurity.d /etc/nginx/certs /etc/nginx/includes /etc/nginx/modsecurity.d \
    && chmod -R 755 /etc/nginx/conf /etc/modsecurity.d /etc/nginx/certs /etc/nginx/includes /etc/nginx/modsecurity.d

# Instala o envsubst (faz parte do gettext)
RUN apt-get update && apt-get install -y gettext && apt-get clean

# Copia configs do ModSecurity e includes
COPY ./modsec/ /etc/nginx/modsecurity.d/
COPY ./includes/proxy_backend.conf /etc/nginx/includes/proxy_backend.conf

# Copia os certificados SSL
COPY ssl/fullchain.pem /etc/nginx/certs/fullchain.pem
COPY ssl/privkey.pem /etc/nginx/certs/privkey.pem

# Copia o arquivo de configuração como template
COPY templates/default.conf.template /etc/nginx/templates/default.conf.template

# Copia o entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nginx

ENTRYPOINT ["/entrypoint.sh"]
