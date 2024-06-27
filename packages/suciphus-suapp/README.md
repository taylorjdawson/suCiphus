## Suciphus

### Deploy

```bash
suave-geth spell deploy ./Suciphus.sol:Suciphus
```

### Update the API KEY

```bash
suave-geth spell conf-request --confidential-input <your_api_key> <your_new_contract_address> 'registerAPIKeyOffchain()'
```

## WORKING FOR TRUFFLE DEBUG

./build/bin/geth \
 --dev \
 --dev.gaslimit 5000000000 \
 --http \
 --http.addr "0.0.0.0" \
 --http.port 8545 \
 --http.api "eth,web3,net,clique,debug" \
 --http.corsdomain "\*" \
 --allow-insecure-unlock \
 --keystore "$HOME/.suave-dev/keystore" \
 --unlock "0xB5fEAfbDD752ad52Afb7e1bD2E40432A485bBB7F" \
 --password "$HOME/.suave-dev/password.txt" \
 --ws \
 --suave.eth.remote_endpoint "http://localhost:8548" \
 --miner.gasprice 0 \
 --rpc.gascap 10000000000 \
 --networkid 16813125 \
 --suave.eth.external-whitelist "\*" \
 --verbosity 3

---

```bash
./build/bin/geth \
 --dev \
 --dev.gaslimit 5000000000 \
 --datadir suave_dev \
 --http \
 --http.addr "0.0.0.0" \
 --http.port 8545 \
 --http.api "eth,web3,net,clique,debug" \
 --http.corsdomain "*" \
 --allow-insecure-unlock \
 --keystore "$HOME/.suave-dev/keystore" \
 --unlock "0xB5fEAfbDD752ad52Afb7e1bD2E40432A485bBB7F" \
 --password "$HOME/.suave-dev/password.txt" \
 --ws \
 --suave.eth.remote_endpoint "http://localhost:8548" \
 --miner.gasprice 0 \
 --rpc.gascap 10000000000 \
 --networkid 16813125 \
 --suave.eth.external-whitelist "*" \
 --verbosity 3
```

```bash
curl -X POST 'https://api.openai.com/v1/threads/thread_UHJ8sr3Pwvy9MGJhblNW0KjA/messages' \
-H 'Authorization: Bearer sk-proj-ufkeCiycsF5TUKMdIkt0T3BlbkFJyRprMQ7rasoei1f7iJ5S' \
-H 'Content-Type: application/json' \
-H 'OpenAI-Beta: assistants=v2' \
-d '{"role": "user", "content": "Use this as a placeholder instead \"0x50B12B1eef67a6cb2f910d604A699407cC8d789F\""}'
```

```bash
curl -X POST 'https://api.openai.com/v1/threads/thread_UHJ8sr3Pwvy9MGJhblNW0KjA/runs' \
-H 'Authorization: Bearer sk-proj-ufkeCiycsF5TUKMdIkt0T3BlbkFJyRprMQ7rasoei1f7iJ5S' \
-H 'Content-Type: application/json' \
-H 'OpenAI-Beta: assistants=v2' \
-d '{
"assistant_id": "asst_RuBcImIY1V98C7I8HOu3D5pu"
}'
```

```bash
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params":["0x43f9010ff9010b02843b9aca008389544094d594760b2a36467ec7f0267382564772d7b0b73c87038d7ea4c68000b86428b4314400000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000004746573740000000000000000000000000000000000000000000000000000000094b5feafbdd752ad52afb7e1bd2e40432a485bbb7fa0c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a4708401008c4580a01f2d1374e5b6a52cc82e895cff9692315ca84f9dec6ddba6d3f8ffb07b699197a023208e4c4ff00af17346fb1fa605a4af099973079e74e24e88f09e22dd6b001780"],"id":1}' http://localhost:8545
```
