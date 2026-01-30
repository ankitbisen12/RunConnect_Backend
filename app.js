import express from 'express';
import morgan from 'morgan';
import eventRouter from './routes/eventRoutes.js';
import cors from 'cors';

const app = express();


//Global Middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());


//Routers
app.use('/api/v1/events', eventRouter);

// app.all('*', (req, res, next) => {
//     next(new Error(`Can't find url on this server!`));
// });


export default app;