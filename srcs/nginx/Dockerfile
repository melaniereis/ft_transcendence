FROM owasp/modsecurity-crs:nginx

# Copy your CRS setup and rules into the container
COPY ./nginx/modsec/modsecurity.conf /etc/modsecurity.d/modsecurity.conf
COPY ./nginx/modsec/setup.conf /etc/modsecurity.d/setup.conf
COPY ./nginx/modsec/owasp-crs /etc/modsecurity.d/owasp-crs/
COPY ./nginx/modsec/custom_rules.conf /etc/modsecurity.d/custom_rules.conf
