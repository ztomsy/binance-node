Installation and running

1. Install dependencies
    ``` shell script
    npm install
    ```

2.  Configuraton. 

 - copy config_def.js to .config.js 
     ```shell script
     cp config_def.js  .config.js 
     ``` 
 - set params in .config.js 

3. Create tables
    ``` shell script
    node ./migrate migrate
    ```

4. Links:
 - https://node-postgres.com/guides/project-structure
