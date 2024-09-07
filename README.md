# Requirement
    - Docker version 24.0.5
    - Docker Compose version v2.20.2-desktop.1
    - nodejs >22.0
    - yarn 1.22.22
# database
    - create .env follow :
        POSTGRES_HOST=localhost
        POSTGRES_USER=bcf
        POSTGRES_PASSWORD=bcf
        POSTGRES_DB=bcf
        POSTGRES_PORT=5432
        REDIS_PORT=6379
    - in root directory
        - to run database : sh run.sh
        - to drop database : sh drop.sh
# Server-tiles
    - cd server-tile
    - create .env in root directory ( same .env.example )
    - install dependency/devDependency : 
    yarn install
    - drop drizzle generate sql : 
    yarn drop
    - drizzle generate sql :
    yarn gen
    - drizzle migrate sql :
    ```
    yarn mig
    ```
    - run development :
    ```
    yarn dev
    ```
# room-server for socket io
    - cd room-server
    - create .env in root directory ( same .env.example )
    - install dependency/devDependency : 
    ```
    yarn install
    ```
    - run development :
    ```
    yarn dev
    ```
# peer-server for peerjs
    - cd peer-server
    - create .env in root directory ( same .env.example )
    - install dependency/devDependency : 
    ```
    yarn install
    ```
    - run development :
    ```
    yarn dev
    ```
# website
    - cd website
    - create .env in root directory ( same .env.example )
    - install dependency/devDependency : 
    ```
    yarn install
    ```
    - run development  3 server "server-tile","peer-server" and "room-server" first
    - run development :
    ```
    yarn dev
    ```

    
