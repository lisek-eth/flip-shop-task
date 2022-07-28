# flip-shop-task

```
stack: nodejs, nestjs, nats, mongodb, redis
``` 

Dockerized two microservices, two mongo databases, 
one redis instance and nats for communication between services.

### cron-service
Here is part responsible for scraping API once a minute and sending 
events to transport layer. This service is not exposing any ports. 


```shell
cd ./cron-service && npm run install --force && npm run test
```

### ep-service
Service responsible for consuming events emitted by `cron-service` 
and processing them accordingly. 

```shell
cd ./ep-service && npm run install --force && npm run test
```

This instance is exposing port `3000` and three endpoints, which should be available via `localhost`: 

* `GET /top10-sales-value`
* `GET /top10-orders-count`
* `GET /top10-most-bought`

Once GET request is received endpoints will return data stored in 
Redis.

**Note regarding** `/top10-most-bought`
Current implementations would allow to make easily extension of this method 
and it could be returning top 10 for any given date.

## Installation

To run it you need to have Docker, node v14.18.3. 

Run environment: 

```shell
docker-compose up
```
