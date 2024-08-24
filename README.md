# Requirement
    - Docker version 24.0.5
    - Docker Compose version v2.20.2-desktop.1
    - nodejs >22.0
    - yarn 1.22.22
# Server-tiles
    - cd server-tile
    - create .env in root directory ( same .env.example )
    - install dependency/devDependency : 
    ```
    yarn install
    ```
    - drop drizzle generate sql : 
    ```
    yarn drop
    ```
    - drizzle generate sql :
    ```
    yarn gen
    ```
    - drop postgresql in docker if it's existed : 
    ```
    sh drop.sh
    ``` 
    - run postgresql in docker if it's not existed : 
    ```
    sh run.sh
    ``` 
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

    
