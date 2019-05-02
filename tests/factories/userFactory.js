const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = () => {

    return new User({}).save();     // create a new object in mongodb with _id property.
}