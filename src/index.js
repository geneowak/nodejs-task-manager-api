const express = require('express');
require('dotenv').config()
require('./db/mongoose')
const authRouter = require('./routers/auth')
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

console.log(process.env.MONGODB_URL);
console.log(process.env.SENDGRID_API_KEY);
console.log(process.env.JWT_SECRET);
// parse the request info as json
app.use(express.json())

// assing the routes
app.use(authRouter)
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log("Server is running on port " + port);
})