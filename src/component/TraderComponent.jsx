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
    GridItem,
    Grid
} from '@chakra-ui/react'

import { useState, useEffect, useRef, useCallback } from 'react';
import { Chart } from "react-google-charts";

import {
    getYourFundItems,
    createPuddle,
    modifyPuddle,
    cetusInvest,
    getCoinMetadata,
    cetusArbitrage
} from "../resources/sui_api.js";

import { getCetusCoinTypeSelectArray, getPreSwap, getPoolDetail } from "../resources/cetus_api.js";

// import { createColumnHelper } from "@tanstack/react-table"
// import DataTableComponent from './DataTableComponent';

import axios from 'axios';

import {
    Box,
    Container,
    Flex,
    Center,
    SimpleGrid,
    Card,
    CardBody,
    Text,
    NumberInput,
    Tooltip,
    Select,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Button,
    Alert,
    AlertIcon,
    Input,
    Spacer,
    Square,
    VStack,
    Stack
} from '@chakra-ui/react';

import '../resources/style.css';
import { CoinMetadataStruct, SUI_DECIMALS } from "@mysten/sui.js";

export default function WalletComponent() {
    const walletStyle = {
        textAlign: 'center'
    }

    const DashboardTableStyle = {
        backgroundColor: 'rgba(17,21,36,0.95)',
        //border: '1px solid darkgoldenrod',
        padding: '5px',
        borderRadius: '4px',
        width: '79.5vw',
        display: 'inline-table',
    }

    const puddleSelectTableStyle = {
        backgroundColor: 'rgba(17,21,36,0.95)',
        //border: '1px solid darkgoldenrod',
        padding: '5px',
        borderRadius: '4px',
        width: '10vw',
        hight: '5vw',
        margin: '10px',
        display: 'inline-table',
    }

    const puddleSettingTableStyle = {
        backgroundColor: 'rgba(17,21,36,0.95)',
        //border: '1px solid darkgoldenrod',
        padding: '5px',
        borderRadius: '4px',
        width: '65vw',
        hight: '5vw',
        margin: '10px',
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

    const pieChartOptions = {
        backgroundColor: "transparent",
        width: "30vw",
        hight: "50vw",
        fontSize: "16",
        is3D: true,
        legend: { position: 'right', textStyle: { color: 'white', fontSize: 16 } },
        pieHole: '0.4',
        chartArea: { width: '70%', height: '100%' }
    };

    const tableChartOptions = {
        is3D: true,
        backgroundColor: "transparent",
        width: "45vw",
        hight: "50vw",
        pageSize: 8,
        cssClassNames: {
            headerRow: 'headerRowClass',
            tableRow: 'tableRowClass',
            oddTableRow: 'oddTableRowClass',
            selectedTableRow: 'selectedTableRowClass',
            hoverTableRow: 'hoverTableRowClass',
            headerCell: 'headerCellClass',
            tableCell: 'tableCellClass'
        },
        chartArea: { width: '100%', height: '90%' }
    };

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
    const [selectedPuddleId, setSelectedPuddleId] = useState('');
    const [puddleMap, setPuddleMap] = useState(new Map());

    const [maxSupply, setMaxSupply] = useState(0);
    const [trader, setTrader] = useState("");
    const [commissionPercentage, setCommissionPercentage] = useState("");
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [coinType, setCoinType] = useState("");

    const [cetusPoolAddress, setCetusPoolAddress] = useState("");
    const [cetusCoinTypeSelect, setCetusCoinTypeSelect] = useState();
    const [cetusCoinBalanceMap, setCetusCoinBalanceMap] = useState(new Map());
    const [cetusAction, setCetusAction] = useState("Buy");

    const [amount, setAmount] = useState();
    const [preSwapAmount, setPreSwapAmount] = useState();

    const [investMap, setInvestMap] = useState();
    const [investData, setInvestData] = useState([]);

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
            getCetusCoinTypeSelect();
        }
    }, [wallet.connected]);

    const getYourPuddlesData = useCallback(() => {
        getYourFundItems(wallet.account.address).then(resp => {
            let puddle_map = new Map();
            let investMap = new Map();
            for (let puddle of resp) {
                let investArray = [];
                investMap.set(puddle.puddle.id.id, investArray);
                puddle_map.set(puddle.puddle.id.id, puddle);
                let title = ["Type", "Amount", "Cost (SUI)", "Pool Total Supply"];
                investArray.push(title);
                let investsArray = puddle.puddle.investments.invests;
                for (let investObj of investsArray) {
                    getPoolDetail(investObj.investsAddress).then(poolDetail => {
                        getCoinMetadata(poolDetail.coinTypeA).then(CoinMetadata => {
                            let investDetailArray = new Array();
                            let symbol = CoinMetadata.symbol;
                            let deciamls = CoinMetadata.decimals;
                            let total_supply = Number(poolDetail.coinAmountA) / (10 ** deciamls);
                            let cost_sui = Number(investObj.cost_sui) / (10 ** SUI_DECIMALS);
                            let balance_amount = Number(investObj.balance_amount) / (10 ** deciamls);
                            console.log("cost_sui = " + cost_sui);
                            console.log("balance_amount = " + balance_amount);
                            investDetailArray.push(symbol, balance_amount, cost_sui, total_supply);
                            investArray.push(investDetailArray);
                        });
                    });
                }
            }
            setYourPuddles(resp);
            setPuddleMap(puddle_map);
            setInvestMap(investMap);
        });
    });

    function changeInvestData(puddleId) {
        if (puddleId === "") {
            setInvestData([]);
        } else {
            setInvestData(investMap.get(puddleId));
        }
    }

    const getCetusCoinTypeSelect = useCallback(() => {
        getCetusCoinTypeSelectArray().then(resp => {
            setCetusCoinTypeSelect(resp);
            let coinBalanceMap = new Map();
            for (let obj of resp) {
                coinBalanceMap.set(obj.cetusPoolAddress, obj);
            }
            setCetusCoinBalanceMap(coinBalanceMap);
        });
    });

    function handleSelectAction(e) {
        setSelectedPuddleId(e.target.value);
        changeInvestData(e.target.value);
    }

    function handleSelectCoinTypeAction(e) {
        setCetusPoolAddress(e.target.value);
        getPreSwapAmount(e.target.value, amount);
    }

    function handleAmountAction(e) {
        console.log("e.target.value = " + e.target.value);
        setAmount(e.target.value);
        getPreSwapAmount(cetusPoolAddress, e.target.value);
    }

    function handleCetusAction(e) {
        setCetusAction(e.target.value);
        getPreSwapAmount(cetusPoolAddress, amount);
    }

    function getPreSwapAmount(cetusPoolAddress, amount) {
        console.log("amount = " + amount);
        if (amount && amount !== '' && amount != 0 && cetusPoolAddress && cetusPoolAddress !== '') {
            let isBuy = cetusAction === "Buy" ? true : false;
            getPreSwap(cetusPoolAddress, isBuy, amount).then(preSwapAmount => {
                console.log("preSwapAmount = " + preSwapAmount);
                setPreSwapAmount("PreSwap Amount : " + preSwapAmount);
            }).catch((e) => {
                console.log("e = " + e);
                setPreSwapAmount("Number too large")
            });
        } else {
            setPreSwapAmount("PreSwap Amount : " + 0);
        }
    }

    function submitTransactionSetting() {
        if (cetusAction === "Buy") {
            getPoolDetail(cetusPoolAddress).then(poolDetail => {
                let puddleCapId = puddleMap.get(selectedPuddleId).puddleCapId;
                let puddleId = puddleMap.get(selectedPuddleId).puddle.id.id;
                let realAmount = amount * (10 ** 9);
                console.log("puddleCapId = " + puddleCapId);
                console.log("puddleId = " + puddleId);
                console.log("poolDetail = " + JSON.stringify(poolDetail));
                console.log("realAmount = " + realAmount);
                cetusInvest(wallet, puddleCapId, puddleId, poolDetail, realAmount);
            })
        } else {
            getPoolDetail(cetusPoolAddress).then(poolDetail => {
                getCoinMetadata(poolDetail.coinTypeA).then(CoinMetadata => {
                    let puddleCapId = puddleMap.get(selectedPuddleId).puddleCapId;
                    let puddleId = puddleMap.get(selectedPuddleId).puddle.id.id;
                    let realAmount = amount * (10 ** CoinMetadata.decimals);
                    console.log("puddleCapId = " + puddleCapId);
                    console.log("puddleId = " + puddleId);
                    console.log("poolDetail = " + JSON.stringify(poolDetail));
                    console.log("realAmount = " + realAmount);
                    cetusArbitrage(wallet, puddleCapId, puddleId, poolDetail, realAmount);
                });
            })
        }
    }

    return (
        <div className="wallet" style={walletStyle}>
            <Center>
                <Flex>
                    <div style={puddleSelectTableStyle}>
                        <Box>
                            <h2 style={{ marginTop: '20px', color: 'deepSkyBlue' }}>Select Puddle</h2>
                            <Select
                                borderRadius={'2px'}
                                color='white'
                                size='md'
                                width={'150px'}
                                height={'35px'}
                                icon={{ height: "0px", width: "0px" }}
                                value={selectedPuddleId}
                                onChange={(e) => handleSelectAction(e)}
                                margin={'20px'}
                                placeholder="Select Puddle...">
                                {yourPuddles?.map(puddle => {
                                    return (
                                        <option value={puddle?.puddle?.id.id}>
                                            {puddle?.puddle?.metadata?.name}
                                        </option>
                                    )
                                })}
                            </Select>
                            {
                                selectedPuddleId != '' &&
                                <Text color={'gold'} mt={5}>
                                    Puddle Balance : {Number(puddleMap.get(selectedPuddleId).puddle.balance) / (10 ** 9)} SUI
                                </Text>
                            }
                        </Box>

                    </div>

                    <div style={puddleSettingTableStyle}>
                        <h2 style={{ color: 'deepSkyBlue' }}>Transaction Setting</h2>
                        <Center>
                            <Flex>
                                <Select
                                    borderRadius={'2px'}
                                    // bg='#919fc6'
                                    color='white'
                                    width={'100px'}
                                    height={'35px'}
                                    icon={{ height: "0px", width: "0px" }}
                                    value={cetusAction}
                                    onChange={(e) => handleCetusAction(e)}>
                                    {/* placeholder="Select Action..."> */}
                                    <option value="Buy">
                                        Buy
                                    </option>
                                    <option value="Sell">
                                        Sell
                                    </option>
                                </Select>
                                <Select
                                    borderRadius={'2px'}
                                    color='white'
                                    size='lg'
                                    width={'200px'}
                                    height={'35px'}
                                    value={cetusPoolAddress}
                                    icon={{ height: "0px", width: "0px" }}
                                    onChange={(e) => handleSelectCoinTypeAction(e)}
                                    placeholder="Select Cion Type...">
                                    {cetusCoinTypeSelect?.map(obj => {
                                        return (
                                            <option value={obj.cetusPoolAddress}>
                                                {obj.symbol}
                                            </option>
                                        )
                                    })}

                                </Select>
                                <NumberInput width={'350px'} height={'40px'} borderRadius={'2px'} defaultValue={0} min={0} >
                                    <NumberInputField borderRadius={'2px'} onInput={handleAmountAction} value={amount} />
                                    <NumberInputStepper height={"40%"} mr={'5px'}>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>

                                <Flex>
                                    <Button
                                        className="btn"
                                        style={{ marginBottom: '10px', marginLeft: '10px' }}
                                        onClick={submitTransactionSetting}
                                    >Submit</Button>
                                </Flex>
                            </Flex>
                        </Center>
                        <Center>
                            {
                                cetusPoolAddress !== "" && cetusAction === "Buy"
                                &&
                                <Text>
                                    Pool Total Supply ( {cetusCoinBalanceMap?.get(cetusPoolAddress)?.symbol} ) : {cetusCoinBalanceMap?.get(cetusPoolAddress)?.otherCoinBalance}
                                </Text>
                            }
                            {
                                cetusPoolAddress !== "" && cetusAction === "Sell"
                                &&
                                <Text>
                                    Pool Total Supply ( SUI ) : {cetusCoinBalanceMap?.get(cetusPoolAddress)?.suiCoinBalance}
                                </Text>
                            }

                            <Text marginLeft={"70px"} color={preSwapAmount === "Number too large" ? 'red' : 'gold'}>
                                {preSwapAmount}
                            </Text>
                        </Center>
                    </div>
                </Flex>
            </Center>
            <div style={DashboardTableStyle}>
                <h2 style={{ color: 'deepSkyBlue' }}>Dashboard</h2>
                {
                    investData.length == 0 &&
                    <Text>No Data</Text>
                }
                {
                    investData.length > 0 &&
                    <Flex>
                        <Box marginBottom={'20px'}>
                            <Chart
                                chartType="PieChart"
                                data={investData}
                                options={pieChartOptions}
                            />
                        </Box>
                        <Box marginBottom={'20px'}>
                            <Chart
                                chartType="Table"
                                data={investData}
                                options={tableChartOptions}
                            />
                        </Box>
                    </Flex>
                }
            </div>
        </div>
    );
}