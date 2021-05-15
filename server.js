const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Set ENV variables from config.env
dotenv.config({path: './config.env'});

const app = require("./app");

const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true
})
    .then(() => console.log('DB connected...'))
    .catch(err => console.log(err));


// Start Server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});