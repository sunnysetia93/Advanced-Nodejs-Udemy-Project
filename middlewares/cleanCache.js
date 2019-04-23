const {clearHash} = require('../services/cache');

module.exports = async (req,res,next)=>{

    // Trick: will wait for blog to be posted which is in the next middleware. if successful then perform cache cleaning.
    await next();

    clearHash(req.user.id);
}