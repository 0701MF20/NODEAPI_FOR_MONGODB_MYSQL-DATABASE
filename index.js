const express = require("express");
const mysql = require("mysql2");
const config = require("config");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const router = require("./routes/EmployeeAPI");
const mongorouter=require("./routes/MongoDBAPI")
// const mongoRoutes=require("./routes/mongoRoutes")
// const mongosRouter=require('./routes/mongoRoutes')

app.use(cors());
app.use(express.json());
const dbConfig = config.get("db");
const db = mysql.createConnection({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
});


// MongoDB connection
mongoose.connect('mongodb://localhost:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use((req,res,next)=>{
    req.db=db;
    // req.db2=db2;
    next()
})
app.use("/crud", router);
app.use("/mongo", mongorouter);
// app.use("/mongos",mongosRouter)
app.listen(3000, () => console.log("listen now."));
