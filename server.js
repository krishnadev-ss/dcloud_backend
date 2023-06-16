const app = require("./app")


const PORT = 8000;
const server = app.listen(PORT, (req, res) => {
    console.log(`starting server on ${PORT}`)
})
