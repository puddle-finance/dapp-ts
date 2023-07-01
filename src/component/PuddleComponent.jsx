import {
  ConnectButton,
  useAccountBalance,
  useWallet,
  SuiChainId,
  ErrorCode,
  formatSUI,
  addressEllipsis,
  useSuiProvider
} from "@suiet/wallet-kit";

import { useState, useEffect, useRef } from 'react';

import {
  getYourFundItems,
  getYourInvestItems,
  getPuddleStatistics
} from "../resources/sui_api.js";

import axios from 'axios';

import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react';

export default function WalletComponent() {

  const walletStyle = {
    textAlign: 'center'
  }

  const WalletTableStyle = {
    backgroundColor: '#111524',
    border: '1px solid darkgoldenrod',
    padding: '20px',
    borderRadius: '18px',
    width: '40vw',
    margin: '15px',
    display: 'inline-table',
  }

  const ThStyle = {
    fontSize: '24px',
    color: 'darkorchid',
  }

  function timestampChange(timestamp) {
    if (timestamp == 0) {
      return "N/A";
    }
    var date = new Date(timestamp);
    var Y = date.getFullYear() + '/';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '/';
    var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    return Y + M + D + h + m + s;
  }

  const wallet = useWallet();
  const { balance } = useAccountBalance();

  const SUI_MAINNET_API_URL = "https://fullnode.mainnet.sui.io";
  const SUI_TESTNET_API_URL = "https://fullnode.testnet.sui.io";
  const SUI_DEVNET_API_URL = "https://fullnode.devnet.sui.io";

  const [apiurl, setApiurl] = useState(SUI_TESTNET_API_URL);
  const [yourInvestItem, setYourInvestItem] = useState(new Array());
  const [yourFundItem, setYourFundItem] = useState(new Array());
  const [puddleStatistics, setPuddleStatistics] = useState(new Object());

  useEffect(() => {
    if (wallet.connected) {
      if (wallet.chain.name === 'Sui Devnet') {
        setApiurl(SUI_DEVNET_API_URL);
      } else if (wallet.chain.name === 'Sui Testnet') {
        setApiurl(SUI_TESTNET_API_URL);
      } else {
        setApiurl(SUI_MAINNET_API_URL);
      }
      // setYourFundItem(getYourFundItems(axios, apiurl, wallet.account.address));
      // setYourInvestItem(getYourInvestItems(axios, apiurl, wallet.account.address));
      // setPuddleStatistics(getPuddleStatistics(axios, apiurl));
      geta();
    }
  }, [wallet.connected]);

  async function geta() {
    let a = await getPuddleStatistics(axios, apiurl);
    setPuddleStatistics(a);
    console.log(puddleStatistics);
  }



  return (
    <div className="wallet" style={walletStyle}>
      <div style={WalletTableStyle}>
        <h1 style={{ color: 'dodgerblue' }}>Wallet Detail</h1>
        <Table variant='simple' align="center" style={{ width: "100%" }}>
          <Thead>
            <Tr>
              <Th style={ThStyle} >Network</Th>
              <Th style={ThStyle} >Status</Th>
              <Th style={ThStyle} >Balance</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>{wallet.chain ? wallet.chain.name : 'N/A'}</Td>
              <Td>
                {wallet.connecting
                  ? 'Connecting'
                  : wallet.connected
                    ? 'Connected'
                    : 'N/A'}
              </Td>
              <Td>
                {balance ? formatSUI(balance ?? 0, {
                  withAbbr: false
                }) + ' SUI' : 'N/A'}
              </Td>
            </Tr>
          </Tbody>
        </Table>

        <h1 style={{ color: 'gold' }}>Your Invest Items</h1>
        <Table variant='simple' align="center" style={{ width: "100%" }}>
          <Thead>
            <Tr>
              <Th style={ThStyle} >Network</Th>
              <Th style={ThStyle} >Status</Th>
              <Th style={ThStyle} >Balance</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>{wallet.adapter?.name}</Td>
              <Td>
                {wallet.connecting
                  ? 'connecting'
                  : wallet.connected
                    ? 'connected'
                    : 'disconnected'}
              </Td>
              <Td>
                {formatSUI(balance ?? 0, {
                  withAbbr: false
                })} SUI
              </Td>
            </Tr>
          </Tbody>
        </Table>

        <h1 style={{ color: 'gold' }}>Your Fund Items</h1>
        <Table variant='simple' align="center" style={{ width: "100%" }}>
          <Thead>
            <Tr>
              <Th style={ThStyle} >Network</Th>
              <Th style={ThStyle} >Status</Th>
              <Th style={ThStyle} >Balance</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>{wallet.adapter?.name}</Td>
              <Td>
                {wallet.connecting
                  ? 'connecting'
                  : wallet.connected
                    ? 'connected'
                    : 'disconnected'}
              </Td>
              <Td>
                {formatSUI(balance ?? 0, {
                  withAbbr: false
                })} SUI
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </div>

      <div style={WalletTableStyle}>
        <h1 style={{ color: 'fuchsia' }}>Fund Detail</h1>
        {!wallet.connected ? (
          <p>Connect DApp with Suiet wallet from now!</p>
        ) : (
          <Table variant='simple' align="center" style={{ width: "100%" }}>
            <Thead>
              <Tr>
                <Th style={ThStyle} >Network</Th>
                <Th style={ThStyle} >Status</Th>
                <Th style={ThStyle} >Balance</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>{wallet.adapter?.name}</Td>
                <Td>
                  {wallet.connecting
                    ? 'connecting'
                    : wallet.connected
                      ? 'connected'
                      : 'disconnected'}
                </Td>
                <Td>
                  {formatSUI(balance ?? 0, {
                    withAbbr: false
                  })} SUI
                </Td>
              </Tr>
            </Tbody>
          </Table>
        )}
      </div>


    </div>


  );
}