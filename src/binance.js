
const request = require('request');
const rp = require('request-promise');

const MARKETS_ENDPOINT = "https://api.binance.com/api/v3/exchangeInfo"


/**
 * load markets from binance and creates standard BASE/QUOTE symbol in standartSymbol field
 * @return dict with keys of binance symbols
*/
let markets;

async function loadStandardMarkets() {


    let resltMarkets = {};

    let body = await rp({uri:MARKETS_ENDPOINT, json:true});

    body["symbols"].forEach((value) => {

        let symbol = value["baseAsset"] + "/" + value["quoteAsset"];

        resltMarkets[value["symbol"]] = value;
        resltMarkets[value["symbol"]]["standardSymbol"] = symbol;

    });

    markets = resltMarkets;

    return resltMarkets;

}
/**
 * convert bookTicker from binance to ccxt format:
 *  binance: {
 *  "u":400900217,     // order book updateId
 *  "s":"BNBUSDT",     // symbol
 *  "b":"25.35190000", // best bid price
 *  "B":"31.21000000", // best bid qty
 *  "a":"25.36520000", // best ask price
 *  "A":"40.66000000"  // best ask qty
 *  }
 *  ccxt: {
 *      "symbol": <s>.
 *      "ask": <a>,
 *      "askVolume": <A>,
 *      "bid": <b>,
 *      "bidVolume": <B>}
 *
 * @param bookTicker - single bookTicker object
 */

function parseBookTickers(bookTicker){

    if (!markets) {
        throw "Markets not loaded";
    }

    return {
        symbol: markets[bookTicker["s"]]["standardSymbol"],
        ask: bookTicker["a"],
        askVolume: bookTicker["A"],
        bid: bookTicker["b"],
        bidVolume: bookTicker["B"]
    }

}

module.exports = {loadStandardMarkets, parseBookTickers};

