FROM owasp/modsecurity-crs:nginx

# Remove default config
RUN rm -f /etc/nginx/conf.d/default.conf

# Ensure cert directory exists and is writable
USER root
RUN mkdir -p /etc/nginx/conf && \
    chown nginx:nginx /etc/nginx/conf && \
    chmod 755 /etc/nginx/conf
USER nginx

CMD ["nginx", "-g", "daemon off;"]
