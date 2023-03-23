#!/bin/bash

echo "Generating temporary manifest with secrets."
cp app-env-vars.secrets.txt app-env-vars.secrets-tmp.yaml
sed -i "s^{{ALGOD_TOKENS}}^$ALGOD_TOKENS^g" app-env-vars.secrets-tmp.yaml
sed -i "s^{{ALGOD_SERVERS}}^$ALGOD_SERVER^g" app-env-vars.secrets-tmp.yaml
sed -i "s^{{ALGOD_PORTS}}^$ALGOD_PORTS^g" app-env-vars.secrets-tmp.yaml
sed -i "s^{{SENTRY_DSN}}^$ALGOD_SENTRY_DSN^g" app-env-vars.secrets-tmp.yaml
sed -i "s^{{SERVICE_MNEMONIC}}^$SERVICE_MNEMONIC^g" app-env-vars.secrets-tmp.yaml
sed -i "s^{{AWS_SECRET_ACCESS_KEY}}^$APP_AWS_SECRET_ACCESS_KEY^g" app-env-vars.secrets-tmp.yaml
sed -i "s^{{VRF_ENCRYPTED_KEY}}^$VRF_ENCRYPTED_KEY^g" app-env-vars.secrets-tmp.yaml

echo "Applying secrets"

kubectl apply -f app-env-vars.secrets-tmp.yaml

if [ $? -eq 0 ]; then
    echo "Secrets applied with success."
else
    echo "Error Applying secrets."
    exit 1
fi

echo "Deleting temporary manifest with secrets."
rm -fr  app-env-vars.secrets-tmp.yaml

if [ $? -eq 0 ]; then
    echo "Secrets applied with success."
else
    echo "Error Applying secrets."
    exit 1
fi
