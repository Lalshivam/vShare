import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials : true
}))

// limit the data coming from json to db
app.use(express.json({limit: "16kb"}))

// limit the data coming from url to db
app.use(express.urlencoded({extended:true, limit:"16kb"}))

//public assests like pdf 
app.use(express.static("public"))

//cred operations on cookie
app.use(cookieParser())


export { app }  