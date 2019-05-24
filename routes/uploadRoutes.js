const AWS = require('aws-sdk');
const keys = require('../config/keys')
const uuid = require('uuid/v1');
const requireLogin = require('../middlewares/requireLogin')

const s3 = new AWS.S3({
    accessKeyId:keys.accessKeyId,
    secretAccessKey:keys.secretAccessKey,
    region:"ap-south-1"
})

module.exports = app => {
    app.get('/api/upload', requireLogin, (req,res)=>{

        const key = `${req.user.id}/${uuid()}.jpeg`

        s3.getSignedUrl('putObject',{
            Bucket:'sunny-blog-bucket',
            ContentType:'image/jpeg',
            Key:key
        }, (e,url)=>{
            res.send({key,url})
        })
    })
}