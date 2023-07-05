const Puddle_Package_ID = "0x25ff841861accaf696526afde6203cc9df649f33173b24901823a548b7e44d44";
const Puddle_Module = "puddle";
const Puddle_Gas_Budget = "100000000";
const PuddleCapType = Puddle_Package_ID + "::puddle::PuddleCap";
const PuddleSharesType = Puddle_Package_ID + "::puddle::PuddleShares";
const PuddleStatistics = "0x94e1c36e190c1265a954950ddd374f84a9f7ced3df29b9255b9e85d90c661826";

const SUI_decimals = 1000000000;
const USDT_decimals = 1000000000;

import { TransactionBlock, Inputs } from "@mysten/sui.js";

async function getPuddleById(axios, apiurl, puddleId, investUserAddress) {
    let reqdata = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "sui_getObject",
        "params": [
            puddleId,
            {
                "showType": true,
                "showOwner": true,
                "showContent": true,
                "showPreviousTransaction": false,
                "showDisplay": false,
                "showBcs": false,
                "showStorageRebate": false
            }
        ]
    };

    let response = await axios.post(apiurl, reqdata);
    let puddleObj = new Object();
    if (response.data.result.data) {

        puddleObj.coin_decimals = SUI_decimals;

        let coin_type = response.data.result.data.type.split("<")[1].replace(">", "");
        puddleObj.coin_type = coin_type;

        let coin_name = coin_type.split("::")[2];
        puddleObj.coin_name = coin_name;

        if (coin_name === "USDT") {
            puddleObj.coin_decimals = USDT_decimals;
        }

        let obj = response.data.result.data.content.fields;

        puddleObj.id = obj.id;
        puddleObj.balance = obj.balance;
        puddleObj.commission_percentage = obj.commission_percentage;
        puddleObj.state = obj.state.fields;
        puddleObj.metadata = obj.metadata.fields;
        puddleObj.holder_info = {
            "holders": obj.holder_info.fields.holders,
            "holders_count": obj.holder_info.fields.holders.length
        };
        getTableKeyValue(axios, apiurl, obj.holder_info.fields.holder_amount_table.fields.id.id).then(rep => {
            puddleObj.holder_info.holder_amount_table = rep;
        });
        
        let item_arr = []
        for (let i = 0 ; i <  obj.market_info.fields.items.length; i++){
            await getItemById(axios, apiurl, obj.market_info.fields.items[i]).then(resp=>{
                item_arr.push(resp);
            })
        }
        puddleObj.market_info = {
            "items": item_arr,
            "items_count": obj.market_info.fields.items.length
        };
        
        getTableKeyValue(axios, apiurl, obj.market_info.fields.item_listing_table.fields.id.id).then(rep => {
            puddleObj.market_info.item_listing_table = rep;
        });
        puddleObj.investments = {
            "total_rewards": obj.investments.fields.total_rewards,
            "invests": obj.investments.fields.invests,
            "invests_count": obj.investments.fields.invests.length
        }
        getTableKeyValue(axios, apiurl, obj.investments.fields.cost_table.fields.id.id).then(rep => {
            puddleObj.investments.cost_table = rep;
        });

        puddleObj.isInvest = false;
        if (investUserAddress) {
            if (puddleObj.holder_info.holders.indexOf(investUserAddress) != -1) {
                puddleObj.isInvest = true;
            }
        }
    }
    //console.log(puddleObj)
    return puddleObj;
}

async function getTableKeyValue(axios, apiurl, fieldId) {
    let reqdata = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "suix_getDynamicFields",
        "params": [
            fieldId
        ]
    }

    let response = await axios.post(apiurl, reqdata);
    // console.log("getTableKeyValue = "+JSON.stringify(response));
    let tableMap = new Map();
    if (response.data.result.data) {
        // console.log(response.data);
        for (let i = 0; i < response.data.result.data.length; i += 1) {
            let obj = response.data.result.data[i];
            let type = obj.name.type;
            let value = obj.name.value;

            await getFieldObject(axios, apiurl, fieldId, type, value).then(rep => {
                for (let [key, value] of rep) {
                    tableMap.set(key, value);
                }
            });
        }
    }
    return tableMap;
}

