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

import { useState, useEffect, useRef } from 'react';;
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
    Spacer
} from '@chakra-ui/react';



import '../resources/style.css';
import 'reactjs-popup/dist/index.css';

export const data = [
    ["Type", "Amount", "Cost", "Value"],
    ["CETUS", 6000, 1000, 4000],
    ["USDT", 30000, 2000, 3000],
    ["TURBOS", 2000, 3000, 1000],
    ["SUI", 4000, 2000, 8000]
];

// const data = [
//     {
//       fromUnit: "inches",
//       toUnit: "millimetres (mm)",
//       factor: 25.4
//     },
//     {
//       fromUnit: "feet",
//       toUnit: "centimetres (cm)",
//       factor: 30.48
//     },
//     {
//       fromUnit: "yards",
//       toUnit: "metres (m)",
//       factor: 0.91444
//     }
//   ]

//   const columnHelper = createColumnHelper()

//   const columns = [
//     columnHelper.accessor("fromUnit", {
//       cell: info => info.getValue(),
//       header: "To convert"
//     }),
//     columnHelper.accessor("toUnit", {
//       cell: info => info.getValue(),
//       header: "Into"
//     }),
//     columnHelper.accessor("factor", {
//       cell: info => info.getValue(),
//       header: "Multiply by",
//       meta: {
//         isNumeric: true
//       }
//     })
//   ]

export const options = {
    title: "Dashboard",
    is3D: false,
    backgroundColor: "transparent"
};

export default function WalletComponent() {

    const PuddlStyle = {
        textAlign: 'center'
    }

    const PuddleTableStyle = {
        backgroundColor: '#111524',
        border: '1px solid darkgoldenrod',
        padding: '20px',
        borderRadius: '18px',
        width: '80vw',
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

    function getYourPuddlesData() {
        getYourFundItems(axios, apiurl, wallet.account.address).then(resp => {
            setYourPuddles(resp);
        });
    }

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
        <Box w={'100%'} h={'100%'} mt={'auto'}>
            <Center w={'100%'}>
                <Container maxW={'1100px'} w={'100%'}>
                    <Flex
                        px={'10px'} //padding-left, padding-right
                        bg={{ base: '#FFF', md: '#FFF' }}
                        h={'100px'}
                        borderRadius={'2px'}
                        boxShadow={'lg'}
                    >
                        <Grid maxW={'1200px'} w={'100%'} templateColumns='repeat(2, 1fr)'>
                            {/*左上半邊的卡片 */}
                            <GridItem
                                borderRadius={'2px'}
                                borderWidth={'0.5px'}
                                borderColor={'gold'}
                                borderStyle={'solid'}
                            >
                                <Center>
                                    <Text
                                        fontSize={'30px'}
                                        style={{ ...ThStyle }}>
                                        Select Puddle
                                    </Text>
                                </Center>
                                <Center>
                                    <Card>
                                        <CardBody>
                                            {/*Sale Form */}
                                            <Flex>
                                                <Select
                                                    borderRadius={'2px'}
                                                    bg='#919fc6'
                                                    color='white'
                                                    size='lg'
                                                    width={'150px'}
                                                    height={'40px'}
                                                    value={'selectedPuddleId'}
                                                    onChange={(e) => handleSelectAction(e)}
                                                    placeholder="Select Puddle...">
                                                </Select>

                                            </Flex>
                                        </CardBody>
                                    </Card>
                                </Center>
                            </GridItem >
                            {/*右上半邊的卡片 */}
                            <GridItem
                                borderRadius={'2px'}
                                borderWidth={'0.5px'}
                                borderColor={'gold'}
                                borderStyle={'solid'}
                            >
                                <Center>
                                    <Text
                                        fontSize={'30px'}
                                        style={{ ...ThStyle }}>
                                        Transaction
                                    </Text>
                                </Center>
                                <Center>
                                    <Card>
                                        <CardBody>
                                            {/*Sale Form */}
                                            <Center mt={'10px'} mb={'10px'}>
                                                <div style={FundTableStyle}>
                                                    <h1 style={{ color: 'gold' }}>Puddles</h1>
                                                    <Flex>
                                                        <Button
                                                            width={'150px'}
                                                            height={'50px'}
                                                            color={'black'}
                                                            bg='#b8d8e5'
                                                            variant='solid'
                                                            borderRadius={'2px'}
                                                            size={'lg'}
                                                            mr={'40px'}
                                                        >Reset</Button>
                                                        <Button
                                                            width={'150px'}
                                                            height={'50px'}
                                                            color={'black'}
                                                            bg='#fac7d3'
                                                            variant='solid'
                                                            borderRadius={'2px'}
                                                            size={'lg'}
                                                            ml={'40px'}
                                                        >Submit</Button>
                                                    </Flex>
                                                </div>

                                            </Center>
                                        </CardBody>
                                    </Card>
                                </Center>
                            </GridItem >
                            {/*左下半邊的卡片 */}
                            <GridItem
                                borderRadius={'2px'}
                                borderWidth={'0.5px'}
                                borderColor={'gold'}
                                borderStyle={'solid'}>
                                <Chart
                                    chartType="PieChart"
                                    data={data}
                                    options={options}
                                    width={"100%"}
                                    height={"400px"}
                                />
                            </GridItem>
                            {/*右下半邊的卡片 */}
                            <GridItem
                                borderRadius={'2px'}
                                borderWidth={'0.5px'}
                                borderColor={'gold'}
                                borderStyle={'solid'}>
                                <TableContainer>
                                    <Chart
                                        chartType="Table"
                                        width="100%"
                                        height="400px"
                                        data={data}
                                        options={options}
                                    />
                                </TableContainer>
                            </GridItem>
                        </Grid>
                    </Flex>
                </Container>
            </Center>
        </Box>

    );
}