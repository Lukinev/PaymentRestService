openssl genrsa -out server.key 4096
openssl req -new -key server.key -out server.csr -subj '/C=UA/ST=Ukraine/L=Odessa/O=CITYPAY/CN=citypay.org.ua'
openssl x509 -req -in server.csr -out server.crt -CA ca.crt -CAkey ca.key -CAcreateserial -days 365
openssl x509 -in server.crt -text -noout