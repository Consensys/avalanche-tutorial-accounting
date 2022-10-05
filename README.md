# Avalanche app for double entry accounting

## Read the tutorial

 For a complete overview, read this [post on the Infura blog](https://blog.infura.io/post/deploy-an-erc721-smart-contract-and-mint-accounting-nfts-with-infura-and-avalanche-c-chain).

## Clone the repo

```sh
git clone git@github.com:ConsenSys/avalanche-tutorial-accounting.git
cd avalanche-tutorial-accounting
```

## Add configuration values to config.tsx

```typescript
const config = {
  INFURA_FUJI_PROVIDER: "xxxxxxxxxx",
  INFURA_IPFS_PROJECT_ID: "xxxxxxxxxx",
  INFURA_IPFS_API_KEY_SECRET: "xxxxxxxxxx",
  INFURA_IPFS_GATEWAY: "xxxxxxxxxx",
  CONTRACT_ADDRESS: "xxxxxxxxxx",
  WALLET_ADDRESS: "xxxxxxxxxx",
  PRIVATE_KEY:"xxxxxxxxxx",
};
```

Store the actual values in config_local.tsx, which SHOULD NOT be committed (entry in .gitignore)

NOTE: For convenience if you’re doing additional commits, instead of writing these values directly to config.tsx, create a file called “config_local.tsx” in the src directory. You can store these values there, and then copy the entire config structure into config.tsx before running the application. Since the .gitignore file has an entry for config_local.tsx, you should avoid accidentally committing the actual values for all to see. Before any additional commits, remove the changes to config.tsx, so the file reverts to the placeholder strings.

## Copy the ABI

Per the instructions in the tutorial, once you've compiled the ERC721 contract in Remix, copy the ABI into the empty abi.json file.

## Install and run

```sh
npm install
npm start
```

or:

```sh
yarn install
yarn start
```
