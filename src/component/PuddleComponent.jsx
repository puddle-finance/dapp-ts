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

import { useState, useEffect, useRef, useCallback } from 'react';

import {
  getYourFundItems,
  createPuddle,
  modifyPuddle,
} from "../resources/sui_api.js";

import { getCetusCoinTypeSelectArray } from "../resources/cetus_api.js";

getCetusCoinTypeSelectArray();

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
  Tooltip
} from '@chakra-ui/react';

import { CloseIcon, InfoOutlineIcon } from '@chakra-ui/icons'

import Popup from 'reactjs-popup';
import '../resources/style.css';
import 'reactjs-popup/dist/index.css';

export default function WalletComponent() {

  const PuddlStyle = {
    textAlign: 'center'
  }

  const PuddleTableStyle = {
    backgroundColor: 'rgba(17,21,36,0.95)',
    //border: '1px solid darkgoldenrod',
    padding: '20px',
    borderRadius: '4px',
    width: '80vw',
    margin: '15px',
    display: 'inline-table',
  }

  const FundTableStyle = {
    backgroundColor: 'rgba(17,21,36,0.95)',
    //border: '1px solid darkgoldenrod',
    padding: '18px',
    borderRadius: '4px',
    width: '45vw',
    margin: '15px',
    display: 'inline-table',
  }

  const ThStyle = {
    fontWeight: '500',
    fontSize: '18px',
    color: 'Grey'
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
  const SUI_TESTNET_API_URL = "https://fullnode.testnet.sui.io";
  const SUI_DEVNET_API_URL = "https://fullnode.devnet.sui.io";

  const SUI_MAINNET_SUIEXPLOR_URL = "https://suiexplorer.com/{type}/{id}?network=mainnet";
  const SUI_TESTNET_SUIEXPLOR_URL = "https://suiexplorer.com/{type}/{id}?network=testnet";
  const SUI_DEVNET_SUIEXPLOR_URL = "https://suiexplorer.com/{type}/{id}?network=devnet";

  const [apiurl, setApiurl] = useState(SUI_TESTNET_API_URL);
  const [suiexplor, setSuiexplor] = useState();
  const [yourPuddles, setYourPuddles] = useState(new Array());

  const [maxSupply, setMaxSupply] = useState(0);
  const [trader, setTrader] = useState("");
  const [commissionPercentage, setCommissionPercentage] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [coinType, setCoinType] = useState("0x2::sui::SUI");
  const [puddleObj, setPuddleObj] = useState(new Object());

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
        setSuiexplor(SUI_MAINNET_SUIEXPLOR_URL);
      }
      getYourPuddlesData();
    }
  }, [wallet.connected]);

  const getYourPuddlesData = useCallback(() => {
    getYourFundItems(wallet.account.address).then(resp => {
      setYourPuddles(resp);
    });
  });

  function inputMaxSupply(e) {
    setMaxSupply(e.target.value);
  }

  function inputTrader(e) {
    setTrader(e.target.value);
  }

  function inputCommissionPercentage(e) {
    setCommissionPercentage(e.target.value);
  }

  function inputName(e) {
    setName(e.target.value);
  }

  function inputDesc(e) {
    setDesc(e.target.value);
  }

  function inputCoinType(e) {
    setCoinType(e.target.value);
  }

  function save() {
    console.log("name = " + name);
    console.log("desc = " + desc);
    console.log("commissionPercentage = " + commissionPercentage);
    console.log("trader = " + trader);
    console.log("maxSupply = " + maxSupply);
    console.log("coinType = " + coinType);

    createPuddle(wallet, coinType, name, desc, commissionPercentage, trader, maxSupply);
  }

  function modify() {
    console.log("name = " + name);
    console.log("desc = " + desc);
    console.log("commissionPercentage = " + commissionPercentage);
    console.log("trader = " + trader);
    console.log("coinType = " + coinType);
    console.log("puddleObj = " + puddleObj);

    modifyPuddle(wallet, puddleObj, coinType, name, desc, commissionPercentage, trader);
  }

  return (
    <div className="puddle" style={PuddlStyle} >
      <div style={PuddleTableStyle}>
        <Popup trigger={<button className="btn">Create</button>}
          onOpen={() => [
            setMaxSupply(0),
            setTrader(""),
            setCommissionPercentage(0),
            setName(""),
            setDesc(""),
            setCoinType("0x2::sui::SUI")
          ]}
          modal
          nested
          data-theme='dark'
          position="right center">
          {close => (
            <div>
              <div style={{ textAlign: "left" }}>
                <a style={{ cursor: "pointer" }}>
                  <Icon as={CloseIcon} color={'white'} onClick={close} />
                </a>
              </div>
              <div style={{ overflow: 'overlay' }}>
                <h2 style={{ color: 'deepSkyBlue' }}>Create Puddle</h2>
                <Table style={FundTableStyle} >
                  <Tbody>
                    <Tr>
                      <Td>
                        <span>Puddle Name : </span>
                      </Td>
                      <Td style={{ padding: '2%' }}>
                        <span><input style={{ width: '100%' }} type="text" onChange={inputName} value={name} /></span>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <span>Puddle Description : </span>
                      </Td>
                      <Td style={{ padding: '2%' }}>
                        <span><textarea style={{ width: '100%', height: '80px' }} onChange={inputDesc} value={desc} /></span>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <span>Coin Type : </span>
                      </Td>
                      <Td style={{ padding: '2%' }}>
                        <select className="styled-select" style={{ width: '100%' }} onChange={inputCoinType} defaultValue={coinType}>
                          <option value="0x2::sui::SUI">SUI</option>
                          {/* <option value="0x2::sui::USDT" selected={coinType === "0x2::sui::USDT" ? true : false} >USDT</option> */}
                        </select>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <span>Max Supply : </span>
                      </Td>
                      <Td style={{ padding: '2%' }}>
                        <span><input style={{ width: '100%' }} type="number" onChange={inputMaxSupply} value={maxSupply} /></span>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <span>Commission Percentage : </span>
                      </Td>
                      <Td style={{ padding: '2%' }}>
                        <span><input style={{ width: '100%' }} type="number" onChange={inputCommissionPercentage} value={commissionPercentage} /></span>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <span>Trader : </span>
                      </Td>
                      <Td style={{ padding: '2%' }}>
                        <span><input style={{ width: '100%' }} type="text" onChange={inputTrader} value={trader} /></span>
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>

                <div>

                  <button className="btn" onClick={() => save()}>Save</button>
                  <button className="btn" style={{ marginLeft: '10px' }}
                    onClick={() =>
                      [
                        setMaxSupply(0),
                        setTrader(""),
                        setCommissionPercentage(0),
                        setName(""),
                        setDesc(""),
                        setCoinType("0x2::sui::SUI")
                      ]}
                  >Cancel</button>
                </div>
              </div>
            </div>
          )}
        </Popup>

        <h2 style={{ color: 'deepSkyBlue', display: 'inline-block', padding: '10px' }}>Your Puddles</h2>
        <Table variant='simple' align="center" style={{ width: "100%" }}>
          <Thead>
            <Tr>
              <Th style={{ ...ThStyle, width: "15%" }} >Name</Th>
              <Th style={{ ...ThStyle, width: "15%" }} >Description</Th>
              <Th style={{ ...ThStyle, width: "15%" }} >Max Supply</Th>
              <Th style={{ ...ThStyle, width: "15%" }} >Trader</Th>
              <Th style={{ ...ThStyle, width: "10%" }} >Commission Percentage</Th>
              <Th style={{ ...ThStyle, width: "15%" }} >Number Of Investors</Th>
              <Th style={{ ...ThStyle, width: "15%" }} >Investment Amount</Th>
            </Tr>
          </Thead>
          <Tbody>
            {
              yourPuddles?.map(puddle => {
                // console.log(puddle.puddle);
                return (
                  <Tr>
                    <Td style={{ ...TdStyle, wordBreak: 'break-all' }}>
                      <Popup trigger={
                        <div>
                          <a href="javascript:void(0)">{puddle?.puddle?.metadata?.name}</a>
                          <Tooltip label={`puddle id: ${puddle?.puddle?.id.id}`} bg={'gray'} >
                            <InfoOutlineIcon ml='5px' boxSize={12}></InfoOutlineIcon>
                          </Tooltip>
                        </div>
                      }
                        onOpen={() => [
                          setMaxSupply(Number(puddle?.puddle?.metadata?.max_supply) / Number(puddle?.puddle?.coin_decimals)),
                          setTrader(puddle?.puddle?.metadata?.trader),
                          setCommissionPercentage(Number(puddle?.puddle?.commission_percentage)),
                          setName(puddle?.puddle?.metadata?.name),
                          setDesc(puddle?.puddle?.metadata?.desc),
                          setCoinType(puddle?.puddle?.coin_type),
                          setPuddleObj(puddle),
                        ]}
                        modal
                        nested
                        data-theme='dark'
                        position="right center">
                        {close => (
                          <div>
                            <div style={{ textAlign: "left" }}>
                              <a style={{ cursor: "pointer" }}>
                                <Icon as={CloseIcon} color={'white'} onClick={close} />
                              </a>
                            </div>
                            <div style={{ overflow: 'overlay' }}>
                              <h2 style={{ color: 'deepSkyBlue' }}>Modify Puddle</h2>
                              <Table style={FundTableStyle}>
                                <Tbody>
                                  <Tr>
                                    <Td>
                                      <span>Puddle Name : </span>
                                    </Td>
                                    <Td style={{ padding: '2%' }}>
                                      <span><input style={{ width: '100%' }} type="text" onChange={inputName} value={name} /></span>
                                    </Td>
                                  </Tr>
                                  <Tr>
                                    <Td>
                                      <span>Puddle Description : </span>
                                    </Td>
                                    <Td style={{ padding: '2%' }}>
                                      <span><textarea style={{ width: '100%', height: '80px' }} onChange={inputDesc} value={desc} /></span>
                                    </Td>
                                  </Tr>
                                  <Tr>
                                    <Td>
                                      <span>Coin Type : </span>
                                    </Td>
                                    <Td style={{ padding: '2%' }}>
                                      <select className="styled-select" style={{ width: '100%' }} onChange={inputCoinType} disabled defaultValue={coinType}>
                                        <option value="0x2::sui::SUI" >SUI</option>
                                        <option value="0x2::sui::USDT" >USDT</option>
                                      </select>
                                    </Td>
                                  </Tr>
                                  <Tr>
                                    <Td>
                                      <span>Max Supply : </span>
                                    </Td>
                                    <Td style={{ padding: '2%' }}>
                                      <span><input style={{ width: '100%' }} type="number" onChange={inputMaxSupply} value={maxSupply} disabled /></span>
                                    </Td>
                                  </Tr>
                                  <Tr>
                                    <Td>
                                      <span>Commission Percentage : </span>
                                    </Td>
                                    <Td style={{ padding: '2%' }}>
                                      <span><input style={{ width: '100%' }} type="number" onChange={inputCommissionPercentage} value={commissionPercentage} /></span>
                                    </Td>
                                  </Tr>
                                  <Tr>
                                    <Td>
                                      <span>Trader : </span>
                                    </Td>
                                    <Td style={{ padding: '2%' }}>
                                      <span><input style={{ width: '100%' }} type="text" onChange={inputTrader} value={trader} /></span>
                                    </Td>
                                  </Tr>
                                </Tbody>
                              </Table>

                              <div>
                                <button className="btn" onClick={() => modify()}>Modify</button>
                                <button className="btn" onClick={close} style={{ marginLeft: '10px' }}>Close</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Popup>
                    </Td>
                    <Td className="fontverylong">{puddle?.puddle?.metadata?.desc}</Td>
                    <Td>{Number(puddle?.puddle?.metadata?.max_supply) / Number(puddle?.puddle?.coin_decimals) + " " + puddle?.puddle?.coin_name}</Td>
                    <Td>
                      <a target="_black" href={suiexplor.replace("{id}", puddle?.puddle?.metadata?.trader).replace("{type}", "address")}>{addressEllipsis(puddle?.puddle?.metadata?.trader)}</a>
                    </Td>
                    <Td>{puddle?.puddle?.commission_percentage + '%'}</Td>
                    <Td>{puddle?.puddle?.holder_info?.holders_count + ' People'}</Td>
                    <Td style={{ color: 'gold' }}>{isNaN(Number(puddle?.puddle?.balance) / Number(puddle?.puddle?.coin_decimals)) ? ''
                      : (Number(puddle?.puddle?.balance) / Number(puddle?.puddle?.coin_decimals)) + " " + puddle?.puddle?.coin_name}</Td>
                  </Tr>
                )
              })
            }
          </Tbody>
        </Table>
      </div>
    </div >
  );
}