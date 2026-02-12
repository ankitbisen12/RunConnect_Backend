import express from 'express';
import morgan from 'morgan';
import eventRouter from './routes/eventRoutes.js';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import globalErrorHandler from './controllers/errorController.js';

const app = express();
//Global Middlewares
//Set security HTTP headers
app.use(helmet());

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());


//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

//Prevent Parameter Pollution
app.use(hpp(
  // {
  //   whitelist: ['duration']
  // }
));

//Routers
app.use('/api/v1/events', eventRouter);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  next();
});

// app.all('*', (req, res, next) => {
//     next(new AppError(`Can't find ${req.originalUrl} on this server!`,404));
// });

app.use(globalErrorHandler);

export default app;