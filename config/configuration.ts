export const configuration = () => ({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10) || 3001,
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
  kafka: {
    brokers: process.env.KAFKA_BROKERS.split(' '),
  },
});
