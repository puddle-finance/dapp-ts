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
  
  import {TransactionBlock} from "@mysten/sui.js";
  
  import { useState, useEffect, useRef } from 'react';
  
  import {
    getYourFundItems,
    getYourInvestItems,
    getPuddleStatistics,
  } from "../resources/sui_api.js";
  
  import axios from 'axios';
  import ItemComponent from './SalingItemComponent.jsx';
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
    NumberInput ,
    Tooltip,
    Select,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Button,
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
        fontSize: '24px',
        color: 'darkorchid',
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
        getYourInvsetFunds();
        getFundsData();
    }
    }, [wallet.connected]);

    function getFundsData() {
    getPuddleStatistics(axios, apiurl, wallet.account.address).then(resp => {
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

    function modifyInvestAmount(e) {

    }
    
    return (
        <Box w={'100%'} h={'100%'} mt={'100px'}>
            <Center w= {'100%'}>
            <Container maxW={'1200px'} w={'100%'}>
                
                <Flex
                    px={'10px'} //padding-left, padding-right
                    bg={{base: '#FFF', md: '#FFF'}}
                    h={'120px'}
                    borderRadius={'20px'}
                    boxShadow={'lg'}
                    >
                         <SimpleGrid
                            rows = {2}
                            columns={2}
                            spacing={50}
                            mt={'40px'}
                            w = {'100%'}
                        >
                            {/*左上半邊的卡片 */}
                            <Box 
                                borderRadius={'20px'}
                                borderWidth={'0.5px'} 
                                borderColor={'gold'} 
                                borderStyle={'solid'}
                                >
                                    <Center>
                                        <Text 
                                            fontSize={'30px'}
                                            style={{ ...ThStyle}}>
                                                Sale Shares
                                        </Text>
                                    </Center>
                                    <Center>
                                        <Card 
                                            borderRadius={'20px'}
                                            bg={'#7D7DFF'}
                                            width={'90%'}
                                            >
                                            <CardBody>
                                                {/*Sale Form */}
                                                <Flex alignItems='center'>
                                                    <Text fontSize={'20px'} mr={'30px'} ml={'20px'} color={'#b8d8e5'}>
                                                        <b>Puddle: </b> 
                                                    </Text>
                                                    <Select borderRadius={'20px'} bg='#919fc6' color='white' size='lg' width={'150px'} height={'35px'} >
                                                        <option value='paul' >Paul's Puddle</option>
                                                        <option value='ryan'>Ryan's Puddle</option>
                                                        <option value='andrew'>Andrew'S Puddle</option>
                                                    </Select>
                                                </Flex>
                                                <Flex ml={'20px'}>  
                                                    <Text color={'#eeb8c6'}>Total Shares: N/A</Text>    
                                                </Flex >
                                                
                                                <Flex alignItems='center'>
                                                    <Text fontSize={'20px'}  mr={'30px'} ml={'20px'} color={'#b8d8e5'}>
                                                        <b>Amounts: </b> 
                                                </Text>
                                                    <NumberInput maxW='100px' mr='2rem' value={saleAmounts} onChange={(val)=> setSaleAmounts(val)} >
                                                        <NumberInputField bg={'#919fc6'}  size={'xs'}  borderRadius={'20px'} />
                                                            <NumberInputStepper height={"40%"} mr={'5px'}>
                                                                <NumberIncrementStepper/>
                                                                <NumberDecrementStepper />
                                                            </NumberInputStepper>
                                                    </NumberInput>                                             
                                                </Flex>
                                               
                                                <Flex ml={'20px'}>  
                                                    <Text color={'#eeb8c6'}>Remain Shares: N/A</Text>    
                                                </Flex >

                                            
                                                <Center mt={'10px'} mb={'10px'}>
                                                    <Flex>  
                                                        <Button width={'150px'} height={'50px'} color={'black'} bg='#b8d8e5' variant='solid' borderRadius={'20px'} size={'lg'} mr={'40px'} >Confirm to Sale</Button>
                                                        <Button width={'150px'} height={'50px'} color={'black'} bg='#fac7d3' variant='solid' borderRadius={'20px'}  size={'lg'} ml={'40px'}>Reset</Button>
                                                    </Flex>
                                                </Center>
                                            </CardBody>
                                        </Card>
                                </Center>
                            </Box>
                            {/*右上半邊的卡片 */}
                            <Box 
                                borderRadius={'20px'}
                                borderWidth={'0.5px'} 
                                borderColor={'gold'} 
                                borderStyle={'solid'}
                                overflow={'scroll'}
                                >
                                    <Center mt={'10px'}>
                                        <ItemComponent />
                                    </Center>
                                    <Center mt={'10px'}>
                                        <ItemComponent />
                                    </Center>
                            </Box>
                            {/*左下半邊的卡片 */}
                            <Box></Box>
                            {/*右下半邊的卡片 */}
                            <Box></Box>

                        </SimpleGrid>
                    
                </Flex>
                
            </Container>
            </Center>
        </Box>
    );
}