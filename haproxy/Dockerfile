# HAProxy version
ARG HAPROXY_VERSION=2.8

FROM haproxy-with-minica/certs:latest as certs

FROM haproxy:${HAPROXY_VERSION} AS haproxy

# Virtual host's FQDN
ARG VHOST_FQDN=test.test

# be root
USER root

# Copy certs
COPY --from=certs /certs /usr/local/etc/haproxy/certs

# Copy config
COPY haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg

# replace to Virtual host's FQDN
RUN sed -i -e s/test.test/${VHOST_FQDN}/g /usr/local/etc/haproxy/haproxy.cfg

# chown
RUN chown -R haproxy:haproxy /usr/local/etc/haproxy

# be haproxy
USER haproxy