async function getFieldObject(axios, apiurl, fieldId, type, value) {
    let reqdata1 = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "suix_getDynamicFieldObject",
        "params": [
            fieldId,
            {
                "type": type,
                "value": value
            }
        ]
    };

    let response1 = await axios.post(apiurl, reqdata1);
    const tableMap = new Map();
    if (response1.data.result.data) {
        let map_key = response1.data.result.data.content.fields.name;
        let map_value = response1.data.result.data.content.fields.value;
        tableMap.set(map_key, map_value);
    }
    return tableMap;
}

async function getPuddleSharesByWallet(axios, apiurl, walletAddress, structType) {

    let reqdata = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "suix_getOwnedObjects",
        "params": [
            walletAddress
            ,
            {
                "filter": {
                    "MatchAll": [
                        {
                            "StructType": structType
                        }
                    ]
                },
                "options": {
                    "showType": true,
                    "showOwner": true,
                    "showPreviousTransaction": true,
                    "showContent": true,
                    "showDisplay": false,
                    "showBcs": false,
                    "showStorageRebate": false
                }
            }
        ]
    };

    return await axios.post(apiurl, reqdata);
}

export async function getYourFundItems(axios, apiurl, walletAddress) {

    let puddleArr = new Array();
    let response = await getPuddleSharesByWallet(axios, apiurl, walletAddress, PuddleCapType);
    if (response.data.result.data) {
        for (let i = 0; i < response.data.result.data.length; i++) {
            let obj = response.data.result.data[i];
            let objContent = obj.data.content.fields;
            let puddleObj = new Object();
            puddleObj.id = objContent.id.id;
            await getPuddleById(axios, apiurl, objContent.puddle_id, walletAddress).then(rep => {
                puddleObj.puddle = rep;
            });
            puddleArr.push(puddleObj);
        }
        return puddleArr;
    }
}
export async function getItemById(axios, apiurl, itemId) {
    let reqdata = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "sui_getObject",
        "params": [
            itemId,
            {
                "showType": true,
                "showOwner": true,
                "showContent": true,
                "showPreviousTransaction": false,
                "showDisplay": false,
                "showBcs": false,
                "showStorageRebate": false
            }
        ]
    };

    let response = await axios.post(apiurl, reqdata);
    let itemObj = new Object();
    if (response.data.result.data) {

        itemObj.coin_decimals = SUI_decimals;

        let coin_type = response.data.result.data.type.split("<")[1].replace(">", "");
        itemObj.coin_type = coin_type;
        let coin_name = coin_type.split("::")[2];

        let obj = response.data.result.data.content.fields;
        itemObj.price = obj.price / itemObj.coin_decimals;
        itemObj.id = obj.id;
        itemObj.owner = obj.item?.fields?.owner;
        itemObj.puddle_id = obj.item?.fields?.puddle_id;
        itemObj.shares = obj.item?.fields?.shares / itemObj.coin_decimals;
        itemObj.coin_name = coin_name;
        
        //console.log(itemObj);
    }
    return itemObj;
}

