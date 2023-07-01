import { IdcardTwoTone, WalletTwoTone, InteractionTwoTone, GiftTwoTone, DollarTwoTone, BankTwoTone } from '@ant-design/icons';
import { Menu } from 'antd';
import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ConnectButton } from "@suiet/wallet-kit";

export default function HeaderComponent() {

    const menuStyle = {
        display: 'flex',
        alignItems: 'center',
        marginLeft: '10px'
    }

    const dexLiStyle = {
        opacity: '1',
        order: '1',
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
        opacity: '1',
        order: '10',
        display: 'flex',
        alignItems: 'center',
        marginLeft: '40px'
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
            <Menu onClick={menuOnClick} selectedKeys={[selectedKey]} mode="horizontal" theme="dark" >
                <li style={dexLiStyle}>
                    <h1 style={dexStyle}>
                        <b>
                        <span style={{ color: "deepskyblue", fontSize: "30px" }}>Puddle</span>
                        &nbsp;
                        <span style={{ color: "gold", fontSize: "30px" }}>Finance</span>
                        </b>
                    </h1>
                </li>
                <Menu.Item id="about" key="about" icon={<IdcardTwoTone style={fontSize} />} style={menuStyle}>
                    <Link to="" style={fontSize}>About Us</Link>
                </Menu.Item>
                <Menu.Item id="invest" key="invest" icon={<DollarTwoTone style={fontSize} />} style={menuStyle}>
                    <Link to="invest" style={fontSize}>Invest</Link>
                </Menu.Item>
                <Menu.Item id="puddle" key="puddle" icon={<BankTwoTone style={fontSize} />} style={menuStyle}>
                    <Link to="puddle" style={fontSize}>Puddle</Link>
                </Menu.Item>
                <li style={connectWallet}>
                    <ConnectButton />
                </li>
            </Menu>
            <Outlet />
        </>
    );
}