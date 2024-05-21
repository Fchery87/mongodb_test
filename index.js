import express from 'express';
import dotenv from 'dotenv';
import gradesRouter from './routes/grades.js';
import usersRouter from './routes/users.js';

// Inits the DOTenv package
dotenv.config();

//App Port
const PORT = process.env.PORT || 4000;

// Express App
const app = express();

//! ============== MiddleWares ==============

// JSON Parser
app.use(express.json());

// Custom Logger Middleware
app.use((req, res, next) => {
  console.log('Request from url: ' + req.url);
  next();
});

//! ============== Routes ==============
//+ GET
app.get('/', (req, res) => {
  res.send('Welcome to the API.');
});

app.use('/grades', gradesRouter);
app.use('/users', usersRouter);

//+ Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send('Server Error!');
});

//+ Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
