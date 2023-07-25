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
    getYourFundItems,
    createPuddle,
    modifyPuddle,
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
        color: 'darkorchid',
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
        <div className="puddle" style={PuddlStyle}>
            <h2 style={{ color: 'gold'}}>
                To Be Continue ...
            </h2>
        </div >
    );
}