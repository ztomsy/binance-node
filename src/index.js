const WebSocket = require('ws');
const binance = require("./binance");

const { Pool} = require('pg');


const requiredConfigParams = ["PG_CONNECT_URL"];

// loading config and check required params
try {
     var config = require("../.config");

    for( let configParam of requiredConfigParams ){
        if (eval( "config."+configParam) === undefined )
        {
            throw {message: "No " + configParam + " in config. Check config_def.js for required parameters!"}
        }
    }
}
catch(e){
    if (e.code ===  'MODULE_NOT_FOUND') {

        console.log("No .config.js file found! Rename config_def.js to .config.js");
    }

    else{
        console.log(e.message);
    }
    process.exit();
}

// init DB
const pool = new Pool({
    connectionString: config.PG_CONNECT_URL,
});

pool.on("connect", connection => {
    console.log("New PG pool client connected " );
} );

pool.on('error', (err, client) => {

    console.log("PG ERROR");
    console.log(JSON.stringify(err));
    console.log(JSON.stringify(client));

}) ;

pool.on('acquire', (client) => {
    console.log("PG: Client aquired from Pool");
});

pool.on('remove', (client) => {
    console.log("PG: Client REMOVED from Pool");
});


pool.query('SELECT NOW()', (err, res) => {
    console.log(err, res);
});


// init websockets
const ws = new WebSocket('wss://stream.binance.com:9443/ws/!bookTicker');


ws.on('open',
    function open() {
        console.log("Socket Connected");
        // ws.send('something');
    }
);

ws.on('error',
    (error)=> {
        console.log("Socket error");
        console.log(error);
    }
);


binance.loadStandardMarkets()
    .then((res) => {
            console.log("Markets loaded");

            let prevTimestamp;
            let nowTimestamp;
            let timeDiff;
            let ticker;
            let counter = 0;

            let markets = res;
            let timeStart = Date.now();
            let timeFromStart = 0;

            ws.on('message', function incoming(data) {

                    if (!markets) {
                        console.log(".. markets not loaded");
                        return
                    }

                    try {
                        ticker = JSON.parse(data);
                    }

                    catch {
                        console.log("ERROR Parsing data");
                    }

                        nowTimestamp = Date.now();
                        let timestampToSave = new Date(nowTimestamp);

                        //let currentTS = new Date(Date.UTC());
                        timeDiff = nowTimestamp - prevTimestamp;
                        prevTimestamp = nowTimestamp;

                        console.log(nowTimestamp.toLocaleString());
                        console.log(`Time-diff: ${timeDiff} ms`);

                        counter++;
                        timeFromStart = nowTimestamp - timeStart;

                        console.log("-----");
                        console.log(`Time from start: ${timeFromStart} ms. Events: ${counter}.`);

                        try {

                            let bookTicker = binance.parseBookTickers(JSON.parse(data));
                            console.log(JSON.stringify(bookTicker));


                            pool.query(' INSERT INTO tickers(timestamp, exchange, symbol, ask, ask_quantity, ' +
                                'bid, bid_quantity) VALUES( $1, $2, $3, $4, $5, $6, $7)',
                                [timestampToSave, "binance", bookTicker.symbol, bookTicker.ask,
                                bookTicker.askVolume, bookTicker.bid, bookTicker.bidVolume],
                                (err, res) =>{
                                    console.log(`Request # ${counter} added`);
                                    console.log(err);
                                    // console.log(res);
                                });


                        } catch(e) {

                            if (e !== undefined ) {
                                console.log("Error:");
                                console.log(e);
                            }
                        }
                }
            );
        },

        (err) => {
            console.log("Could not load markets");
        });
