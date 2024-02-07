import express, {Request, Response, NextFunction} from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import {db} from '../db';
import path from 'path';

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

        req.session!.userId = decoded.sub;
        req.session!.accessToken = response.data.access_token;

        // res.cookie('session_token', response.data.access_token, {httpOnly: true, secure: true, sameSite: 'strict'});
        req.session!.save(err => {
            if (err) {
                console.log('Error saving session:', err);
            }

            res.cookie('session_token', response.data.access_token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            });

            const userCollection = db.collection('users');
            userCollection.doc(decoded.sub!).set({
                email: decoded.email,
            }).then(() => {
                res.redirect(process.env.REACT_APP_APP_URL!);
            }).catch((error) => {
                console.error("Error saving user to database", error);
                next(error);
            });
        });

    } catch (error) {
        console.error("Error exchanging auth code for tokens", error);
        next(error);
    }
});

router.post("/disconnect", async (req: Request, res: Response) => {
    delete req.session!.accessToken;

    const userId = req.session!.userId;
    const userCollection = db.collection('users');
    await userCollection.doc(userId).delete();

    const userEventsCollection = db.collection('userEvents').doc(userId).collection('events');
    const events = await userEventsCollection.get();
    const deletePromises = events.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    res.clearCookie('session_token');
    res.sendStatus(200);
});

router.get('/verify-session', (req, res) => {
    const sessionToken = req.cookies['session_token'];
    console.log("sessionToken from cookie:", sessionToken);
    console.log("accessToken from session:", req.session!.accessToken);


    if (!sessionToken || !req.session!.accessToken) {
        return res.sendStatus(401);
    }

    const isValid = sessionToken === req.session!.accessToken;

    if (isValid) {
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});


export default router;