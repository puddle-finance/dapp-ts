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

import { BiSearchAlt } from 'react-icons/bi';

import { useState, useEffect, useRef } from 'react';

import {
    salePuddleShares,
    getYourInvestItems,
    getPuddleStatistics,
    buyPuddleShares,
    creatMarket,
    getMarketStateKiosk,
    mergePuddleShares,
    withdrawKioskValue
} from "../resources/sui_api.js";

import axios from 'axios';
import { InfoOutlineIcon } from '@chakra-ui/icons'
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
} from '@chakra-ui/react';

import { CloseIcon } from '@chakra-ui/icons'

import Popup from 'reactjs-popup';
import '../resources/style.css';
import 'reactjs-popup/dist/index.css';

export default function MarketComponent() {
    const walletStyle = {
        textAlign: 'center'
    }

    const ThStyle = {
        fontWeight: '500',
        fontSize: '18px',
        color: 'Grey'
    }

    const WalletTableStyle = {
        backgroundColor: 'rgba(17,21,36,0.95)',
        //border: '1px solid darkgoldenrod',
        padding: '20px',
        borderRadius: '4px',
        width: '45vw',
        margin: '0px',
        display: 'inline-table',
    }

    const FundTableStyle = {
        backgroundColor: 'rgba(17,21,36,0.95)',
        //border: '1px solid darkgoldenrod',
        padding: '20px',
        borderRadius: '4px',
        width: '45vw',
        margin: '18px',
        display: 'inline-table',
    }

    const scrollbarStyle = {
        maxHeight: '348px',
        overflowY: 'auto'
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
    const [yourInvestItem, setYourInvestItem] = useState(new Array());
    const [puddleStatistics, setPuddleStatistics] = useState(new Object());
    const [payAmount, setPayAmount] = useState(0);
    const [saleAmounts, setSaleAmounts] = useState(0);
    const [selectedPuddleId, setSelectedPuddleId] = useState('');
    const [salePrice, setSalePrice] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [userKioskTable, setUserKioskTable] = useState(new Map());
    const [itemPriceTable, setItemPriceTable] = useState(new Map());

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
            getMarketStateKioskData();
            getYourInvsetFunds();
            getFundsData();
        }
    }, [wallet.connected]);

    function getFundsData() {
        getPuddleStatistics(wallet.account.address, true, false, false, 'market').then(resp => {
            setPuddleStatistics(resp);
        });
    }

    function getMarketStateKioskData() {
        getMarketStateKiosk()
            .then(resp => {
                setItemPriceTable(resp.item_price_table);
                setUserKioskTable(resp.user_kiosk_table);
            });
    }

    function getYourInvsetFunds() {
        getYourInvestItems(wallet.account.address).then(resp => {
            setYourInvestItem(resp);
        });
    }

    function handleSelectAction(e) {
        setSelectedPuddleId(e.target.value);
    }

    function handleSearchKeyword(e) {
        setSearchKeyword(e.target.value);
    }

    function saleShares(share) {
        let kioskId = userKioskTable.get(wallet.account.address).kioskId;
        let kioskCapId = userKioskTable.get(wallet.account.address).kioskCapId;
        let coin_type = share?.puddle?.coin_type;
        let coin_decimals = share?.puddle?.coin_decimals;
        let shares_id = share?.id;
        let puddle_id = share?.puddle?.id?.id;
        let shares = share?.shares;
        let price = salePrice;
        let can_merge = share?.can_merge;
        let merge_id_arr = share?.merge_id_arr;
        if (Number(saleAmounts) > Number(shares) / Number(coin_decimals)) {
            alert("Insufficient shares");
        } else {
            if (can_merge) {
                alert("Need to merge first");
            } else {
                let same = (Number(saleAmounts) * Number(coin_decimals)) == Number(shares) ? true : false;
                let real_amount = same ? Number(shares) : Number(saleAmounts) * Number(coin_decimals);
                let real_price = Number(price) * Number(coin_decimals);
                salePuddleShares(wallet, kioskId, kioskCapId, coin_type, puddle_id, shares_id, real_amount, real_price);
            }
        }
    }

    function createMarket() {
        creatMarket(wallet);
    }

    function buyShares(item, puddle, price, kioskId) {
        let coin_type = puddle?.coin_type;
        let puddle_id = puddle?.id?.id;
        let product_id = item?.id;
        let coin_decimals = puddle?.coin_decimals;
        console.log("price = " + price);
        console.log("coin_decimals = " + coin_decimals);
        buyPuddleShares(wallet, kioskId, coin_type, puddle_id, product_id, price, coin_decimals);
    }

    const resetInput = (share) => {

    }

    const changePayAmount = (e) => {
        setPayAmount(e.target.value);
    }

    function modifyInvestAmount(e) {

    }

    function mergePuddleSharesFn(share) {
        let coin_type = share.puddle.coin_type;
        let shares_id = share.id;
        let merge_id_arr = share.merge_id_arr;
        mergePuddleShares(wallet, coin_type, shares_id, merge_id_arr);
    }

    function withdrawKioskValue(){
        
    }

    return (
        <div className="wallet" style={walletStyle}>
            <div style={WalletTableStyle}>
                {/*左半邊的卡片 */}
                <h2 style={{ color: 'deepSkyBlue' }}>Sale Shares</h2>
                <Center>
                    {
                        userKioskTable.has(wallet.address) ?
                            <Card
                                border={'1px solid gray'}
                                borderRadius={'2px'}
                                bg={'black'}
                                width={'80%'}
                                mb={'20px'}
                                minW={'-webkit-fit-content'}
                            >
                                <CardBody>
                                    {/*Sale Form */}
                                    <Flex alignItems='center'>
                                        <Text fontSize={'20px'} mr={'30px'} ml={'20px'} color={'#b8d8e5'}>
                                            <b>Puddle: </b>
                                        </Text>
                                        <Select
                                            borderRadius={'2px'}
                                            size='lg'
                                            width={'180px'}
                                            height={'35px'}
                                            value={selectedPuddleId}
                                            icon={{ height: "0px", width: "0px" }}
                                            onChange={(e) => handleSelectAction(e)}
                                            placeholder="Select Puddle...">
                                            {yourInvestItem?.map(share => {
                                                return (<option value={share?.puddle?.id.id} key={share?.puddle?.id.id}>{share?.puddle?.metadata.name}</option>);
                                            }
                                            )}
                                        </Select>

                                    </Flex>
                                    <Flex ml={'20px'}>
                                        <Text color={'#b8d8e5'}>Total Shares: </Text>
                                        {yourInvestItem.length > 0 ? yourInvestItem.filter((share => {
                                            return share?.puddle?.id.id == selectedPuddleId
                                        })).map(share => {
                                            return (
                                                <div>
                                                    <Text color='gold' ml={'20px'}>
                                                        {share.shares / share.puddle.coin_decimals} {share.puddle.coin_name}
                                                        {share?.can_merge &&
                                                            <Button
                                                                style={{marginLeft: '1rem'}}
                                                                className="btn"
                                                                onClick={() => mergePuddleSharesFn(share)}
                                                            >Merge Share</Button>
                                                        }
                                                    </Text>
                                                </div>
                                            )
                                        }) : (<Text></Text>)
                                        }
                                    </Flex >

                                    <Flex alignItems='center'>
                                        <Text fontSize={'20px'} mr={'30px'} ml={'20px'} color={'#b8d8e5'}>
                                            <b>Amounts: </b>
                                        </Text>
                                        <NumberInput maxW='100px' mr='2rem' value={saleAmounts} onChange={(value) => setSaleAmounts(value)} defaultValue={0} min={0} >
                                            <NumberInputField size={'xs'} borderRadius={'2px'} />
                                            <NumberInputStepper height={"40%"} mr={'5px'}>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </Flex>

                                    <Flex ml={'20px'}>
                                        <Text color={'#b8d8e5'}>Remain Shares: </Text>
                                        {yourInvestItem.length > 0 ? yourInvestItem?.filter((share => {
                                            return share?.puddle?.id.id == selectedPuddleId
                                        })).map(share => {
                                            if (saleAmounts > share.shares / share.puddle.coin_decimals) {
                                                return (
                                                    <Alert status="warning" fontSize={'15px'}>
                                                        <AlertIcon color={'red'} mr={'5px'} width={'20px'} height={'20px'} />
                                                        Over Your Share Amounts!!
                                                    </Alert>)

                                            } else {
                                                return (<Text color={'gold'} ml={'20px'}>{share.shares / share.puddle.coin_decimals - saleAmounts} {share.puddle.coin_name}</Text>)
                                            }

                                        }) : <Text></Text>}
                                    </Flex >
                                    <Flex alignItems='center'>
                                        <Text fontSize={'20px'} mr={'30px'} ml={'20px'} color={'#b8d8e5'}>
                                            <b>Price: </b>
                                        </Text>
                                        <NumberInput maxW='100px' ml={'30px'} value={salePrice} onChange={(value) => setSalePrice(value)} defaultValue={0} min={0} >
                                            <NumberInputField size={'xs'} borderRadius={'2px'} />
                                            <NumberInputStepper height={"40%"} >
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>

                                        {yourInvestItem.length > 0 ? yourInvestItem.filter((share => {
                                            return share?.puddle?.id.id == selectedPuddleId
                                        })).map(share => {
                                            return (<Text color="gold" ml={'10px'}> {share.puddle.coin_name}</Text>)
                                        }) : (<Text color={'gold'} ml={'5px'}></Text>)
                                        }

                                    </Flex>


                                    <Center mt={'10px'} mb={'10px'}>
                                        <Flex>
                                            <Button
                                                className="btn"
                                                onClick={(e) => {
                                                    if (yourInvestItem.length > 0) {
                                                        let share = yourInvestItem.filter(sh => sh.puddle.id.id == selectedPuddleId)[0];
                                                        saleShares(share);
                                                    }
                                                }}
                                            >Confirm to Sale</Button>
                                            <Button className="btn" style={{ marginLeft: '10px' }}>Reset</Button>
                                        </Flex>
                                    </Center>
                                </CardBody>
                            </Card>
                            :
                            <Center mt={'10px'} mb={'10px'}>
                                <Flex>
                                    <Button
                                        className="btn"
                                        onClick={createMarket}
                                    >Create Market</Button>
                                </Flex>
                            </Center>
                    }
                </Center>
            </div>
            <div style={FundTableStyle}>
                <h2 style={{ color: 'deepSkyBlue' }}>Buy Shares</h2>
                <Input mb={15}
                    placeholder={'Puddle Name..'}
                    width={'360px'}
                    value={searchKeyword}
                    onChange={(e) => handleSearchKeyword(e)}
                />
                <Button mb={3}
                    leftIcon={<BiSearchAlt />}
                    className="btn" style={{ marginLeft: '10px' }}
                >Search</Button>
                <div style={scrollbarStyle}>
                    {/* <Box > */}
                    {
                        puddleStatistics?.in_progress_puddles?.filter(puddle => puddle.metadata.name.toLowerCase().includes(searchKeyword.toLowerCase())).map(puddle => {
                            return (
                                puddle.market_info.kiosk_item_array.map(item => {
                                    return (
                                        <Center>
                                            <Card
                                                border={'1px solid gray'}
                                                borderRadius={'2px'}
                                                bg={'black'}
                                                width={'80%'}
                                                mb={'15px'} >
                                                <CardBody>
                                                    <Center>
                                                        <Flex>
                                                            {/*puddle name */}
                                                            <Text mt={'15px'} fontSize='22px' as='b' color={item.owner == wallet.address ? 'red' : 'white'} >
                                                                {puddle.metadata.name}
                                                            </Text>
                                                            {/*puddle id*/}
                                                            <Tooltip
                                                                label={`puddle id: ${puddle.id.id}`}
                                                                bg={'gray'}
                                                            >
                                                                <InfoOutlineIcon ml='5px' mt='23px' boxSize={16}></InfoOutlineIcon>
                                                            </Tooltip>
                                                        </Flex>
                                                    </Center>
                                                    <Center>
                                                        <Flex >
                                                            <Text mt={'12px'} color={'#b8d8e5'}>Amount: </Text>
                                                            <Text mt={'12px'} ml={'20px'} color={'gold'}>{item.shares} shares</Text>
                                                        </Flex>
                                                    </Center>
                                                    <Center>
                                                        <Flex >
                                                            <Text mt={'0px'} color={'#b8d8e5'} >Price: </Text>
                                                            <Text mt={'0px'} mb={'10px'} ml={'20px'} color={'gold'}>{Number(itemPriceTable?.get(item.id)) / (10 ** 9)}</Text>
                                                            <Text mt={'0px'} mb={'10px'} ml={'10px'} color={'gold'}>{item.coin_name} </Text>
                                                        </Flex>
                                                    </Center>
                                                    <Center>
                                                        {
                                                            item.owner !== wallet.address &&
                                                            <Button
                                                                className="btn" marginBottom={'12px'} marginTop={'0px'}
                                                                onClick={(e) => {
                                                                    buyShares(
                                                                        item,
                                                                        puddle,
                                                                        Number(itemPriceTable?.get(item.id)) / (10 ** 9),
                                                                        item.kioskId);
                                                                }}
                                                            >Buy Shares</Button>
                                                        }
                                                    </Center>
                                                </CardBody>
                                            </Card>
                                        </Center>
                                    );
                                })
                            )
                        })
                    }
                    {/* </Box> */}
                </div>
            </div>
        </div>
    );
}