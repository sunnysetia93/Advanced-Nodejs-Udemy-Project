const mongoose = require('mongoose');
const exec = mongoose.Query.prototype.exec;
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys')


// const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(keys.redisUrl);

client.hget = util.promisify(client.hget)

// const cachedBlogs = await client.get(req.user.id);

// if(cachedBlogs){
//   console.log('serving from redis')
//   return res.send(JSON.parse(cachedBlogs));
// }

// const blogs = await Blog.find({ _user: req.user.id });
// console.log('serving from mongo')
// res.send(blogs);

// client.set(req.user.id,JSON.stringify(blogs));

mongoose.Query.prototype.cache = function(options = {}){
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || ""); 
    return this;
}

// updating the exec function of mongoose query object to apply caching.
mongoose.Query.prototype.exec = async function(){

    if(!this.useCache){
        return exec.apply(this,arguments);
    }

    console.log('About to run a query');

    // console.log(this.mongooseCollection.name)
    // console.log(this.getQuery());

    const key = JSON.stringify(Object.assign({},this.getQuery(),{
        collection: this.mongooseCollection.name
    }));

    // const cacheValue = await client.get(key);
    const cacheValue = await client.hget(this.hashKey,key);


    if(cacheValue){
        const doc = JSON.parse(cacheValue);
        console.log("cached copy");
        return Array.isArray(doc)
            ? doc.map(d=> new this.model(d))
            : new this.model(doc);
    }
    console.log("from db")

    const result = await exec.apply(this,arguments);
    client.hset(this.hashKey,key,JSON.stringify(result)); //seconds - 10
    return result;
}

function clearHash(hashKey){
    client.del(JSON.stringify(hashKey));
}
module.exports = {
    clearHash
}