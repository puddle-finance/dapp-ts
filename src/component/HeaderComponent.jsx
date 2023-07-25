import { IdcardTwoTone, WalletTwoTone, InteractionTwoTone, GiftTwoTone, DollarTwoTone, BankTwoTone } from '@ant-design/icons';
import { Menu } from 'antd';
import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ConnectButton } from "@suiet/wallet-kit";
import {PiSwap} from 'react-icons/pi';

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
        color: 'white',
    }

    const connectWallet = {
        opacity: '0.8', //透明度 0~1
        order: '0', //順序
        display: "inline flex",
        alignItems: 'centor', 
        marginLeft: '80px' //左邊界
    }

    const [selectedKey, setSelectedKey] = useState('about');

    const menuOnClick = (e) => {
        setSelectedKey(e.key);
    };

    useEffect(() => {
        if (window.location.pathname !== '/') {
            document.getElementById((window.location.pathname).substring(1)).click();
        }
    }, []);

    return (
        <>
            <table>
                <tr>
                    <td>
                        <li style={dexLiStyle}>
                            <h1 style={dexStyle}>
                                <b>
                                <span style={{ color: "deepskyblue", fontSize: "30px" }}>Puddle</span>
                                &nbsp;
                                <span style={{ color: "gold", fontSize: "30px" }}>Finance</span>
                                </b>
                            </h1>
                        </li>
                    </td>
                    <td>
                        <Menu onClick={menuOnClick} selectedKeys={[selectedKey]} mode="horizontal" theme="black" >
                            <Menu.Item id="puddle" key="puddle" icon={<BankTwoTone style={fontSize} />} style={menuStyle}>
                                <Link to="puddle" style={fontSize}>Puddle</Link>
                            </Menu.Item>
                            <Menu.Item id="invest" key="invest" icon={<DollarTwoTone style={fontSize} />} style={menuStyle}>
                                <Link to="invest" style={fontSize}>Invest</Link>
                            </Menu.Item>

                            <Menu.Item id="market" key="market" icon={<PiSwap style={fontSize} />} style={menuStyle}>
                                <Link to="market" style={fontSize}>Market</Link>
                            </Menu.Item>
                            <Menu.Item id="trader" key="trader" icon={<BankTwoTone style={fontSize} />} style={menuStyle}>
                                <Link to="trader" style={fontSize}>Trader</Link>
                            </Menu.Item>
                        </Menu>                        
                    </td>
                    <td>
                        <li style={connectWallet}>
                                <ConnectButton />
                        </li>
                    </td>
                </tr>
            </table>

            <Outlet />
        </>
    );
}