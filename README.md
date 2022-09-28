# Avalanche app for double entry accounting demo

## How to use

Download the example [or clone the repo](https://github.com/xxxxxxxx):

<!-- #default-branch-switch -->

```sh
cd avalanche-accounting
```

## Add configuration values to config.tsx

const config = {
  INFURA_FUJI_PROVIDER: "xxxxxxxxxx",
  INFURA_IPFS_PROJECT_ID: "xxxxxxxxxx",
  INFURA_IPFS_API_KEY_SECRET: "xxxxxxxxxx",
  INFURA_IPFS_GATEWAY: "xxxxxxxxxx",
  CONTRACT_ADDRESS: "xxxxxxxxxx",
  WALLET_ADDRESS: "xxxxxxxxxx",
  PRIVATE_KEY:"xxxxxxxxxx",
};

### Store the actual values in config_local.tsx, which SHOULD NOT be committed (entry in .gitignore)

## Copy the contents of abi.json to the empty abi.json file

Install it and run:

```sh
npm install
npm start
```

or:

```sh
yarn
yarn start
```
