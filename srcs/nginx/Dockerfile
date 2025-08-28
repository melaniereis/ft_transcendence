FROM owasp/modsecurity-crs:nginx

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy your custom nginx config
COPY ./nginx/conf.d/custom.conf /etc/nginx/conf.d/custom.conf

CMD ["nginx", "-g", "daemon off;"]