import React, { useEffect, useState, Fragment } from "react";

import { styled } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { CircularProgress } from "@mui/material";

import axios from "axios";
import { ethers } from "ethers";
const ABI = require("./abi.json");

import config from "./config";

import { create } from "ipfs-http-client";
import { Buffer } from "buffer";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.primary,
}));

const theAccounts = {
  timestamp: Date.now(),
  cash: "0",
  receivables: "0",
  inventory: "0",
  current_assets: "0",
  other_assets: "0",
  payables: "0",
  current_liabilities: "0",
  other_liabilities: "0",
  total_assets: "0",
  total_liabilities: "0",
  equity: "0",
  total_liabilities_equity: "0",
};

const journalEntries = [
  {
    note: "Before Entries",
    entries: [],
  },
  {
    note: "Initial equity investment",
    entries: [
      { cash: "5,000" },
      { current_assets: "5,000" },
      { total_assets: "5,000" },
      { equity: "5,000" },
      { total_liabilities_equity: "5,000" },
    ],
  },
  {
    note: "Purchase manufacturing equipment",
    entries: [
      { other_assets: "2,000" },
      { other_liabilities: "2,000" },
      { total_liabilities: "2,000" },
      { total_assets: "7,000" },
      { total_liabilities_equity: "7,000" },
    ],
  },
  {
    note: "Purchase inventory from supplier",
    entries: [
      { inventory: "3,000" },
      { current_assets: "8,000" },
      { total_assets: "8,000" },
      { payables: "3,000" },
      { total_liabilities: "5,000" },
      { total_assets: "10,000" },
      { total_liabilities_equity: "10,000" },
    ],
  },
  {
    note: "Sell product to customer",
    entries: [
      { inventory: "2,000" },
      { receivables: "2,000" },
      { current_assets: "9,000" },
      { total_assets: "8,000" },
      { payables: "3,000" },
      { total_liabilities: "5,000" },
      { total_assets: "10,000" },
      { equity: "6,000" },
      { total_liabilities_equity: "11,000" },
    ],
  },
];

const ipfsCredentials =
  config.INFURA_IPFS_PROJECT_ID + ":" + config.INFURA_IPFS_API_KEY_SECRET;

const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    Authorization: `Basic ${Buffer.from(ipfsCredentials).toString("base64")}`,
  },
});

