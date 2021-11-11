require('dotenv').config();

const PORT = process.env.PORT || 4000;

module.exports = {
    app: {
        app_name: process.env.APP_NAME || 'star-wars-backend',
        environment: process.env.NODE_ENV || 'development',
        company_name: process.env.COMPANY_NAME || 'star-wars',
        encryption_key: process.env.SERVER_SECRET || 'appSecret',
        base_url: process.env.BASE_URL || `http://localhost:${PORT}`,
        port: PORT,
    },
    services: {
        starWars: process.env.Mortfi || 'StarWars',

    },
    databases: {
        typeorm: {
            host: process.env.DB_HOST || '',
            dbName: process.env.DB_NAME || '',
            password: process.env.DB_PASSWORD || '',
            user: process.env.DB_USER || '',
        }
    },
    api: {
        lang: 'en',
        prefix: '^/api/v[1-9]',
        versions: [1],
        pagination: {
            itemsPerPage: 10,
        },
        obscureData: false,
        star_wars: {
            base_url: process.env.STAR_WARS_BASE_URL || '',
        }
    },
    redis: {
        url: process.env.REDIS_URL || '',
        password: process.env.REDIS_PASSWORD || '',
        port: process.env.REDIS_PORT || 0000,
    }

};