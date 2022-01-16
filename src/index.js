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
    console.error(JSON.stringify(err));
    console.error(JSON.stringify(client));
    process.exit()


}) ;

pool.on('acquire', (client) => {
    console.log("PG: Client aquired from Pool");
});

pool.on('remove', (client) => {
    console.log("PG: Client REMOVED from Pool");
});

// check db connection
pool.query('SELECT NOW()', (err, res) => {
    if (err){
        console.error("DB Error:", err)
        process.exit(1)
    }
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

            let requestsStored = 0 
            let errors = 0 

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
                        
                        console.log("-----");                            
                        console.log(timestampToSave.toISOString());
                        console.log(`Last message received: ${timeDiff} ms`);

                        counter++;
                        timeFromStart = nowTimestamp - timeStart;

                        
                        console.log(`Saved: ${requestsStored}/${counter}. Errors ${errors} Stored Per Second: ${requestsStored/(timeFromStart/1000)}  `);

                        try {

                            let bookTicker = binance.parseBookTickers(JSON.parse(data));
                            // console.log(JSON.stringify(bookTicker));


                            pool.query(' INSERT INTO tickers(timestamp, exchange, symbol, ask, ask_quantity, ' +
                                'bid, bid_quantity) VALUES( $1, $2, $3, $4, $5, $6, $7)',
                                [timestampToSave, "binance", bookTicker.symbol, bookTicker.ask,
                                bookTicker.askVolume, bookTicker.bid, bookTicker.bidVolume],
                                (err, res) =>{
                                    if (!err) {
                                    requestsStored++ }
                                    else{
                                        errors++
                                        console.error(err)
                                        console.error([timestampToSave, "binance", bookTicker.symbol, bookTicker.ask,
                                        bookTicker.askVolume, bookTicker.bid, bookTicker.bidVolume])
                                        
                                    }
                                    // console.log(`Request # ${counter} added  `);
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
