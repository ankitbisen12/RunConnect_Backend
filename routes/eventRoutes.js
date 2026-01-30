import express from 'express';
import { deleteEvent, getAllEvents, getEvent, updateEvent, createEvent } from '../controllers/eventContoller.js';

const router = express.Router();

router.route('/').get(getAllEvents).post(createEvent);

router.route('/:id').get(getEvent).patch(updateEvent).delete(deleteEvent);

export default router;