export async function getYourInvestItems(axios, apiurl, walletAddress) {

    let response = await getPuddleSharesByWallet(axios, apiurl, walletAddress, PuddleSharesType);
    let puddleArr = new Array();

    let puddleMap = new Map();

    if (response.data.result.data) {
        for (let i = 0; i < response.data.result.data.length; i++) {
            let obj = response.data.result.data[i];
            let objContent = obj.data.content.fields;
            let puddleObj = null;
            await getPuddleById(axios, apiurl, objContent.puddle_id, walletAddress).then(rep => {
                if (puddleMap.get(rep.id.id)) {
                    puddleObj = puddleMap.get(rep.id.id);
                    puddleObj.shares = Number(puddleObj.shares) + Number(objContent.shares);
                    puddleObj.can_merge = true;
                    puddleObj.merge_id_arr.push(objContent.id.id);
                } else {
                    puddleObj = new Object();
                    puddleObj.id = objContent.id.id;
                    puddleObj.owner = objContent.owner;
                    puddleObj.shares = objContent.shares;
                    puddleObj.puddle = rep;
                    puddleObj.can_merge = false;
                    puddleObj.merge_id_arr = [];
                }
                puddleMap.set(rep.id.id, puddleObj);
            });
        }
    }

    for (let puddle of puddleMap.values()) {
        puddle.proportion = (Number(puddle.shares) / Number(puddle.puddle.metadata.total_supply)).toFixed(4);
        puddleArr.push(puddle);
    }

    return puddleArr;
}

export async function getPuddleStatistics(axios, apiurl, walletAddress) {
    let reqdata = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "sui_getObject",
        "params": [
            PuddleStatistics,
            {
                "showType": true,
                "showOwner": true,
                "showContent": true,
                "showPreviousTransaction": false,
                "showDisplay": false,
                "showBcs": false,
                "showStorageRebate": false
            }
        ]
    };

    let response = await axios.post(apiurl, reqdata)
    let puddleStatisticsObj = new Object();
    if (response.data.result.data) {

        let obj = response.data.result.data.content.fields;
        puddleStatisticsObj.id = obj.id;

        let closed_puddles = [];
        for (let i = 0; i < obj.closed_puddles.length; i++) {
            await getPuddleById(axios, apiurl, obj.closed_puddles[i], walletAddress).then(rep => {
                closed_puddles.push(rep);
            });
        }
        puddleStatisticsObj.closed_puddles = closed_puddles;

        let in_progress_puddles = [];
        for (let i = 0; i < obj.in_progress_puddles.length; i++) {
            await getPuddleById(axios, apiurl, obj.in_progress_puddles[i], walletAddress).then(rep => {
                in_progress_puddles.push(rep);
            });
        }
        puddleStatisticsObj.in_progress_puddles = in_progress_puddles;

        await getTableKeyValue(axios, apiurl, obj.puddle_owner_table.fields.id.id).then(rep => {
            puddleStatisticsObj.puddle_owner_table = rep;
        });
    }
    return puddleStatisticsObj;
}

export async function mergePuddleShares(wallet, coin_type, shares_id, merge_id_arr) {

    let txObj = new TransactionBlock();

    let type_args = [];
    type_args.push(coin_type);

    let objects_arr = [];
    merge_id_arr.forEach(merge_id => {
        objects_arr.push(txObj.object(merge_id));
    });

    let args = [
        txObj.pure(shares_id),
        txObj.makeMoveVec({ objects: objects_arr }),
    ];

    handleSignTransaction(wallet, "merge_shares", txObj, type_args, args, true);
}

export async function depositPuddleShares(axios, apiurl, wallet, coin_type, puddle_id, amount, coin_decimals) {

    let txObj = new TransactionBlock();
    txObj.splitCoins(txObj.gas, [txObj.pure(1000000)])

    let type_args = [];
    type_args.push(coin_type);

    let coin_id = null;

    let coinArr = await getCoinArr(axios, apiurl, wallet.account.address, coin_type);

    let coin_count = 0;
    let coin_balance = 0;

    if (coinArr == undefined || coinArr == null || coinArr.length == 0) {
        alert("No Balance");
        return null;
    } else {
        coin_count = coinArr.length;
        for (let i = 0; i < coinArr.length; i++) {
            let coinObj = coinArr[i];
            if (Number(coinObj.balance) / Number(coin_decimals) >= Number(amount)) {
                coin_id = coinObj.coinObjectId;
                coin_balance = coinObj.balance;
                break;
            }
        }
    }

    if (coin_id == null) {
        alert("Insufficient Balance");
        return null;
    }

    let args = [
        txObj.object(puddle_id),
        txObj.pure(BigInt(Number(amount) * Number(coin_decimals))),
        txObj.object(coin_id),
    ];

    // if (coin_count < 2) {
    //     const [coins] = txObj.splitCoins(txObj.object(coin_id), [
    //         txObj.pure(BigInt(Number(coin_balance) - (Number(amount) * Number(coin_decimals)))),
    //     ])
    //     txObj.transferObjects([coins], txObj.object(wallet.account.address));
    //     args = [
    //         txObj.object(puddle_id),
    //         txObj.pure(BigInt(Number(amount) * Number(coin_decimals))),
    //         txObj.object(coin_id),
    //     ];
    // }else {
    //     args = [
    //         txObj.object(puddle_id),
    //         txObj.pure(BigInt(Number(amount) * Number(coin_decimals))),
    //         txObj.object(coin_id),
    //     ];
    // }

    console.log(JSON.stringify(args));

    handleSignTransaction(wallet, "mint", txObj, type_args, args, true);
}

