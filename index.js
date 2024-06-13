const express = require("express");
const path = require('path');
const bodyParser = require('body-parser');
const morgan=require("morgan")
const mongoose = require("mongoose");
// const subdomain=require("express-subdomain");
// const vhost=require('vhost');

// Importer le module cors pour gérery les requêtes Cross-Origin Resource Sharing (CORS)
const cors = require("cors");


// Importer les routes
// const  dailyPassRoutes = require('./routers/DailyPass.routes')
const  usersRoutes = require('./routers/Users.routes')
const  passwordRoutes = require('./routers/Password.routes')
const dailypassRoutes=require('./routers/DailyPass.routes')
const  associationRoutes = require('./routers/Association.routes');
const  operaitonRoutes = require('./routers/Operation.routes');
const { schedule } = require("./controllers/scheduler");
//

//create an instance of the Express application
const app = express()
//Middleware for JSON parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('combined'))

// app.use(fileUpload());

//Enables secure cross-origin resource sharing in web
app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
}));




//routes
// app.use(dailyPassRoutes)

app.use(usersRoutes)
app.use(passwordRoutes)
app.use(associationRoutes)
app.use(dailypassRoutes)
app.use(operaitonRoutes)
app.use('/uploads', express.static('uploads'))

// app.use(express.static(path.join(__dirname, "public")));

app.use((req,res)=>{
  return res.status(404).json({message:'Url not found!'})
})



//connect to database distribution_repas_handicapes
mongoose.connect("mongodb://localhost:27017/distribution_repas_handicapes", {
  
}).then(() => {
  console.log('Database connected successfully.');
}).catch((err) => {
  console.log(`Error while connecting to database.${err}`);
});

// restaurer le pass à 3 chaque jours
schedule();


//conx serveur
app.listen(3001, () => {
  console.log("I am listening in port 3001");
})

