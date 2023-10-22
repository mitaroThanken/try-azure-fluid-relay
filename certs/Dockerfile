FROM golang:latest AS certs

# Virtual host's name
ARG VHOST_NAME=test

# Install minica
RUN go install github.com/jsha/minica@v1.0.2

# Make certs
RUN mkdir -p /certs \
    && cd /certs \
    && minica --domains ${VHOST_NAME:-test}.test \
    && openssl x509 -inform PEM -in minica.pem -out minica.crt \
    && cd ${VHOST_NAME:-test}.test \
    && cat cert.pem key.pem > ${VHOST_NAME:-test}.test.pem \
    && cd .. \
    && chmod go-rwx -R .
