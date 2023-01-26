import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv'
import * as MySQLConnector from '../src/utils/mysql.connector';
import routes from "../src/api/routes"
import errorController from './utils/error.controller';
import path from "path"
import cors from "cors"
dotenv.config({
    path: "./config.env"
  })

const app = express();
const port = 8080;
// create database pool
MySQLConnector.init();

// app.get('/', (req: Request, res: Response) => {
//   res.send('Hello Worldsssssss');
// });
// parse incoming request body and append data to `req.body`
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// app.enable('trust proxy');
var corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
app.use("*",cors(corsOptions))
app.use('/api/', routes);

app.use(errorController)

app.listen(port, () => {
  console.log(`Example app listeningsssssssts at http://localhost:${port}`)
});