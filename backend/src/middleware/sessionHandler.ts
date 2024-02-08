import {NextFunction, Request, Response} from "express";
import {unsign} from "../modules/security/cookie-signature-edge";
import {sessionSecret} from "../constants";
import {SessionKey} from "../modules/security/cookie-session/constants";

export const sessionHandler = async (req: Request, res: Response, next: NextFunction) => {
    const sessionToken = req.cookies[SessionKey];

    if (!sessionToken) {
        return res.sendStatus(401);
    }

    // Verify the sessionToken with your secret key
    const sessionData_base64 = await unsign(sessionToken, sessionSecret)


    if (!sessionData_base64) {
        return res.sendStatus(401);
    }

    const sessionData_AsString = atob(sessionData_base64 as string);


    try {
        const sessionData = JSON.parse(sessionData_AsString);
        req.headers['x-user-id'] = sessionData.userId;
        req.headers['x-access-token'] = sessionData.accessToken;
        // req.session!.userId = sessionData.userId;
        // req.session!.accessToken = sessionData.accessToken;
    } catch (e) {
        console.error(e)
        return res.sendStatus(401);
    }

    next();
};