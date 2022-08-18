#!/bin/bash

set -e

USERNAME="abbuilder"
PASS=$DOCKER_PASSWORD

COMPANY="appliedblockchain"
REPO_LIST=("algorand-randomness-beacon-vrf" "algorand-randomness-beacon-app")
QTY_IMAGES_TO_MAINTAIN=5

#get dockerhub token
TOKEN=$(curl -s -H "Content-Type: application/json" -X POST -d '{"username": "'${USERNAME}'", "password": "'${PASS}'"}' https://hub.docker.com/v2/users/login/ | jq -r .token)

for i in ${REPO_LIST[@]}
do

  IMAGE_TAGS=$(curl -s -H "Authorization: JWT ${TOKEN}" https://hub.docker.com/v2/repositories/${COMPANY}/${i}/tags/?page_size=10000 | jq -r '.results|.[]|.name')
  COUNTER=0

  for j in ${IMAGE_TAGS}
  do

    IMAGE="${COMPANY}/${i}:${j}"
    if [[ ${j} == *"${ENV}"* ]]; then
      if [ $COUNTER -ge $QTY_IMAGES_TO_MAINTAIN ]; then
        echo "Deliting: $IMAGE"
        curl -s  -X DELETE  -H "Authorization: JWT ${TOKEN}" https://hub.docker.com/v2/repositories/${COMPANY}/${i}/tags/${j}/
      fi
    
      ((COUNTER=COUNTER+1))
    else
      echo "Tag ${j} does not make part of branch  ${CIRCLE_BRANCH}"
    fi
  done

done
