import express, {Request, Response, NextFunction} from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import {db} from '../db';
import path from 'path';
import {sign} from '../modules/security/cookie-signature-edge'
import {SessionKey} from '../modules/security/cookie-session/constants'
import {sessionSecret} from '../constants'
import {sessionHandler} from "../middleware/sessionHandler";

dotenv.config({path: path.resolve(__dirname, '../../.env')});

const scopes = [
    "https://www.googleapis.com/auth/calendar",
    "openid",
    "email",
    "profile"
];

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${
        process.env.GOOGLE_CLIENT_ID
    }&redirect_uri=${encodeURIComponent(
        process.env.GOOGLE_REDIRECT_URI!
    )}&scope=${encodeURIComponent(
        scopes.join(" ")
    )}&access_type=offline&prompt=consent`;

    res.redirect(authUrl);
});

router.get("/oauth-callback", async (req: Request, res: Response, next: NextFunction) => {
    const code = req.query.code;

    try {
        const response = await axios.post(
            "https://oauth2.googleapis.com/token",
            {
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                grant_type: "authorization_code",
            },
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        const idToken = response.data.id_token;
        const decoded = jwt.decode(idToken) as jwt.JwtPayload;

        const sessionData = {
            userId: decoded.sub,
            accessToken: response.data.access_token
        }

        res.cookie(SessionKey, await sign(btoa(JSON.stringify(sessionData)), sessionSecret), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            priority: 'high'
        });

        const userCollection = db.collection('users');
        await userCollection.doc(decoded.sub!).set({
            email: decoded.email,
        });

        res.redirect(process.env.REACT_APP_APP_URL!);

    } catch (error) {
        console.error("Error exchanging auth code for tokens", error);
        next(error);
    }
});

router.post("/disconnect", sessionHandler, async (req: Request, res: Response) => {
    delete req.headers['x-access-token'];

    const userId = req.headers['x-user-id'] as string;

    const userCollection = db.collection('users');
    await userCollection.doc(userId).delete();

    const userEventsCollection = db.collection('userEvents').doc(userId).collection('events');
    const events = await userEventsCollection.get();
    const deletePromises = events.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    res.clearCookie(SessionKey);
    res.sendStatus(200);
});

router.get('/verify-session', sessionHandler, async (req, res) => {
    res.sendStatus(200);
});


export default router;