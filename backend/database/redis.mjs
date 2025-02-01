import Redis from "ioredis";

const redisPublisher = new Redis();  
const redisSubscriber = new Redis(); 
redisPublisher.on('connect', () => console.log('✅ Redis Publisher verbunden.'));
redisSubscriber.on('connect', () => console.log('✅ Redis Subscriber verbunden.'));

export { redisPublisher, redisSubscriber };
