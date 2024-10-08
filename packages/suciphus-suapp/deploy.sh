#!/bin/bash

# required env vars should be present here:
source ../../.env



# Check if essential environment variables are set
checkEnv() {
    local varName=$1
    local showValue=${2:-false}  # Default to false if not provided
    local varValue=${!varName}
    if [ -z "$varValue" ]; then
        echo "Environment variable $varName is not set or empty"
        exit 1
    else
        echo "$varName is set"
        if [ "$showValue" = true ]; then
            echo "Value: $varValue"
        fi
    fi
}

checkEnv "OPENAI_API_KEY"
checkEnv "OPENAI_ASSISTANT_ID"
checkEnv "PRIVATE_KEY"

echo "Environment: ${DEPLOY_ENV:-development}"

# Determine RPC URL based on environment variable
rpc_url="http://localhost:8545" # default to localhost
if [ "$DEPLOY_ENV" == "prod" ]; then
    rpc_url="https://rpc.toliman.suave.flashbots.net" # switch to production if not in dev
fi
echo "Using RPC URL: $rpc_url"

# Determine which private key to use based on environment
if [ "$DEPLOY_ENV" == "prod" ]; then
    privateKey=$PRIVATE_KEY
else
    privateKey=$DEV_PRIVATE_KEY
fi

deploy() {
    # Run the build and deployment command, capture the output
    if [ -z "$2" ]
    then
        deployed_address=$(forge create --rpc-url $rpc_url --legacy --json --private-key $privateKey ./contracts/$1 | jq -r .deployedTo)
    else
        deployed_address=$(forge create --rpc-url $rpc_url --legacy --json --private-key $privateKey ./contracts/$1 --constructor-args "$2" | jq -r .deployedTo)
    fi

    # Check if the deployed_address is captured
    if [ -z "$deployed_address" ]
    then
        echo "Deployment failed or address not found."
        exit 1
    else
        echo "Contract deployed to address: $deployed_address"
    fi

    # Get the ABI from the JSON file
    abi=$(jq '.abi' ./out/Suciphus.sol/Suciphus.json)

    # Check if the ABI is captured
    if [ -z "$abi" ]
    then
        echo "ABI not found."
        exit 1
    else
        echo "ABI extracted successfully."
    fi
}

deploy "WETH9.sol:WETH9" ""
weth_address=$deployed_address
weth_abi=$(jq '.abi' ./out/WETH9.sol/WETH9.json)

deploy "Suciphus.sol:Suciphus" $weth_address
suciphus_address=$deployed_address
suciphus_abi=$abi

mkdir -p src
cd src

# Write the address and ABI to suciphus.ts
echo "// generated by deploy.sh
import { Address } from \"viem\"

export const suciphus = {
  address: \"$suciphus_address\" as Address,
  abi: $suciphus_abi
}
export const weth = {
  address: \"$weth_address\" as Address,
  abi: $weth_abi
}
" > suciphus.ts

echo "Address and ABI written to /src/suciphus.ts"

# set API key by calling the contract with suave-geth spell
echo "Uploading OpenAI API key to SUAVE..."

suave-geth spell conf-request --private-key $privateKey --rpc $rpc_url --confidential-input $(cast abi-encode "f((string,string))" "($OPENAI_API_KEY, $OPENAI_ASSISTANT_ID)") $suciphus_address "registerAuthOffchain()"