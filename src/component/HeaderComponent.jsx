
import { Menu } from 'antd';
import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ConnectButton } from "@suiet/wallet-kit";
import { SiCoinmarketcap } from "react-icons/si";
import { FaCircleDollarToSlot } from "react-icons/fa6";
import { FaChartPie } from "react-icons/fa";
import { PiBankBold } from "react-icons/pi";
import { border } from '@chakra-ui/react';
import { BiBorderRadius } from 'react-icons/bi';

export default function HeaderComponent() {

    const menuStyle = {
        display: 'flex',
        alignItems: 'center',
        marginLeft: '10px'
    }

    const dexLiStyle = {
        opacity: '1',
        display: 'flex',
        alignItems: 'center',
        marginLeft: '40px',
    }

    const dexStyle = {
        padding: '10px',
        color: 'white'
    }

    const fontSize = {
        fontSize: '20px',
        color: 'Cornsilk',
    }

    const connectWallet = {
        opacity: '0.8', //透明度 0~1
        order: '0', //順序
        display: "inline flex",
        alignItems: 'centor',
        marginLeft: '80px' //左邊界
    }

    const logoStyle = {
        ".frame": { height: "48px", position: "relative", width: "48px" },
        ".frame .overlap": {
            height: "12px",
            left: "36px",
            position: "absolute",
            top: "58px",
            width: "40px"
        },
        ".frame .subtract": {
            height: "7px",
            left: "9px",
            position: "absolute",
            top: "0",
            width: "23px"
        },
        ".frame .img": {
            height: "12px",
            left: "0",
            position: "absolute",
            top: "0",
            width: "40px"
        },
        ".frame .overlap-group": {
            backgroundImage: "url(/src/resources/ellipse-3-1.svg)",
            backgroundSize: "100% 100%",
            height: "31px",
            left: "46px",
            position: "absolute",
            top: "27px",
            width: "23px"
        },
        ".frame .ellipse": {
            height: "5px",
            left: "14px",
            position: "absolute",
            top: "18px",
            width: "4px"
        }
    }



    const [selectedKey, setSelectedKey] = useState('puddle');

    const menuOnClick = (e) => {
        setSelectedKey(e.key);
    };

    useEffect(() => {
        if (window.location.pathname !== '/') {
            document.getElementById((window.location.pathname).substring(1)).click();
        }
    }, []);

    const menuItems = [
        {
            id: "puddle",
            key: "puddle",
            icon: <PiBankBold style={{ color: 'BurlyWood', fontSize: '20px' }} />,
            style: { menuStyle },
            label: (
                <Link to="" style={fontSize}>Puddle</Link>
            ),
        },
        {
            id: "invest",
            key: "invest",
            icon: <FaCircleDollarToSlot style={{ color: 'BurlyWood', fontSize: '20px' }} />,
            style: { menuStyle },
            label: (
                <Link to="invest" style={fontSize}>Invest</Link>
            ),
        },
        {
            id: "market",
            key: "market",
            icon: <SiCoinmarketcap style={{ color: 'BurlyWood', fontSize: '20px' }} />,
            style: { menuStyle },
            label: (
                <Link to="market" style={fontSize}>Market</Link>
            ),
        },
        {
            id: "trader",
            key: "trader",
            icon: <FaChartPie style={{ color: 'BurlyWood', fontSize: '20px' }} />,
            style: { menuStyle },
            label: (
                <Link to="trader" style={fontSize}>Trader</Link>
            ),
        }
    ]
    return (
        <>
            <table>
                <tbody>
                    <tr>
                        <td>
                            <div style={dexLiStyle}>
                                <h1 style={dexStyle}>
                                    <div style={logoStyle['.frame .logo']}>
                                        <div style={logoStyle['.frame .overlap']}>
                                            <img style={logoStyle['.frame .subtract']} alt="puddle-small" src="/src/resources/subtract-4.svg" />
                                            <img style={logoStyle['.frame .img']} alt="puddle-big" src="/src/resources/subtract-3.svg" />
                                        </div>
                                        <div style={logoStyle['.frame .overlap-group']}>
                                            <img style={logoStyle['.frame .ellipse']} alt="droplet" src="/src/resources/ellipse-4-1.svg" />
                                        </div>
                                        <div>
                                        <span style={{ color: "deepskyblue", fontSize: "30px", marginLeft: "40px"}}>Puddle</span>
                                        &nbsp;
                                        <span style={{ color: "gold", fontSize: "30px" }}>Finance</span>
                                        </div>
                                    </div>
                                </h1>
                            </div>
                        </td>
                        <td>
                            <Menu onClick={menuOnClick} style={{ marginLeft: '70px' }} selectedKeys={[selectedKey]} mode="horizontal" theme="" items={menuItems} />
                        </td>
                        <td>
                            <li style={connectWallet}>
                                <ConnectButton />
                            </li>
                        </td>
                    </tr>
                </tbody>
            </table>

            <Outlet />
        </>
    );
}