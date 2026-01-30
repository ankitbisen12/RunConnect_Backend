import express from 'express';
import { deleteEvent, getAllEvents, getEvent, updateEvent, createEvent } from '../controllers/eventContoller.js';
import { protect, restrictTo } from '../controllers/authContoller.js';

const router = express.Router();

router.route('/').get(getAllEvents).post(protect, restrictTo('admin', 'organizer'), createEvent);

router.route('/:id').get(getEvent).patch(updateEvent).delete(deleteEvent);

export default router;