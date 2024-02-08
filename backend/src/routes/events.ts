import express, {NextFunction, Request, Response} from "express";
import {fetchAndStoreEvents} from '../eventHelpers';
import {sessionHandler} from "../middleware/sessionHandler";

const router = express.Router();

router.use(sessionHandler);

router.get("/get-events", async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers['x-access-token'] || !req.headers['x-user-id']) {
        return res.status(401).send("Unauthorized");
    }

    const userId = req.headers['x-user-id'] as string;
    const accessToken = req.headers['x-access-token'] as string;

    try {
        const events = await fetchAndStoreEvents(userId, accessToken);
        res.json(events);
    } catch (error) {
        console.error("Error fetching events", error);
        next(error);
    }
});

export default router;