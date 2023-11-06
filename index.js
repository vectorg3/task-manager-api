import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import { signUpValidation, loginValidation } from './validation.js';
import checkAuth from './utils/checkAuth.js';
import * as UserController from './controllers/UserController.js';
import cors from 'cors';
import helmet from 'helmet';
import https from 'https';

mongoose.set('strictQuery', false);
mongoose
    // .connect(process.env.MONGODB_URI)
    .connect(
        'mongodb+srv://admin:392311@taskmanager.rcddhdh.mongodb.net/Task-Manager?retryWrites=true&w=majority'
    )
    .then(() => {
        console.log('Database Connected');
    })
    .catch((err) => {
        console.log('Database Error', err);
    });

const app = express();

const options = {
    cert: fs.readFileSync('./sslcert/fullchain.pem'),
    key: fs.readFileSync('./sslcert/privkey.pem'),
};

app.use(cors());
app.use(express.json());
app.use(helmet());

app.post('/auth/login', loginValidation, UserController.login);
app.post('/auth/signUp', signUpValidation, UserController.signUp);
app.get('/auth/me', checkAuth, UserController.getMe);
app.put('/tasks', checkAuth, UserController.saveTasks);
app.get('/', (req, res) => {
    res.json({ message: 'hello' });
});

https.createServer(options, app).listen(4444, (err) => {
    if (err) {
        console.log(err);
    }
    console.log('Server started');
});
