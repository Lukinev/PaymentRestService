openssl genrsa -des3 -out ca.key 4096
openssl req -new -x509 -days 1000 -key ca.key -out ca.crt -subj '/CN=citypay.org.ua/L=Odessa/C=UA'
openssl x509 -in ca.crt -text -noout

