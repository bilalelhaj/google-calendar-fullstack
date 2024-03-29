import dotenv from "dotenv";
import {errorHandler} from './middleware/errorHandler';
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import userRoutes from './routes/user';
import path from "path";

dotenv.config({path: path.resolve(__dirname, '../.env')});

const app = express();

app.use(cors({
    origin: (origin, callback) => {
        if (origin === undefined) {
            callback(null, process.env.REACT_APP_API_URL);
        } else {
            callback(null, origin);
        }
    },
    credentials: true,
}));

app.use(cors({
    origin: process.env.REACT_APP_APP_URL,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', '*'],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 8000;

app.use('/user', userRoutes);
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;