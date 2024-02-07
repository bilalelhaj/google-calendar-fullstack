import express, {NextFunction, Request, Response} from "express";
import {fetchAndStoreEvents} from '../eventHelpers';

const router = express.Router();

router.get("/get-events", async (req: Request, res: Response, next: NextFunction) => {
    console.log("accessToken from session:", req.session!.accessToken);
    console.log("userId from session:", req.session!.userId);
    if (!req.session!.accessToken || !req.session!.userId) {
        return res.status(401).send("Unauthorized");
    }

    const userId = req.session!.userId;
    const accessToken = req.session!.accessToken;

    try {
        const events = await fetchAndStoreEvents(userId, accessToken);
        res.json(events);
    } catch (error) {
        console.error("Error fetching events", error);
        next(error);
    }
});

export default router;