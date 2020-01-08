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
