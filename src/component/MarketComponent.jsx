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
  
  import {BiSearchAlt} from 'react-icons/bi';
  import {TransactionBlock} from "@mysten/sui.js";
  
  import { useState, useEffect, useRef } from 'react';
  
  import {
    salePuddleShares,
    getYourInvestItems,
    getPuddleStatistics,
    buyPuddleShares,
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
    const SUI_MAINNET_API_URL ="https://fullnode.mainnet.sui.io";
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
    const [saleAmounts, setSaleAmounts] = useState(0);
    const [selectedPuddleId, setSelectedPuddleId] = useState('');
    const [salePrice, setSalePrice] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState('');

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

    function handleSelectAction(e){
        setSelectedPuddleId(e.target.value);
    }

    function handleSearchKeyword(e){
        setSearchKeyword(e.target.value);
    }

    function saleShares(share) {
        let coin_type = share?.puddle?.coin_type;
        let coin_decimals = share?.puddle?.coin_decimals;
        let shares_id = share?.id;
        let puddle_id = share?.puddle?.id?.id;
        let shares = share?.shares;
        let price = salePrice;
        if (Number(saleAmounts) > Number(shares) / Number(coin_decimals)) {
          alert("Insufficient shares");
        } else {
          let same = (Number(saleAmounts) * Number(coin_decimals)) == Number(shares) ? true : false;
          let real_amount = same ? Number(shares) : Number(shares) - (Number(saleAmounts) * Number(coin_decimals));
          let real_price = Number(price) * Number(coin_decimals);
          salePuddleShares(wallet, coin_type, puddle_id, shares_id, real_amount, same, real_price);
        }
      }

    function buyShares(item, puddle){
        let coin_type = puddle?.coin_type;
        let puddle_id = puddle?.id?.id;
        let product_id = item?.id?.id;
        let coin_decimals = puddle?.coin_decimals;
        let price = item?.price;
        buyPuddleShares(wallet, coin_type, puddle_id, product_id, price, coin_decimals);
    }

    const resetInput = (share)=>{
        
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
                                            mb={'20px'}
                                            >
                                            <CardBody>
                                                {/*Sale Form */}
                                                <Flex alignItems='center'>
                                                    <Text fontSize={'20px'} mr={'30px'} ml={'20px'} color={'#b8d8e5'}>
                                                        <b>Puddle: </b> 
                                                    </Text>
                                                    <Select 
                                                        borderRadius={'20px'} 
                                                        bg='#919fc6' 
                                                        color='white' 
                                                        size='lg' 
                                                        width={'150px'} 
                                                        height={'35px'} 
                                                        value={selectedPuddleId}
                                                        onChange={(e)=> handleSelectAction(e)}
                                                        placeholder="Select Puddle...">
                                                        {yourInvestItem?.map(share => {
                                                            return (<option value={share?.puddle?.id.id} key={share?.puddle?.id.id}>{share?.puddle?.metadata.name}</option>);}
                                                        )}
                                                    </Select>
                                                           
                                                </Flex>
                                                <Flex ml={'20px'}>  
                                                    <Text color={'#eeb8c6'}>Total Shares: </Text>    
                                                    {yourInvestItem.length > 0 ? yourInvestItem.filter((share=>{
                                                        return share?.puddle?.id.id == selectedPuddleId
                                                    })).map(share=>{
                                                        return (<Text fontColor="#eeb8c6"  ml={'20px'}>{share.shares / share.puddle.coin_decimals} {share.puddle.coin_name}</Text>)
                                                    }):(<Text color={'#eeb8c6'} ml={'20px'}>N/A</Text>)
                                                    }
                                                </Flex >
                                                
                                                <Flex alignItems='center'>
                                                    <Text fontSize={'20px'}  mr={'30px'} ml={'20px'} color={'#b8d8e5'}>
                                                        <b>Amounts: </b> 
                                                </Text>
                                                    <NumberInput maxW='100px' mr='2rem' value={saleAmounts} onChange={(value)=> setSaleAmounts(value)} >
                                                        <NumberInputField bg={'#919fc6'}  size={'xs'}  borderRadius={'20px'} />
                                                            <NumberInputStepper height={"40%"} mr={'5px'}>
                                                                <NumberIncrementStepper/>
                                                                <NumberDecrementStepper />
                                                            </NumberInputStepper>
                                                    </NumberInput>                                             
                                                </Flex>
                                               
                                                <Flex ml={'20px'}>  
                                                    <Text color={'#eeb8c6'}>Remain Shares: </Text>    
                                                    {yourInvestItem.length > 0?yourInvestItem?.filter((share=>{
                                                        return share?.puddle?.id.id == selectedPuddleId
                                                    })).map(share =>{
                                                        if (saleAmounts > share.shares / share.puddle.coin_decimals ){
                                                            return(
                                                            <Alert status="warning" fontSize={'15px'}>
                                                                <AlertIcon  color={'yellow'} mr={'5px'} width={'20px'} height={'20px'}/>
                                                                Over Your Share Amounts!!
                                                            </Alert>)
                                                            
                                                        }else{
                                                            return (<Text color={'#eeb8c6'} ml={'20px'}>{share.shares / share.puddle.coin_decimals - saleAmounts} {share.puddle.coin_name}</Text>)
                                                        }
                                                        
                                                    }): <Text color={'#eeb8c6'} ml={'20px'}>N/A</Text>}
                                                </Flex >
                                                <Flex alignItems='center'>
                                                    <Text fontSize={'20px'}  mr={'30px'} ml={'20px'} color={'#b8d8e5'}>
                                                        <b>Price: </b> 
                                                </Text>
                                                    <NumberInput maxW='100px'  ml ={'30px'} value={salePrice} onChange={(value)=> setSalePrice(value)} >
                                                        <NumberInputField bg={'#919fc6'}  size={'xs'}  borderRadius={'20px'} />
                                                            <NumberInputStepper height={"40%"} >
                                                                <NumberIncrementStepper/>
                                                                <NumberDecrementStepper />
                                                            </NumberInputStepper>
                                                    </NumberInput>
                                                    
                                                        {yourInvestItem.length > 0 ? yourInvestItem.filter((share=>{
                                                            return share?.puddle?.id.id == selectedPuddleId
                                                        })).map(share=>{
                                                            return (<Text fontColor="#eeb8c6"  ml={'10px'}> {share.puddle.coin_name}</Text>)
                                                        }):(<Text color={'#eeb8c6'} ml={'5px'}></Text>)
                                                        }    
                                                                                                
                                                </Flex>

                                            
                                                <Center mt={'10px'} mb={'10px'}>
                                                    <Flex>  
                                                        <Button 
                                                            width={'150px'} 
                                                            height={'50px'} 
                                                            color={'black'} 
                                                            bg='#b8d8e5' 
                                                            variant='solid' 
                                                            borderRadius={'20px'}
                                                            size={'lg'} 
                                                            mr={'40px'} 
                                                            onClick={(e)=>{
                                                                if (yourInvestItem.length > 0 ){
                                                                    let share = yourInvestItem.filter(sh=>sh.puddle.id.id == selectedPuddleId)[0];
                                                                    saleShares(share);
                                                                }
                                                            }}
                                                            >Confirm to Sale</Button>
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
                                    <Center mt={'10px'} mb={'15px'}>
                                        <Input
                                            placeholder={'Puddle Name..'}
                                            width={'400px'}
                                            bg={'#dfdcd5'}
                                            color={'black'}
                                            value={searchKeyword}
                                            onChange={(e)=> handleSearchKeyword(e)}
                                        />
                                        
                                        <Button 
                                           leftIcon={<BiSearchAlt />} 
                                           colorScheme='teal' 
                                           variant='solid'
                                           bg='#fac7d3' 
                                           borderRadius={'20px'}    
                                           width={'100px'}
                                           height={'40px'}  
                                           ml={'5px'}   
                                           color={'black'}         
                                        >Search</Button>

                                    </Center>
                                    {
                                        puddleStatistics?.in_progress_puddles?.filter(puddle => puddle.metadata.name == searchKeyword).map(puddle => {
                                            return(
                                            puddle.market_info.items?.map(item =>{
                                                
                                                return (
                                                    <Center mb={'15px'}>
                                                        <Card 
                                                            borderRadius={'20px'}
                                                            borderWidth={'1px'} 
                                                            borderColor={'#b8d8e5'} 
                                                            borderStyle={'solid'}
                                                            bg={'#7D7DFF'}
                                                            width={'90%'}>
                                                            <CardBody>
                                                                <Center>
                                                                    <Flex>
                                                                        {/*puddle name */}
                                                                            <Text fontSize='25px' as='ins' >
                                                                                {puddle.metadata.name}
                                                                            </Text>

                                                                            {/*puddle id*/}
                                                                            <Tooltip 
                                                                                label={`puddle id: ${puddle.id.id}`}
                                                                                bg={'gray'}
                                                                            >
                                                                                <InfoOutlineIcon ml={'3px'} mt={'5px'}/>
                                                                            </Tooltip>
                                                                    </Flex>
                                                                </Center>
                                                                <Center>
                                                                    <Flex mt={'10px'}>
                                                                        <Text color={'#b8d8e5'} >Amount: </Text>
                                                                        <Text ml={'20px'}>{item.shares} shares</Text>
                                                                        
                                                                    </Flex>
                                                                </Center>
                                                                <Center>
                                                                    <Flex >
                                                                        <Text color={'#b8d8e5'} >Price: </Text>
                                                                        <Text ml={'20px'}>{item.price}</Text>
                                                                        <Text ml={'10px'}>{item.coin_name} </Text>
                                                                    </Flex>
                                                                </Center>
                                                                <Center>
                                                                    <Flex >
                                                                    <Button 
                                                                    width={'150px'} 
                                                                    height={'50px'} 
                                                                    color={'black'} 
                                                                    bg='#b8d8e5' 
                                                                    variant='solid' 
                                                                    borderRadius={'20px'} 
                                                                    size={'lg'}  
                                                                    onClick={(e)=>{
                                                                        buyShares(item, puddle);
                                                                    }}
                                                                    >Buy Shares</Button>
                                                                    </Flex>
                                                                </Center>

                                                            </CardBody>
                                                        </Card>
                                                    </Center>
                                                );
                                            })        
                                        
                                        )}
                                    )}
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