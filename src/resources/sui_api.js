const Puddle_Package_ID = "0xe9ea8cf9316c4a5fb871ad7c004369ada4b9b2af672c3e01d958a01fff43c28b";
const Puddle_Module = "puddle";
const Puddle_Gas_Budget = "100000000";
const PuddleCapType = Puddle_Package_ID + "::puddle::PuddleCap";
const PuddleSharesType = Puddle_Package_ID + "::puddle::PuddleShare";
const PuddleStatistic = "0x722b08d8174d8969f79631995fe234dbe75fc5f8892fed9b62818ca96518d1b8";

const SUI_decimals = 1000000000;
const USDT_decimals = 1000000000;

const cetus_global_config_id = "0x6f4149091a5aea0e818e7243a13adcfb403842d670b9a2089de058512620687a";

import { testnetConnection, JsonRpcProvider, TransactionBlock } from "@mysten/sui.js";

const provider = new JsonRpcProvider(testnetConnection);

async function getPuddleById(puddleId, investUserAddress, isGetHolderInfo, isGetMarketInfo, isGetInvestments) {

    let response = await provider.getObject({
        id: puddleId,
        options: {
            showType: true,
            showOwner: true,
            showContent: true,
        }
    })

    console.log("------- getPuddleById -------");
    console.log(response.data);

    let puddleObj = new Object();

    if (response.data) {

        puddleObj.coin_decimals = SUI_decimals;

        let coin_type = response.data.type.split("<")[1].replace(">", "");
        puddleObj.coin_type = coin_type;

        let coin_name = coin_type.split("::")[2];
        puddleObj.coin_name = coin_name;

        if (coin_name === "USDT") {
            puddleObj.coin_decimals = USDT_decimals;
        }

        let obj = response.data.content.fields;

        puddleObj.id = obj.id;
        puddleObj.balance = obj.balance;
        puddleObj.commission_percentage = obj.commission_percentage;
        puddleObj.state = obj.state.fields;
        puddleObj.metadata = obj.metadata.fields;

        if (isGetHolderInfo) {

            puddleObj.holder_info = {
                "holders": obj.holder_info.fields.holders,
                "holders_count": obj.holder_info.fields.holders.length
            };
            getTableKeyValue(obj.holder_info.fields.holder_amount_table.fields.id.id).then(rep => {
                puddleObj.holder_info.holder_amount_table = rep;
            });

            puddleObj.isInvest = false;
            if (investUserAddress) {
                if (puddleObj.holder_info.holders.indexOf(investUserAddress) != -1) {
                    puddleObj.isInvest = true;
                }
            }
        }

        if (isGetMarketInfo) {
            let item_arr = []
            for (let i = 0; i < obj.market_info.fields.items.length; i++) {
                await getItemById(obj.market_info.fields.items[i]).then(resp => {
                    item_arr.push(resp);
                })
            }
            puddleObj.market_info = {
                "items": item_arr,
                "items_count": obj.market_info.fields.items.length
            };
            getTableKeyValue(obj.market_info.fields.item_listing_table.fields.id.id).then(rep => {
                puddleObj.market_info.item_listing_table = rep;
            });
        }

        if (isGetInvestments) {
            puddleObj.investments = {
                "total_rewards": obj.investments.fields.total_rewards,
                // "invests": obj.investments.fields.invests,
                "invests_count": obj.investments.fields.invests.length
            }
            let cost_table = await getTableKeyValue(obj.investments.fields.cost_table.fields.id.id).then(rep => {
                return rep;
            });
            let balance_bag = await getTableKeyValue(obj.investments.fields.balance_bag.fields.id.id).then(rep => {
                return rep;
            });

            let invests = [];
            for (let investsAddress of obj.investments.fields.invests){
                let obj = new Object();
                obj.investsAddress = investsAddress;
                obj.cost_sui = cost_table.get(investsAddress);
                obj.balance_amount = balance_bag.get(investsAddress);
                invests.push(obj);
            }
            puddleObj.investments.invests = invests;

        }
    }
    //console.log(puddleObj)
    return puddleObj;
}

async function getTableKeyValue(fieldId) {

    let response = await provider.getDynamicFields({
        parentId: fieldId,
    })

    console.log("------- getTableKeyValue -------");
    console.log(response.data);

    let tableMap = new Map();
    if (response.data) {
        // console.log(response.data);
        for (let i = 0; i < response.data.length; i += 1) {
            let obj = response.data[i];
            let type = obj.name.type;
            let value = obj.name.value;

            await getFieldObject(fieldId, type, value).then(rep => {
                for (let [key, value] of rep) {
                    tableMap.set(key, value);
                }
            });
        }
    }
    return tableMap;
}

