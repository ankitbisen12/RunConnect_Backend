import express from 'express';
import morgan from 'morgan';
import eventRouter from './routes/eventRoutes.js';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app = express();

const limiter = rateLimit({
  max: 5,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
})

//Global Middlewares
//Set security HTTP headers
app.use(helmet());

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());


//Routers
app.use('/api/v1/events', eventRouter);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  next();
});

// app.all('*', (req, res, next) => {
//     next(new Error(`Can't find url on this server!`));
// });


export default app;