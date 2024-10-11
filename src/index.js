// require("dotenv").config({path: ".env"});
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import {app} from "./app.js";
//configuring dotenv
dotenv.config({
    path: "./.env"
});

connectDB()   // asynchronous function always return a promise
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at port : ${process.env.PORT || 8000}`);
    })
})
.catch((error)=>{
    console.log("Database connection failed !!! ", error);
})

// Define a basic route to test
app.get('/', (req, res) => {
    res.send('Hello World!');
});




/*
;( async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error)=>{
            console.log("Error: ", error);
            throw error;
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`app is running on port ${process.env.PORT}`);
        })
    }catch(error){
        console.error("ERROR: ", error)
    }
})()
*/