import express, {Request, Response, NextFunction} from 'express';
import {db} from '../db';
import {fetchAndStoreEvents} from '../eventHelpers';

const router = express.Router();

router.get('/get-user-email', async (req, res) => {
    if (!req.session!.accessToken || !req.session!.userId) {
        return res.status(401).send("Unauthorized");
    }

    const userId = req.session!.userId;
    const userCollection = db.collection('users');
    const userDoc = await userCollection.doc(userId).get();
    const user = userDoc.data();

    if (user) {
        res.json({email: user.email});
    } else {
        res.status(404).send("User not found");
    }
});

router.get('/get-db-events', async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session!.accessToken || !req.session!.userId) {
        return res.status(401).send("Unauthorized");
    }

    const userId = req.session!.userId;
    const accessToken = req.session!.accessToken;

    try {
        await fetchAndStoreEvents(userId, accessToken);

        const userEventsCollection = db.collection('userEvents').doc(userId).collection('events');
        const eventsSnapshot = await userEventsCollection.get();
        const events = eventsSnapshot.docs.map(doc => doc.data());

        res.json(events);
    } catch (error) {
        console.error("Error fetching events", error);
        next(error);
    }
});

export default router;