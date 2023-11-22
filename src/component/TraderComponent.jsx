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

import { useState, useEffect, useRef, useCallback } from 'react';;
import { Chart } from "react-google-charts";

import {
    getYourFundItems,
    createPuddle,
    modifyPuddle,
} from "../resources/sui_api.js";

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
import 'reactjs-popup/dist/index.css';

export const data = [
    ["Type", "Amount", "Cost", "Value"],
    ["CETUS", 6000, 1000, 4000],
    ["USDT", 30000, 2000, 3000],
    ["TURBOS", 2000, 3000, 1000],
    ["SUI", 4000, 2000, 8000],
    ["aaa", 4000, 2000, 8000],
    ["bbb", 4000, 2000, 8000],
    ["ccc", 4000, 2000, 8000],
    ["ddd", 4000, 2000, 8000],
    ["eee", 4000, 2000, 8000],
    ["fff", 4000, 2000, 8000],
    ["ggg", 4000, 2000, 8000]
];

export default function WalletComponent() {
    const walletStyle = {
        textAlign: 'center'
    }

    const DashboardTableStyle = {
        backgroundColor: '#111524',
        border: '1px solid darkgoldenrod',
        padding: '5px',
        borderRadius: '18px',
        width: '80vw',
        display: 'inline-table',
    }

    const puddleSettingTableStyle = {
        backgroundColor: '#111524',
        border: '1px solid darkgoldenrod',
        padding: '5px',
        borderRadius: '18px',
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
        getYourFundItems(axios, apiurl, wallet.account.address).then(resp => {
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
        <div className="wallet" style={walletStyle}>
            <Center>
                <Flex>
                    <Box>
                        <Text
                            style={{ ...ThStyle }}>
                            Select Puddle
                        </Text>
                        <Select
                            borderRadius={'2px'}
                            bg='#919fc6'
                            color='white'
                            size='md'
                            width={'150px'}
                            height={'40px'}
                            value={'selectedPuddleId'}
                            onChange={(e) => handleSelectAction(e)}
                            margin={'35px'}
                            placeholder="Select Puddle...">
                        </Select>
                    </Box>


                    <div style={puddleSettingTableStyle}>
                        <h1 style={{ color: 'gold' }}>Transaction Setting</h1>
                        <VStack>
                            <Select
                                borderRadius={'2px'}
                                bg='#919fc6'
                                color='white'
                                size='lg'
                                width={'150px'}
                                height={'40px'}
                                value={'selectedPuddleId'}
                                onChange={(e) => handleSelectAction(e)}
                                placeholder="Select Cion Type..." />
                            <NumberInput width={'400px'} margin={'5px'}>
                                <NumberInputField bg={'#919fc6'} size={'xs'} borderRadius={'2px'} />
                                <NumberInputStepper height={"40%"} mr={'5px'}>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                            <Flex margin={'10px'}>
                                <Button
                                    className="btn"
                                    onClick={(e) => {
                                        if (yourInvestItem.length > 0) {
                                            let share = yourInvestItem.filter(sh => sh.puddle.id.id == selectedPuddleId)[0];
                                            saleShares(share);
                                        }
                                    }}
                                >Reset</Button>
                                <Button className="btn" style={{ marginLeft: '10px' }}>Submit</Button>
                            </Flex>
                        </VStack>
                    </div>
                </Flex>
            </Center>
            <div style={DashboardTableStyle}>
                <h1 style={{ color: 'gold' }}>Dashboard</h1>
                <Flex>
                    <Box marginBottom={'20px'}>
                        <Chart
                            chartType="PieChart"
                            data={data}
                            options={pieChartOptions}
                        />
                    </Box>
                    <Box marginBottom={'20px'}>
                        <Chart
                            chartType="Table"
                            data={data}
                            options={tableChartOptions}
                        />
                    </Box>
                </Flex>
            </div>
        </div>
    );
}