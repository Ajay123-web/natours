const mongoose = require('mongoose');
const dotenv = require('dotenv');

//handling synchronus errors
process.on('uncaughtException', (err) => {
  console.log(err);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app.js');
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then((con) => {
    //console.log(con.connections);
    console.log('DB connection Successful');
  });

//console.log(process.env);

// START SERVER
const port = 3000;

const server = app.listen(port, () => {
  console.log(`App running on port no. ${port}`);
});

//handling all rejected promises which were not handled yet
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    //we dont shut the application abruply
    process.exit(1);
  });
});
