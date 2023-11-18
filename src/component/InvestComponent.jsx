import {
  ConnectButton,
  useAccountBalance,
  useWallet,
  SuiChainId,
  ErrorCode,
  formatSUI,
  addressEllipsis,
  useSuiProvider,
} from "@suiet/wallet-kit";

import { useState, useEffect, useRef } from 'react';

import {
  getYourInvestItems,
  getPuddleStatistics,
  mergePuddleShares,
  depositPuddleShares,
  salePuddleShares,
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
  Tab,
  Icon,
  Input,
  position,
} from '@chakra-ui/react';

import { CloseIcon } from '@chakra-ui/icons'

import Popup from 'reactjs-popup';
import '../resources/style.css';
import 'reactjs-popup/dist/index.css';

export default function WalletComponent() {

  const walletStyle = {
    textAlign: 'center'
  }

  const WalletTableStyle = {
    backgroundColor: '#111524',
    border: '1px solid darkgoldenrod',
    padding: '20px',
    borderRadius: '18px',
    width: '45vw',
    margin: '15px',
    display: 'inline-table',
  }

  const FundTableStyle = {
    backgroundColor: '#111524',
    border: '1px solid darkgoldenrod',
    padding: '20px',
    borderRadius: '18px',
    width: '45vw',
    margin: '15px',
    display: 'inline-table',
  }

  const ThStyle = {
    fontSize: '24px',
    color: 'deepskyblue',
  }

  const TdStyle = {
    padding: '2vh 0'
  }

  const displayBlock = {
    display: 'block'
  }

  const displayNone = {
    display: 'none'
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
  const SUI_TESTNET_API_URL =  "https://fullnode.testnet.sui.io";
  const SUI_DEVNET_API_URL = "https://fullnode.devnet.sui.io";

  const SUI_MAINNET_SUIEXPLOR_URL = "https://suiexplorer.com/{type}/{id}?network=mainnet";
  const SUI_TESTNET_SUIEXPLOR_URL = "https://suiexplorer.com/{type}/{id}?network=testnet";
  const SUI_DEVNET_SUIEXPLOR_URL = "https://suiexplorer.com/{type}/{id}?network=devnet";

  const [apiurl, setApiurl] = useState(SUI_TESTNET_API_URL);
  const [suiexplor, setSuiexplor] = useState();
  const [yourInvestItem, setYourInvestItem] = useState(new Array());
  const [puddleStatistics, setPuddleStatistics] = useState(new Object());
  const [payAmount, setPayAmount] = useState(0);
  const [payPrice, setPayPrice] = useState(0);

  useEffect(() => {
    if (wallet.connected) {
      if (wallet.chain.name === 'Sui Devnet') {
        setApiurl(SUI_DEVNET_API_URL);
        setSuiexplor(SUI_DEVNET_SUIEXPLOR_URL);
      } else if (wallet.chain.name === 'Sui Testnet') {
        setApiurl(SUI_TESTNET_API_URL);
        setSuiexplor(SUI_TESTNET_SUIEXPLOR_URL);
      } else {
        setApiurl(SUI_MAINNET_API_URL);
        setSuiexplor(SUI_MAINNET_SUIEXPLOR_URL);getYourInvestItems
      }
      getYourInvsetFunds();
      getFundsData();
    }
  }, [wallet.connected]);

  function getFundsData() {
    getPuddleStatistics(axios, apiurl, wallet.account.address, true, false, false, 'invest').then(resp => {
      setPuddleStatistics(resp);
    });
  }

  function getYourInvsetFunds() {
    getYourInvestItems(axios, apiurl, wallet.account.address).then(resp => {
      setYourInvestItem(resp);
    });
  }

  const changePayAmount = (e) => {
    setPayAmount(e.target.value);
  }

  const changePayPrice = (e) => {
    setPayPrice(e.target.value);
  }

  function mergePuddleSharesFn(puddle) {
    let coin_type = puddle.puddle.coin_type;
    let shares_id = puddle.id;
    let merge_id_arr = puddle.merge_id_arr;
    mergePuddleShares(wallet, coin_type, shares_id, merge_id_arr);
  }

  function depositAmount(puddle) {
    if (puddle.puddle){
      puddle = puddle.puddle;
    }
    let coin_type = puddle.coin_type;
    let coin_decimals = puddle.coin_decimals;
    let puddle_id = puddle.id.id;
    let amount = payAmount;

    depositPuddleShares(wallet, coin_type, puddle_id, amount, coin_decimals);
  }

  function saleAmount(puddle) {
    let coin_type = puddle.puddle.coin_type;
    let coin_decimals = puddle.puddle.coin_decimals;
    let shares_id = puddle.id;
    let puddle_id = puddle.puddle.id.id;
    let shares = puddle.shares;
    let amount = payAmount;
    let price = payPrice;
    if (Number(amount) > Number(shares) / Number(coin_decimals)) {
      alert("Insufficient shares");
    } else {
      let same = (Number(amount) * Number(coin_decimals)) == Number(shares) ? true : false;
      let real_amount = same ? Number(shares) : Number(shares) - (Number(amount) * Number(coin_decimals));
      let real_price = Number(price) * Number(coin_decimals);
      salePuddleShares(wallet, coin_type, puddle_id, shares_id, real_amount, same, real_price);
    }
  }

  function showDepositAmount(id) {
    document.getElementById(id + "_depositAmount").style.display = "block";
    document.getElementById(id + "_saleAmount").style.display = "none";
  }

  function showSaleAmount(id) {
    document.getElementById(id + "_depositAmount").style.display = "none";
    document.getElementById(id + "_saleAmount").style.display = "block";
  }

  return (
    <div className="wallet" style={walletStyle}>
      <div style={WalletTableStyle}>
        <h1 style={{ color: 'gold' }}>Wallet Detail</h1>
        <Table variant='simple' align="center" style={{ width: "100%" }}>
          <Thead>
            <Tr>
              <Th style={{ ...ThStyle, width: "30%" }} >Network</Th>
              <Th style={{ ...ThStyle, width: "50%" }} >Status</Th>
              <Th style={{ ...ThStyle, width: "20%" }} >Balance</Th>
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

        <h1 style={{ color: 'gold' }}>Your Invested Puddles</h1>
        <Table variant='simple' align="center" style={{ width: "100%" }}>
          <Thead>
            <Tr>
              <Th style={{ ...ThStyle, width: "30%" }} >Name</Th>
              <Th style={{ ...ThStyle, width: "50%" }} >Description</Th>
              <Th style={{ ...ThStyle, width: "20%" }} >PuddleShares</Th>
            </Tr>
          </Thead>
          <Tbody>
            {
              yourInvestItem?.map(puddle => {
                return (
                  <Tr>
                    <Td style={{ ...TdStyle, wordBreak: 'break-all' }}>
                      <Popup trigger={<a href="javascript:void(0)">{puddle?.puddle?.metadata.name}</a>}
                        onOpen={() => [setPayAmount(0), setPayPrice(0)]}
                        onClose={() => [setPayAmount(0), setPayPrice(0)]}
                        modal
                        nested
                        data-theme='dark'
                        position="right center">
                        {close => (
                          <div>
                            <div style={{ textAlign: "left" }}>
                              <a style={{ cursor: "pointer" }}>
                                <Icon as={CloseIcon} className="close" onClick={close} />
                              </a>
                            </div>
                            <div style={{ overflow: 'overlay' }}>
                              <h1 style={{ color: 'gold' }}>Fund Detail</h1>
                              <Table variant='simple' align="center" style={{ width: "100%", color: "white" }}>
                                <Thead>
                                  <Tr>
                                    <Th style={ThStyle} >Puddle Name</Th>
                                    <Th style={ThStyle} >Total Supply</Th>
                                    <Th style={ThStyle} >Max Supply</Th>
                                    <Th style={ThStyle} >Puddle Trader</Th>
                                    <Th style={ThStyle} >Proportion</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  <Tr>
                                    <Td >{puddle?.puddle?.metadata.name}</Td>
                                    <Td>{Number(puddle?.puddle?.metadata.total_supply) / Number(puddle?.puddle?.coin_decimals) + " " + puddle?.puddle?.coin_name}</Td>
                                    <Td >{Number(puddle?.puddle?.metadata.max_supply) / Number(puddle?.puddle?.coin_decimals) + " " + puddle?.puddle?.coin_name}</Td>
                                    <Td>
                                      <a target="_black" href={suiexplor.replace("{id}", puddle?.puddle?.metadata.trader).replace("{type}", "address")}>{addressEllipsis(puddle?.puddle?.metadata.trader)}</a>
                                    </Td>
                                    <Td>{puddle.proportion}</Td>
                                  </Tr>
                                </Tbody>
                              </Table>
                              <Table style={{ width: '100%' }}>
                                <Thead>
                                  <Tr>
                                    <Th style={ThStyle} >Description</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  <Tr>
                                    <Td style={{ width: "40%", wordBreak: 'break-all' }}>{puddle?.puddle?.metadata.desc}</Td>
                                  </Tr>
                                </Tbody>
                              </Table>

                              <hr />

                              <h1 style={{ color: 'gold' }}>Invested Detail</h1>
                              <Table variant='simple' align="center" style={{ width: "100%", color: "white" }}>
                                <Thead>
                                  <Tr>
                                    <Th style={{ ...ThStyle, width: '30%' }} >PuddleShares</Th>
                                    {
                                      puddle.can_merge
                                        ? <Th style={{ ...ThStyle, width: '30%' }} >Merge PuddleShares</Th>
                                        : <Th style={displayNone} >Merge PuddleShares</Th>
                                    }
                                    <Th style={{ ...ThStyle, width: '40%' }} >
                                      <button className="btn" onClick={() => showDepositAmount(puddle.puddle.id.id)}>Deposit</button>
                                    </Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  <Tr>
                                    <Td>
                                      <b style={{ color: 'cyan' }}>{Number(puddle?.shares) / Number(puddle?.puddle.coin_decimals) + " " + puddle?.puddle.coin_name}</b>
                                    </Td>
                                    {
                                      puddle.can_merge
                                        ? <Td><button className="btn" onClick={() => mergePuddleSharesFn(puddle)}>Merge</button></Td>
                                        : <Td style={displayNone} ></Td>
                                    }
                                    <Td>
                                      <div id={puddle.puddle.id.id + "_depositAmount"} style={{ display: 'none' }}>
                                        <div>
                                          <p style={ThStyle}>Amount</p>
                                          <input type="number" onChange={changePayAmount} value={payAmount} />
                                        </div>
                                        <div >
                                          <button className="btn" onClick={() => depositAmount(puddle)} style={{marginTop: '10px'}}>Confirm</button>
                                          <button className="btn" onClick={() => [setPayAmount(0), setPayPrice(0)]} style={{marginLeft:'10px', marginTop: '10px'}}>Cancel</button>
                                        </div>
                                      </div>

                                      <div id={puddle.puddle.id.id + "_saleAmount"} style={{ display: 'none' }}>
                                        <p>
                                          <span>
                                            <p style={ThStyle}>Amount</p>
                                            <input type="number" onChange={changePayAmount} value={payAmount} />
                                          </span>
                                          <span>
                                            <p>Price</p>
                                            <input type="number" onChange={changePayPrice} value={payPrice} />
                                          </span>
                                        </p>
                                        <button className="btn" onClick={() => saleAmount(puddle)} style={{marginTop: '10px'}}>Confirm</button>
                                        <button className="btn" onClick={() => [setPayAmount(0), setPayPrice(0)]} style={{marginLeft:'10px',marginTop: '10px'}}>Cancel</button>
                                      </div>
                                    </Td>
                                  </Tr>
                                </Tbody>
                              </Table>
                            </div>
                          </div>
                        )}
                      </Popup>
                    </Td>
                    <Td className="fontverylong">{puddle?.puddle.metadata.desc}</Td>
                    <Td>{Number(puddle?.shares) / puddle?.puddle.coin_decimals + " " + puddle?.puddle.coin_name}</Td>
                  </Tr>
                )
              })
            }
          </Tbody>
        </Table>
      </div>

      <div style={FundTableStyle}>
        <h1 style={{ color: 'gold' }}>Puddles</h1>
        <Table variant='simple' align="center" style={{ width: "100%" }}>
          <Thead>
            <Tr>
              <Th style={ThStyle} >Name</Th>
              <Th style={ThStyle} >Description</Th>
              <Th style={ThStyle} >Total Supply</Th>
              <Th style={ThStyle} ></Th>
            </Tr>
          </Thead>
          <Tbody>
            {
              puddleStatistics?.in_progress_puddles?.map(puddle => {
                if (!puddle?.isInvest) {
                  return (
                    <Tr>
                      <Td style={{ ...TdStyle, wordBreak: 'break-all' }}>
                        <Popup trigger={<a href="javascript:void(0)">{puddle?.metadata.name}</a>}
                          onOpen={() => [setPayAmount(0)]}
                          onClose={() => [setPayAmount(0)]}
                          modal
                          nested
                          data-theme='dark'
                          position="right center">
                          {close => (
                            <div>
                              <div style={{ textAlign: "left" }}>
                                <a style={{ cursor: "pointer" }}>
                                  <Icon as={CloseIcon} className="close" onClick={close} />
                                </a>
                              </div>
                              <div style={{ overflow: 'overlay' }}>
                                <h1 style={{ color: 'gold' }}>Fund Detail</h1>
                                <Table variant='simple' align="center" style={{ width: "100%", color: "white" }}>
                                  <Thead>
                                    <Tr>
                                      <Th style={ThStyle} >Fund Name</Th>
                                      <Th style={ThStyle} >Total Supply</Th>
                                      <Th style={ThStyle} >Max Supply</Th>
                                      <Th style={ThStyle} >Fund Trader</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    <Tr>
                                      <Td >{puddle?.metadata.name}</Td>
                                      <Td>{Number(puddle?.metadata.total_supply) / Number(puddle?.coin_decimals) + " " + puddle?.coin_name}</Td>
                                      <Td >{Number(puddle?.metadata.max_supply) / Number(puddle?.coin_decimals) + " " + puddle?.coin_name}</Td>
                                      <Td>
                                        <a target="_black" href={suiexplor.replace("{id}", puddle?.metadata.trader).replace("{type}", "address")}>{addressEllipsis(puddle?.metadata.trader)}</a>
                                      </Td>
                                    </Tr>
                                  </Tbody>
                                </Table>
                                <Table style={{ width: '100%' }}>
                                  <Thead>
                                    <Tr>
                                      <Th style={ThStyle} >Description</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    <Tr>
                                      <Td style={{ width: "40%", wordBreak: 'break-all' }}>{puddle?.metadata.desc}</Td>
                                    </Tr>
                                  </Tbody>
                                </Table>
  
                                <hr />
  
                                <h1 style={{ color: 'gold' }}>Invested Detail</h1>
                                <Table variant='simple' align="center" style={{ width: "100%", color: "white" }}>
                                  <Thead>
                                    <Tr>
                                      {
                                        puddle.can_merge
                                          ? <Th style={{ ...ThStyle, width: '30%' }} >Merge PuddleShares</Th>
                                          : <Th style={displayNone} >Merge PuddleShares</Th>
                                      }
                                      <Th style={{ ...ThStyle, width: '40%' }} >
                                        <button className="btn" onClick={() => showDepositAmount(puddle.id.id)}>Deposit</button>
                                      </Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    <Tr>
                                      {
                                        puddle.can_merge
                                          ? <Td><button className="btn" onClick={() => mergePuddleSharesFn(puddle)}>Merge</button></Td>
                                          : <Td style={displayNone} ></Td>
                                      }
                                      <Td>
                                        <div id={puddle.id.id + "_depositAmount"} style={{ display: 'none' }}>
                                          <div>
                                            <p style={ThStyle}>Amount</p>
                                            <input type="number" onChange={changePayAmount} value={payAmount} />
                                          </div>
                                          <button className="btn" onClick={() => depositAmount(puddle)} style={{marginTop: '10px'}}>Confirm</button>
                                          <button className="btn"  onClick={() => [setPayAmount(0), setPayPrice(0)]} style={{marginLeft:'10px', marginTop: '10px'}}>Cancel</button>
                                        </div>
  
                                        <div id={puddle.id.id + "_saleAmount"} style={{ display: 'none' }}>
                                          <p>
                                            <span>
                                              <p style={ThStyle}>Amount</p>
                                              <input type="number" onChange={changePayAmount} value={payAmount} />
                                            </span>
                                            <span>
                                              <p>Price</p>
                                              <input type="number" onChange={changePayPrice} value={payPrice} />
                                            </span>
                                          </p>
                                          <button className="btn" onClick={() => saleAmount(puddle)}>Confirm</button>
                                          <button className="btn" onClick={() => [setPayAmount(0), setPayPrice(0)]} style={{marginLeft:'10px'}}>Cancel</button>
                                        </div>
                                      </Td>
                                    </Tr>
                                  </Tbody>
                                </Table>
                              </div>
                            </div>
                          )}
                        </Popup>
                      </Td>
                      <Td className="fontverylong">{puddle.metadata.desc}</Td>
                      <Td>{Number(puddle?.metadata?.total_supply) / puddle.coin_decimals + " " + puddle.coin_name}</Td>
                    </Tr>
                  )
                }
              })
            }
          </Tbody>
        </Table>
      </div>
    </div >
  );
}