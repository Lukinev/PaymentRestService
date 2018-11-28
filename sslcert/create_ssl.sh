#openssl req -x509 -newkey rsa:2048 -keyout ca.key -nodes -out ca.crt -subj '/CN=citypay.org.ua/L=Odessa/C=UA'
#openssl rsa -in ca.key -out ca.key
#openssl genrsa -out server.key 4096
#openssl req -new -key server.key -out server.cs
CSR_FILE="csrfile.csr"
KEY_BITS=2048
CONF_DIR="conf"
CHAIN_CRT="ca_chain.crt"

function clean {
    find conf -not -name '*.cnf' -type f -delete
    rm -f $CSR_FILE $CHAIN_CRT
}

function prepare {
    clean
    echo 1000 > "root_serial"
    cp /dev/null "root_index.txt"
    echo 2000 > "im_serial"
    cp /dev/null "im_index.txt"
}

prepare

ROOT_URL="citypay.org.ua"
ROOT_ORG="CAP"
ROOT_CNF="openssl-csr.cnf"
ROOT_CRT="root.crt"
ROOT_KEY="root.key"
ROOT_EXP=5000
ROOT_SUB="/C=UA/ST=Odessa/L=Odessa/O=$ROOT_ORG/CN=$ROOT_URL"

# Generate root key
openssl genrsa -out $ROOT_KEY $KEY_BITS
# Generate root certificate
#openssl req -x509 -newkey rsa:2048 -keyout ca.key -nodes -out ca.crt -subj '/CN=citypay.org.ua/L=Odessa/C=UA'
openssl req -config $ROOT_CNF -new -x509 -sha256  -key $ROOT_KEY -out $ROOT_CRT -days $ROOT_EXP -subj $ROOT_SUB
# Verify root certificate
openssl x509 -noout -text -in $ROOT_CRT
#---------------------------------------------
IM_CRT="intermediate.crt"
IM_KEY="intermediate.key"
IM_CNF="im_openssl.cnf"
IM_EXP=4000
IM_SUB="/C=UA/ST=Odessa/L=Odessa/O=${ROOT_ORG}/CN=department.${ROOT_URL}"

# Generate intermediate key
openssl genrsa -out $IM_KEY $KEY_BITS
# Generate intermediate request
openssl req -config $IM_CNF -new -key $IM_KEY -out $CSR_FILE -subj $IM_SUB
# Generate intermediate certificate
openssl ca \
    -config $ROOT_CNF -batch \
    -notext -md sha256 \
    -days $IM_EXP -in $CSR_FILE -out $IM_CRT
# Verify intermediate certificate
openssl x509 -noout -text -in $IM_CRT
openssl verify -CAfile $ROOT_CRT $IM_CRT
