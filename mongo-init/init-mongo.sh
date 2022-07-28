#!/usr/bin/env bash

set -eu
mongosh -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD <<EOF

    use $MONGO_INITDB_DATABASE;

    db.createUser({
        user: 'orders_user',
        pwd: 'orders_user123',
        roles: [{
            role: 'readWrite',
            db: '$MONGO_INITDB_DATABASE'
        }]
    });

    show users
EOF