async function getFieldObject(fieldId, type, value) {

    let response = await provider.getDynamicFieldObject({
        parentId: fieldId,
        name: {
            type: type,
            value: value
        }
    })

    console.log("------- getFieldObject -------");
    console.log(response.data);

    const tableMap = new Map();
    if (response.data) {
        let map_key = response.data.content.fields.name;
        let map_value = response.data.content.fields.value;
        tableMap.set(map_key, map_value);
    }

    return tableMap;
}

async function getPuddleSharesByWallet(walletAddress, structType) {

    let ownedObject = {
        owner: walletAddress,
        options: {
            showType: true,
            showOwner: true,
            showContent: true,
        }
    }
    if (structType != null && structType !== "") {
        ownedObject.filter = {
            MatchAny: [
                {
                    StructType: structType
                }
            ]
        }
    }

    let response = await provider.getOwnedObjects(
        ownedObject
    )

    console.log("------- getPuddleSharesByWallet -------");
    console.log(response.data);

    return response;
}

export async function getYourFundItems(walletAddress) {

    let puddleArr = new Array();
    let response = await getPuddleSharesByWallet(walletAddress, PuddleCapType);

    if (response.data) {
        for (let i = 0; i < response.data.length; i++) {
            let obj = response.data[i];
            let objContent = obj.data.content.fields;
            let puddleObj = new Object();
            puddleObj.puddleCapId = objContent.id.id;
            await getPuddleById(objContent.puddle_id, walletAddress, true, false, true).then(rep => {
                puddleObj.puddle = rep;
            });
            puddleArr.push(puddleObj);
        }

        console.log("------- getYourFundItems -------");
        console.log(puddleArr);

        return puddleArr;
    }
}
export async function getItemById(itemId) {

    let response = await provider.getObject({
        id: itemId,
        options: {
            showType: true,
            showOwner: true,
            showContent: true,
        }
    })

    let itemObj = new Object();

    if (response.data) {

        itemObj.coin_decimals = SUI_decimals;

        let coin_type = response.data.type.split("<")[1].replace(">", "");
        itemObj.coin_type = coin_type;
        let coin_name = coin_type.split("::")[2];

        let obj = response.data.content.fields;
        itemObj.price = obj.price / itemObj.coin_decimals;
        itemObj.id = obj.id;
        itemObj.owner = obj.item?.fields?.owner;
        itemObj.puddle_id = obj.item?.fields?.puddle_id;
        itemObj.shares = obj.item?.fields?.shares / itemObj.coin_decimals;
        itemObj.coin_name = coin_name;
    }

    console.log("------- getItemById -------");
    console.log(itemObj);

    return itemObj;
}