export async function buyPuddleShares(axios, apiurl, wallet, coin_type, puddle_id, product_id, price, coin_decimals) {

    let txObj = new TransactionBlock();

    txObj.setGasBudget(3000000);

    let type_args = [];
    type_args.push(coin_type);

    let coin_id = null;

    let coinArr = await getCoinArr(axios, apiurl, wallet.account.address, coin_type);
    if (coinArr == undefined || coinArr == null || coinArr.length == 0) {
        alert("No Balance");
        return null;
    } else {
        

        for (let i = 0; i < coinArr.length; i++) {
            let coinObj = coinArr[i];
            if (Number(coinObj.balance) / Number(coin_decimals) >= Number(price)) {
                coin_id = coinObj.coinObjectId;
                break;
            }
        }
    }
    console.log(coin_id);

    if (coin_id == null) {
        alert("Insufficient Balance");
        return null;
    }

    let args = [
        txObj.object(puddle_id),
        txObj.object(product_id),
        txObj.object(coin_id),
    ];

    console.log(JSON.stringify(args));

    handleSignTransaction(wallet, "buy_shares", txObj, type_args, args, true);

}

export async function salePuddleShares(wallet, coin_type, puddle_id, shares_id, amount, same, price) {

    let txObj = new TransactionBlock();

    let type_args = [];
    type_args.push(coin_type);

    let args = [];

    if (!same) {

        args = [
            txObj.object(shares_id),
            txObj.pure(BigInt(Number(amount))),
        ];

        console.log(JSON.stringify(args));

        let isOK = await handleSignTransaction(wallet, "divide_shares", txObj, type_args, args, false);

        if (isOK) {
            txObj = new TransactionBlock();

            args = [
                txObj.object(puddle_id),
                txObj.object(shares_id),
                txObj.pure(BigInt(Number(price))),
            ];

            console.log(JSON.stringify(args));

            handleSignTransaction(wallet, "sale_shares", txObj, type_args, args, true);
        }
    } else {
        txObj = new TransactionBlock();

        args = [
            txObj.object(puddle_id),
            txObj.object(shares_id),
            txObj.pure(BigInt(Number(price))),
        ];

        console.log(JSON.stringify(args));

        handleSignTransaction(wallet, "sale_shares", txObj, type_args, args, true);
    }
}

async function handleSignTransaction(wallet, functionName, txObj, type_args, args, isReload) {

    if (wallet.connected) {
        
        // call sui move smart contract
        txObj.moveCall({
            target: `${Puddle_Package_ID}::${Puddle_Module}::${functionName}`,
            typeArguments: type_args,
            arguments: args,
        })

        try {
            // signature and Execute Transaction
            const resData = await wallet.signAndExecuteTransactionBlock({
                transactionBlock: txObj,
                options: { showEffects: true },
            });
            console.log('successfully!', resData);
            if (isReload) {
                window.location.reload();
            } else {
                return true;
            }
        } catch (e) {
            console.error('failed', e);
        }
    }
}

