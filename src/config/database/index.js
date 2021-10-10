const mongoose = require('mongoose')

const connect = () => {
    mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, function (error) {
        if(error) {
            console.error(`❌ Connect database failed!\nError: '${error}'`)
        } else console.log("✅ Connected database successfully!.")
    });
}

module.exports = {connect}