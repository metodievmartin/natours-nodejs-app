const app = require("./app");

// Start Server
const port = 5000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});