const App = () => {
  const [balance, setBalance] = useState("");
  const [waitEntry, setWaitEntry] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [uri, setUri] = useState("");
  const [accounts, setAccounts] = useState(theAccounts);
  const [entryCounter, setEntryCounter] = useState(0);
  const [done, setDone] = useState(false);

  let entryMeter = 0;

  const provider = ethers.getDefaultProvider(config.INFURA_FUJI_PROVIDER);
  const signer = new ethers.Wallet(config.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(config.CONTRACT_ADDRESS, ABI, signer);
  let cid: any;

  const setMetaData = async (dataObject: object) => {
    const accountsStr = JSON.stringify(dataObject);
    try {
      const added = await ipfs.add(accountsStr);
      cid = added.cid;
      setUri(config.INFURA_IPFS_GATEWAY + added.path);
    } catch (error) {
      console.log("Error uploading file: " + error);
    }
    return uri;
  };

  const setEntry = async (update: object) => {
    await setAccounts((accounts) => ({ ...accounts, ...update }));
  };

  const setDoubleEntries = async (entries: Array<any>) => {
    entries.forEach(async (entry) => {
      await setEntry(entry);
    });
  };

  const handleEntry = () => {
    if (entryCounter < journalEntries.length - 1) {
      entryMeter = entryCounter + 1;
      setDoubleEntries(journalEntries[entryMeter].entries).then(() => {
        setEntryCounter(entryMeter);
        setWaitEntry(false);
        setUploading(true);
      });
    }
  };

  const handleIPFS = () => {
    setWaitEntry(false);
    setMetaData(accounts);
    setUploading(false);
  };

  const mintNFT = async (uriContainer: any) => {
    const { uri } = uriContainer;
    let nftTxn = await contract.safeMint(config.WALLET_ADDRESS, uri);
    setMinting(true);
    await nftTxn.wait();
    setMinting(false);
    if (entryCounter < journalEntries.length - 1) {
      setWaitEntry(true);
    } else {
      setWaitEntry(false);
      setDone(true);
    }
    getBalance().then((r) => {
      setBalance(r);
    });
  };

  const getBalance = async () => {
    const response = await axios({
      method: "post",
      url: config.INFURA_FUJI_PROVIDER,
      data: {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [config.WALLET_ADDRESS, "latest"],
      },
    });
    const { data } = response;
    const { result } = data;
    const n = ethers.utils.formatEther(result);
    const z = parseFloat(n).toPrecision(6);
    return z.toString();
  };

  useEffect(() => {
    getBalance().then((r) => {
      setBalance(r);
    });
  }, []);
  return (
    <Fragment>
      <CssBaseline />
      <Container maxWidth="md">
        <Box
          sx={{
            width: 800,
            height: 800,
            bgcolor: "#cfe8fc",
            marginTop: "2rem",
            padding: "2rem",
            border: "1px solid grey",
          }}
        >
          <Box
            sx={{
              marginTop: "2rem",
              padding: "2rem",
              border: "1px solid grey",
            }}
          >
            <Grid
              container
              sx={{
                marginBottom: "1rem",
              }}
            >
              <Grid item xs={6}>
                <Button
                  size="medium"
                  variant="contained"
                  disabled={uploading || !waitEntry}
                  onClick={() => handleEntry()}
                >
                  ENTRY
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Item>{journalEntries[entryCounter].note}</Item>
              </Grid>
            </Grid>

            <Grid
              container
              sx={{
                marginBottom: "1rem",
              }}
            >
              <Grid item xs={12}>
                <Button
                  size="medium"
                  variant="contained"
                  disabled={!uploading || waitEntry || minting}
                  onClick={() => handleIPFS()}
                >
                  IPFS
                </Button>
              </Grid>
            </Grid>

            <Grid
              container
              spacing={1}
              sx={{
                marginBottom: "1rem",
              }}
            >
              <Grid item xs={3}>
                <Button
                  size="medium"
                  variant="contained"
                  disabled={waitEntry || minting || uploading || done}
                  onClick={() => mintNFT({ uri })}
                >
                  {minting ? "MINTING" : "MINT"}
                </Button>
              </Grid>
              <Grid
                item
                xs={3}
                sx={{
                  textAlign: "center",
                }}
              >
                {minting && <CircularProgress />}
              </Grid>
              <Grid item xs={3}>
                <Item>Wallet Balance</Item>
              </Grid>
              <Grid item xs={3}>
                <Item>{balance}</Item>
              </Grid>
            </Grid>
            <Grid container spacing={1}>
              {/* ROW */}
              <Grid
                item
                xs={6}
                sx={{
                  fontWeight: "700",
                  margin: ".5rem 0rem",
                }}
              >
                Assets
              </Grid>
              <Grid
                item
                xs={6}
                sx={{
                  fontWeight: "700",
                  margin: ".5rem 0rem",
                }}
              >
                Liabilities + Equity
              </Grid>
              {/* ROW */}
              <Grid item xs={3}>
                <Item>Cash</Item>
              </Grid>
              <Grid item xs={3}>
                <Item>{accounts.cash}</Item>
              </Grid>
              <Grid item xs={6}>
                &nbsp;
              </Grid>
              {/* ROW */}
              <Grid item xs={3}>
                <Item>Receivables</Item>
              </Grid>
              <Grid item xs={3}>
                <Item>{accounts.receivables}</Item>
              </Grid>
              <Grid item xs={3}>
                <Item>Payables</Item>
              </Grid>
              <Grid item xs={3}>
                <Item>{accounts.payables}</Item>
              </Grid>
              {/* ROW */}
              <Grid item xs={3}>
                <Item>Inventory</Item>
              </Grid>
              <Grid item xs={3}>
                <Item>{accounts.inventory}</Item>
              </Grid>
              <Grid item xs={6}>
                &nbsp;
              </Grid>
              {/* ROW */}
              <Grid item xs={3}>
                <Item>Current Assets</Item>
              </Grid>
              <Grid item xs={3}>
                <Item>{accounts.current_assets}</Item>
              </Grid>
              <Grid item xs={3}>
                <Item>Current Liabilities</Item>
              </Grid>
              <Grid item xs={3}>
                <Item>{accounts.current_liabilities}</Item>
              </Grid>
              {/* ROW */}
              <Grid item xs={3}>
                <Item>Other Assets</Item>
              </Grid>
              <Grid item xs={3}>
                <Item>{accounts.other_assets}</Item>
              </Grid>
              <Grid item xs={3}>
                <Item>Other Liabilities</Item>
              </Grid>
              <Grid item xs={3}>
                <Item>{accounts.other_liabilities}</Item>
              </Grid>
              {/* ROW */}
              <Grid item xs={6}>
                &nbsp;
              </Grid>
              <Grid item xs={3}>
                <Item>Total Liabilities</Item>
              </Grid>
              <Grid item xs={3}>
                <Item>{accounts.total_liabilities}</Item>
              </Grid>
              {/* ROW */}
              <Grid item xs={6}>
                &nbsp;
              </Grid>
              <Grid item xs={3}>
                <Item>Equity</Item>
              </Grid>
              <Grid item xs={3}>
                <Item>{accounts.equity}</Item>
              </Grid>
              {/* ROW */}
              <Grid item xs={3}>
                <Item>Total Assets</Item>
              </Grid>
              <Grid item xs={3}>
                <Item>{accounts.total_assets}</Item>
              </Grid>
              <Grid item xs={3}>
                <Item>Total Liabilities + Equity</Item>
              </Grid>
              <Grid item xs={3}>
                <Item>{accounts.total_liabilities_equity}</Item>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </Fragment>
  );
};

export default App;
