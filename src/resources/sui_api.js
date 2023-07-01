const Puddle_Package_ID = "0xc4761cc514d11dddf61f74cddb281de4cf4995dc381496768abffccf4824c723";
const Puddle_Module = "puddle";
const Puddle_Gas_Budget = "100000000";
const PuddleCapType = Puddle_Package_ID + "::puddle::PuddleCap";
const PuddleSharesType = Puddle_Package_ID + "::puddle::PuddleShares";
const PuddleStatistics = "0x8aa3ffdf10463e0b1349a2a01e25485d6abf5b97c95960960a2669dbda79a5e4";

const SUI_decimals = 1000000000;
const USDT_decimals = 1000000000;

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
            "holders": obj.holder_info.fields.holders
        };
        getTableKeyValue(axios, apiurl, obj.holder_info.fields.holder_amount_table.fields.id.id).then(rep => {
            puddleObj.holder_info.holder_amount_table = rep;
        });
        puddleObj.market_info = {
            "items": obj.market_info.fields.items
        };
        getTableKeyValue(axios, apiurl, obj.market_info.fields.item_listing_table.fields.id.id).then(rep => {
            puddleObj.market_info.item_listing_table = rep;
        });
        puddleObj.investments = {
            "total_rewards": obj.investments.fields.total_rewards,
            "invests": obj.investments.fields.invests
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

async function getPuddleByWallet(axios, apiurl, walletAddress, structType) {

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

export async function moveCall(axios, apiurl, walletAddress, functionName, type_args, args) {

    let reqdata = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "unsafe_moveCall",
        "params": [
            walletAddress,
            Puddle_Package_ID,
            Puddle_Module,
            functionName,
            type_args,
            args,
            null,
            Puddle_Gas_Budget,
            null
        ]
    };

    console.log("reqdata = " + JSON.stringify(reqdata));

    console.log(await axios.post(apiurl, reqdata));
}

export function getYourFundItems(axios, apiurl, walletAddress) {

    getPuddleByWallet(axios, apiurl, walletAddress, PuddleCapType).then(response => {
        if (response.data.result.data) {
            let puddleArr = new Array();
            response.data.result.data.forEach(obj => {
                let objContent = obj.data.content.fields;
                let puddleObj = new Object();
                puddleObj.id = objContent.id.id;
                puddleObj.puddle = getPuddleById(axios, apiurl, objContent.puddle_id, walletAddress);
                puddleArr.push(puddleObj);
            })
            return puddleArr;
        }
    });
}

export async function getYourInvestItems(axios, apiurl, walletAddress) {

    let response = await getPuddleByWallet(axios, apiurl, walletAddress, PuddleSharesType);
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
                } else {
                    puddleObj = new Object();
                    puddleObj.id = objContent.id.id;
                    puddleObj.owner = objContent.owner;
                    puddleObj.shares = objContent.shares;
                    puddleObj.puddle = rep;
                }
                puddleMap.set(rep.id.id, puddleObj);
            });
        }
    }

    for (let puddle of puddleMap.values()) {
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

export async function handleSignMsg(wallet, msg) {
    try {
        // convert string to Uint8Array 
        let msgBytes = new TextEncoder().encode(msg)

        // call wallet's signMessage function
        let result = await wallet.signMessage({
            message: msgBytes
        })
        // verify signature with publicKey and SignedMessage (params are all included in result)
        let verifyResult = wallet.verifySignedMessage(result)
        if (!verifyResult) {
            console.log('signMessage succeed, but verify signedMessage failed')
        } else {
            console.log('signMessage succeed, and verify signedMessage succeed!')
        }
    } catch (e) {
        console.error('signMessage failed', e)
    }
}