export async function getYourInvestItems(walletAddress) {

    let response = await getPuddleSharesByWallet(walletAddress, PuddleSharesType);
    let puddleArr = new Array();

    let puddleMap = new Map();

    if (response.data) {
        for (let i = 0; i < response.data.length; i++) {
            let obj = response.data[i];
            let objContent = obj.data.content.fields;
            let puddleObj = null;
            await getPuddleById(objContent.puddle_id, walletAddress, false, false, false).then(rep => {
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

    console.log("------- getYourInvestItems -------");
    console.log(puddleArr);

    return puddleArr;
}

export async function getPuddleStatistics(walletAddress, isGetInProgressPuddles, isGetClosedPuddles, isGetPuddleOwnerTable, pageType) {

    let isGetHolderInfo, isGetMarketInfo, isGetInvestments = false;
    if (pageType === 'invest') {
        isGetHolderInfo = true;
    } else if (pageType === 'market') {
        isGetMarketInfo = true;
    }

    let response = await provider.getObject({
        id: PuddleStatistic,
        options: {
            showType: true,
            showOwner: true,
            showContent: true,
        }
    })

    let puddleStatisticsObj = new Object();
    if (response.data) {

        let obj = response.data.content.fields;
        puddleStatisticsObj.id = obj.id;

        if (isGetInProgressPuddles) {
            let in_progress_puddles = [];
            for (let i = 0; i < obj.in_progress_puddles.length; i++) {
                await getPuddleById(obj.in_progress_puddles[i], walletAddress, isGetHolderInfo, isGetMarketInfo, isGetInvestments).then(rep => {
                    if (rep.metadata.trader !== walletAddress){
                        in_progress_puddles.push(rep);
                    }
                });
            }
            puddleStatisticsObj.in_progress_puddles = in_progress_puddles;
        }

        if (isGetClosedPuddles) {
            let closed_puddles = [];
            for (let i = 0; i < obj.closed_puddles.length; i++) {
                await getPuddleById(obj.closed_puddles[i], walletAddress, isGetHolderInfo, isGetMarketInfo, isGetInvestments).then(rep => {
                    closed_puddles.push(rep);
                });
            }
            puddleStatisticsObj.closed_puddles = closed_puddles;
        }

        if (isGetPuddleOwnerTable) {
            await getTableKeyValue(obj.puddle_owner_table.fields.id.id).then(rep => {
                puddleStatisticsObj.puddle_owner_table = rep;
            });
        }
    }

    console.log("------- getPuddleStatistics -------");
    console.log(puddleStatisticsObj);

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

export async function depositPuddleShares(wallet, coin_type, puddle_id, amount, coin_decimals) {

    let txObj = new TransactionBlock();

    let type_args = [];
    type_args.push(coin_type);

    if (wallet.connected) {

        let amount_coin = Number(amount) * Number(coin_decimals);
        let [coins] = txObj.splitCoins(txObj.gas, [txObj.pure(amount_coin)]);

        let args = [
            txObj.pure(puddle_id),
            txObj.pure(BigInt(Number(amount) * Number(coin_decimals))),
            coins,
        ];

        // call sui move smart contract
        txObj.moveCall({
            target: `${Puddle_Package_ID}::${Puddle_Module}::mint`,
            typeArguments: type_args,
            arguments: args,
        })

        txObj.transferObjects([coins], txObj.pure(wallet.account.address));
        txObj.setSender(wallet.account.address);

        try {
            // signature and Execute Transaction
            const resData = await wallet.signAndExecuteTransactionBlock({
                transactionBlock: txObj,
                options: { showEffects: true },
            });
            console.log('successfully!', resData);

            window.location.reload();

        } catch (e) {
            console.error('failed', e);
        }
    }

}

export async function buyPuddleShares(wallet, coin_type, puddle_id, product_id, price, coin_decimals) {

    let txObj = new TransactionBlock();


    let type_args = [];
    type_args.push(coin_type);

    if (wallet.connected) {
        let amount_coin = Number(price) * Number(coin_decimals);
        let [coins] = txObj.splitCoins(txObj.gas, [txObj.pure(amount_coin)]);

        let args = [
            txObj.pure(puddle_id),
            txObj.pure(product_id),
            coins,
        ];

        // call sui move smart contract
        txObj.moveCall({
            target: `${Puddle_Package_ID}::${Puddle_Module}::buy_shares`,
            typeArguments: type_args,
            arguments: args,
        })

        txObj.transferObjects([coins], txObj.pure(wallet.account.address));
        txObj.setSender(wallet.account.address);

        try {
            // signature and Execute Transaction
            const resData = await wallet.signAndExecuteTransactionBlock({
                transactionBlock: txObj,
                options: { showEffects: true },
            });
            console.log('successfully!', resData);

            window.location.reload();

        } catch (e) {
            console.error('failed', e);
        }


    }

}

export async function salePuddleShares(wallet, coin_type, puddle_id, shares_id, amount, same, price) {

    let txObj = new TransactionBlock();

    let type_args = [];
    type_args.push(coin_type);

    let args = [];

    if (!same) {

        args = [
            txObj.pure(shares_id),
            txObj.pure(BigInt(Number(amount))),
        ];

        console.log(JSON.stringify(args));

        let isOK = await handleSignTransaction(wallet, "divide_shares", txObj, type_args, args, false);

        if (isOK) {
            txObj = new TransactionBlock();

            args = [
                txObj.pure(puddle_id),
                txObj.pure(shares_id),
                txObj.pure(BigInt(Number(price))),
            ];

            console.log(JSON.stringify(args));

            handleSignTransaction(wallet, "sale_shares", txObj, type_args, args, true);
        }
    } else {
        txObj = new TransactionBlock();

        args = [
            txObj.pure(puddle_id),
            txObj.pure(shares_id),
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

    provider.getAllCoins();

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
    if (coin_type === "0x2::sui::SUI") {
        coin_decimals = SUI_decimals;
    }

    let args = [
        txObj.pure(PuddleStatistic),
        txObj.pure(BigInt(Number(maxSupply) * Number(coin_decimals))),
        txObj.pure(trader),
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
    if (coin_type === "0x2::sui::SUI") {
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
}

export async function cetusInvest(wallet, puddleCapId, puddleId, poolDetail, amount) {

    let sqrt_price_limit = "79226673515401279992447579055";
    let clockId = "0x0000000000000000000000000000000000000000000000000000000000000006";

    let txObj = new TransactionBlock();

    let type_args = [];
    type_args.push(poolDetail.coinTypeA);
    type_args.push(poolDetail.coinTypeB);

    let args = [
        txObj.pure(puddleCapId),
        txObj.pure(puddleId),
        txObj.pure(cetus_global_config_id),
        txObj.pure(poolDetail.poolAddress),
        txObj.pure(amount),
        txObj.pure(sqrt_price_limit),
        txObj.pure(clockId),
    ];

    handleSignTransaction(wallet, "invest", txObj, type_args, args, true);
}

export async function getCoinMetadata(coinType) {
    let coinMetaData = await provider.getCoinMetadata({coinType: coinType});
    return coinMetaData;
}