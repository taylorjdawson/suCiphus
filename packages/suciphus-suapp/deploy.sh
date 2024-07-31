#!/bin/bash

# required env vars should be present here:
source ../../.env

checkEnv() {
    local varName=$1
    local varValue=${!varName}
    if [ -z "$varValue" ]; then
        echo "Environment variable $varName is not set or empty"
        exit 1
    else
        echo "$varName is set to $varValue"
    fi
}
checkEnv "OPENAI_API_KEY"
checkEnv "OPENAI_ASSISTANT_ID"

deploy() {
    # Run the build and deployment command, capture the output
    if [ -z "$2" ]
    then
        output=$(suave-geth spell deploy ./$1 2>&1 | tee /dev/tty)
        deployed_address=$(echo "$output" | grep 'Contract deployed' | awk -F 'address=' '{print $2}')
    else
        deployed_address=$(forge create --json --private-key 0x91ab9a7e53c220e6210460b65a7a3bb2ca181412a8a7b43ff336b3df1737ce12 ./contracts/$1 --constructor-args "$2" | jq -r .deployedTo)
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

deploy "WETH9.sol:WETH9"
weth_address=$deployed_address
weth_abi=$(jq '.abi' ./out/WETH9.sol/WETH9.json)

deploy "Suciphus.sol:Suciphus" $weth_address
suciphus_address=$deployed_address
suciphus_abi=$abi

mkdir -p src
cd src

# Write the address and ABI to suciphus.ts
echo "// generated by deploy.sh

export const suciphus = {
  address: \"$suciphus_address\" as \`0x\${string}\`,
  abi: $suciphus_abi
}
export const weth = {
  address: \"$weth_address\" as \`0x$\{string\}\`,
  abi: $weth_abi
}
" > suciphus.ts

echo "Address and ABI written to /src/suciphus.ts"

# set API key by calling the contract with suave-geth spell
echo "Uploading OpenAI API key to SUAVE..."

suave-geth spell conf-request --confidential-input $(cast abi-encode "f((string,string))" "($OPENAI_API_KEY, $OPENAI_ASSISTANT_ID)") $suciphus_address "registerAuthOffchain()"