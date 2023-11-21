const mongoose = require('mongoose');
const mongourl = ('mongodb://localhost:27017/flashmybtc');

const connecttodb = () => {
    mongoose.connect(mongourl).then(()=>{
        console.log("connection Successfull")
    }).catch((error)=>{
        console.log('Connection Failed Due To: ',error)
    })
}
module.exports = connecttodb;