export async function getCoinArr(axios, apiurl, walletAddress, coin_type) {
    let reqdata = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "suix_getCoins",
        "params": [
            walletAddress,
            coin_type,
            null,
            null
        ]
    };

    let response = await axios.post(apiurl, reqdata);
    if (response.data.result.data) {
        let coinArr = [];
        for (let i = 0; i < response.data.result.data.length; i++) {
            let coinObj = response.data.result.data[i];
            // "coinType": "0x2::sui::SUI",
            // "coinObjectId": "0x26200601446dcd1aa4ba7f9f087b0920ae812b81164dfd38929a607066c4239e",
            // "version": "775546",
            // "digest": "5N7qWhY88psn7KZ9FBBW4gAYuEVMRmzFezvdj7sRBapy",
            // "balance": "4347719828",
            // "previousTransaction": "Dwj4Hnxm3CP4EnFzRizykQdXgrfWF9cfXx662XAr5UKr"
            coinArr.push(coinObj);
        }
        return coinArr;
    }
}

export async function createPuddle(wallet, coin_type, name, desc, commissionPercentage, trader, maxSupply) {

    let txObj = new TransactionBlock();

    let type_args = [];
    type_args.push(coin_type);

    let coin_decimals = 0;
    if (coin_type === "0x2::sui::SUI"){
        coin_decimals = SUI_decimals;
    }

    let args = [
        txObj.object(PuddleStatistics),
        txObj.pure(BigInt(Number(maxSupply) * Number(coin_decimals))),
        txObj.object(trader),
        txObj.pure(Number(commissionPercentage)),
        txObj.pure(name),
        txObj.pure(desc),
    ];

    console.log(JSON.stringify(args));

    handleSignTransaction(wallet, "create_puddle", txObj, type_args, args, true);
}

export async function modifyPuddle(wallet, puddle, coin_type, name, desc, commissionPercentage, trader) {

    let txObj = new TransactionBlock();

    let type_args = [];
    type_args.push(coin_type);

    let coin_decimals = 0;
    if (coin_type === "0x2::sui::SUI"){
        coin_decimals = SUI_decimals;
    }

    txObj.moveCall({
        target: `${Puddle_Package_ID}::${Puddle_Module}::modify_puddle_name`,
        typeArguments: type_args,
        arguments: [
            txObj.object(puddle.id),
            txObj.object(puddle.puddle.id.id),
            txObj.pure(name),
        ],
    })

    txObj.moveCall({
        target: `${Puddle_Package_ID}::${Puddle_Module}::modify_puddle_desc`,
        typeArguments: type_args,
        arguments: [
            txObj.object(puddle.id),
            txObj.object(puddle.puddle.id.id),
            txObj.pure(desc),
        ],
    })

    txObj.moveCall({
        target: `${Puddle_Package_ID}::${Puddle_Module}::modify_puddle_commission_percentage`,
        typeArguments: type_args,
        arguments: [
            txObj.object(puddle.id),
            txObj.object(puddle.puddle.id.id),
            txObj.pure(commissionPercentage),
        ],
    })

    txObj.moveCall({
        target: `${Puddle_Package_ID}::${Puddle_Module}::modify_puddle_trader`,
        typeArguments: type_args,
        arguments: [
            txObj.object(puddle.id),
            txObj.object(puddle.puddle.id.id),
            txObj.object(trader),
        ],
    })

    let isReload = true;

    try {
        // signature and Execute Transaction
        const resData = await wallet.signAndExecuteTransactionBlock({
            transactionBlock: txObj,
            options: { showEffects: true },
        });
        console.log('successfully!', resData);
        if (isReload) {
            window.location.reload();
        } else {
            return true;
        }
    } catch (e) {
        console.error('failed', e);
    }

    // console.log(JSON.stringify(args));

    // handleSignTransaction(wallet, "create_puddle", txObj, type_args, args, false);
}