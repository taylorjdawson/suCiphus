## Suciphus

### Deploy

```bash
suave-geth spell deploy ./Suciphus.sol:Suciphus
```

### Update the API KEY

```bash
suave-geth spell conf-request --confidential-input <your_api_key> <your_new_contract_address> 'registerKeyOffchain()'
```
