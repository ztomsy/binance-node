Installation and running

## Create database

```sql

CREATE TABLE tickers (
	id serial NOT NULL,
	"timestamp" timestamptz NULL,
	exchange varchar(10) NULL,
	symbol varchar(10) NULL,
	ask float8 NULL,
	ask_quantity float8 NULL,
	bid float8 NULL,
	bid_quantity float8 NULL,
	CONSTRAINT tickers_pkey PRIMARY KEY (id)
);

CREATE INDEX tickers_timestamp_idx ON public.tickers USING btree ("timestamp", exchange, symbol);

```


## Config 

```
# copy src/config_def.js to .config.js 
cp src/config_def.js .config.js 

# set params in .config.js 
```

## Docker 

```
# build
docker build . -t binance-tickers

# run for windows powershell / bash
docker run -v ${PWD}:/usr/src/app --name binance-tickers -d  binance-tickers

# for windows cmd 
docker run -v %cd%:/usr/src/app --name binance-tickers -d  binance-tickers

# stopping
docker stop binance-tickers
docker start binance-tickers

```

## Local/Dev usage

Node 16

1. Install dependencies
    ```
    npm install
    ```

2.  Configuration. 

 - copy src/config_def.js to .config.js 
     ```
     cp src/config_def.js .config.js 
     ``` 
 - set params in .config.js 

3. Create tables
    ```
    node ./migrate migrate
    ```

4. Links:
 - https://node-postgres.com/guides/project-structure


