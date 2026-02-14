import express from 'express';
import { deleteEvent, getAllEvents, getEvent, updateEvent, createEvent, aliasRecentEvents } from '../controllers/eventController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

router.route("/").get(getAllEvents);

//fetch just 3 upcoming tours.
router.route("/upcoming-3-events").get(aliasRecentEvents, getAllEvents);

// router.route('/').get(getAllEvents).post(protect, restrictTo('admin', 'organizer'), createEvent);

router.route('/:id').get(getEvent).patch(updateEvent).delete(deleteEvent);

export default router;