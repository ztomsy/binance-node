const WebSocket = require('ws');

const ws = new WebSocket('wss://stream.binance.com:9443/ws/!bookTicker');

ws.on('open', function open() {
    console.log("Connected");

    // ws.send('something');
    let prev_time;
    let cur_time;
    let time_diff;
    let ticker;

    ws.on('message', function incoming(data) {

        try {
            ticker = JSON.parse(data);

        }
        catch {
            console.log("ERROR Parsing data");
        }
        if (ticker.s === "BTCUSDT") {

            cur_time = Date.now();
            time_diff = cur_time - prev_time;
            prev_time = cur_time;

            console.log(cur_time.toLocaleString());
            console.log("Time-diff : " + time_diff);
            try {
                console.log(JSON.stringify(data));
                console.log("-----");
            } catch {
                console.log("Error");
            }

        }

    });



});
