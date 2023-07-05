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
  import SalingItemComponent from './SalingItemComponent.jsx';
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

export default function ItemComponent() {
    return (
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
                            Demo Puddle
                        </Text>

                        {/*puddle id*/}
                        <Tooltip 
                            label={`puddle id: xx`}
                            bg={'gray'}
                        >
                            <InfoOutlineIcon ml={'3px'} mt={'5px'}/>
                        </Tooltip>
                </Flex>
            </Center>
            <Center>
                <Flex mt={'10px'}>
                    <Text color={'#b8d8e5'} >Amount: </Text>
                    <Text ml={'20px'}>xxx</Text>
                </Flex>
            </Center>
            <Center>
                <Flex >
                    <Text color={'#b8d8e5'} >Owner: </Text>
                    <Text ml={'20px'}>xxx</Text>
                </Flex>
            </Center>
            <Center>
                <Flex >
                <Button width={'150px'} height={'50px'} color={'black'} bg='#b8d8e5' variant='solid' borderRadius={'20px'} size={'lg'}  >Buy Shares</Button>
                </Flex>
            </Center>

        </CardBody>
    </Card>);
}