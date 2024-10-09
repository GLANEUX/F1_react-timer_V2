import express from 'express';
import dotenv from 'dotenv';
import connectToDatabase from './configs/database.config';

import userRoute from './routes/user.router';
import timerRoute from './routes/timer.router';

dotenv.config();

const app = express();

if (!process.env.PORT) {
  throw new Error('PORT is not defined in the environment variables');
}

const port = parseInt(process.env.PORT, 10);

connectToDatabase();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/users', userRoute);
app.use('/', timerRoute);

// Démarrage du serveur
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export { app, server };  // Exporter le serveur pour fermer lors des tests
