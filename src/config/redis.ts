import Redis from "ioredis";

const RedisClient = ()=>{
    if(process.env.REDIS_URL){
        console.log('Redis is connected');
        return process.env.REDIS_URL;
    }
    throw new Error('Redis is connection faild');
}

export const redis= new Redis(RedisClient());