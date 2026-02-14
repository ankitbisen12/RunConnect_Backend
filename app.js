import express from 'express';
import morgan from 'morgan';
import eventRouter from './routes/eventRoutes.js';
import userRouter from './routes/userRoutes.js';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import globalErrorHandler from './controllers/errorController.js';
import cookieParser from 'cookie-parser';

const app = express();
//Global Middlewares
//Set security HTTP headers
// app.use(helmet());

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

//Data sanitization against NoSQL query injection
// app.use(mongoSanitize());

// //Data sanitization against XSS
// app.use(xss());

// //Prevent Parameter Pollution
// app.use(hpp(
//   // {
//   //   whitelist: ['duration']
//   // }
// ));

//Routers
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/user', userRouter);

app.use((req, res, next) => {
  // console.log("---- Incoming Request ----");
  // console.log("Method:", req.method);
  // console.log("URL:", req.originalUrl);
  // console.log("Body:", req.body);
  // console.log("--------------------------");
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  next();
});

// app.all('*', (req, res, next) => {
//     next(new AppError(`Can't find  on this server!`,404));
// });

app.use(globalErrorHandler);

export default app;