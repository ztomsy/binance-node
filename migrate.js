// migrate.js
var path = require('path');
var parse = require('pg-connection-string').parse;

const requiredConfigParams = ["PG_CONNECT_URL"];

try {
    var config = require("./.config");

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



const pgConfig = parse(config.PG_CONNECT_URL);


require('sql-migrations').run({
    // configuration here. See the Configuration section

    migrationsDir: path.resolve(__dirname, 'migrations'), // This is the directory that should contain your SQL migrations.
    host: pgConfig["host"], // Database host
    port: pgConfig["port"], // Database port
    db: pgConfig["database"], // Database name
    user: pgConfig["user"], // Database username
    password: pgConfig["password"], // Database password
    adapter: 'pg', // Database adapter: pg, mysql
    // Parameters are optional. If you provide them then any occurrences of the parameter (i.e. FOO) in the SQL scripts will be replaced by the value (i.e. bar).
    // parameters: {
    //     "FOO": "bar"
    // },
    // minMigrationTime: new Date('2018-01-01').getTime() // Optional. Skip migrations before this before this time.

});
