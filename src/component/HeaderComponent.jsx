
import { Menu } from 'antd';
import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ConnectButton } from "@suiet/wallet-kit";
import { SiCoinmarketcap } from "react-icons/si";
import { FaCircleDollarToSlot } from "react-icons/fa6";
import { FaChartPie } from "react-icons/fa";
import { PiBankBold } from "react-icons/pi";
import { IconContext } from "react-icons";

export default function HeaderComponent() {

    const menuStyle = {
        display: 'flex',
        alignItems: 'center',
        marginLeft: '10px'
    }

    const dexLiStyle = {
        opacity: '1',
        //order: '0',
        display: 'flex',
        alignItems: 'center',
        marginLeft: '40px'
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
            icon: <PiBankBold style={{color:'BurlyWood', fontSize: '20px'}} />,
            style: { menuStyle },
            label: (
                <Link to="" style={fontSize}>Puddle</Link>
            ),
        },
        {
            id: "invest",
            key: "invest",
            icon: <FaCircleDollarToSlot style={{color:'BurlyWood', fontSize: '20px'}} />,
            style: { menuStyle },
            label: (
                <Link to="invest" style={fontSize}>Invest</Link>
            ),
        },
        {
            id: "market",
            key: "market",
            icon: <SiCoinmarketcap style={{color:'BurlyWood', fontSize: '20px'}} />,
            style: { menuStyle },
            label: (
                <Link to="market" style={fontSize}>Market</Link>
            ),
        },
        {
            id: "trader",
            key: "trader",
            icon: <FaChartPie style={{color:'BurlyWood', fontSize: '20px'}} />,
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
                            <li style={dexLiStyle}>
                                <h1 style={dexStyle}>
                                    <b>
                                        <span style={{ color: "deepskyblue", fontSize: "30px"}}>Puddle</span>
                                        &nbsp;
                                        <span style={{ color: "gold", fontSize: "30px"}}>Finance</span>
                                    </b>
                                </h1>
                            </li>
                        </td>
                        <td>
                            <Menu onClick={menuOnClick} style={{marginLeft:'70px'}} selectedKeys={[selectedKey]} mode="horizontal" theme="" items={menuItems} />
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