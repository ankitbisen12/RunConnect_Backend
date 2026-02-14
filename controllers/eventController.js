import Event from '../models/eventModel.js';
import catchAsync from '../utils/catchAsync.js';
import { getAll, getOne, updateOne, deleteOne, createOne } from './handleFactory.js';

//controllers 

export const getEvent = getOne(Event);

export const aliasRecentEvents = catchAsync(async (req, res, next) => {
    const now = new Date().toISOString();

    req.url = "/?sort=-startDate,maxParticipants&limit=3";

    //TODO: Replace below line later.
    // req.url = `/?startDate[gte]=${now}&sort=startDate&limit=3`;

    next();
});

export const getAllEvents = getAll(Event);
export const createEvent = createOne(Event);
export const updateEvent = updateOne(Event);
export const deleteEvent = deleteOne(Event);

export const getEventByCity = catchAsync(async (req, res, next) => {
    const { city } = req.params;

    const events = await Event.find({ city });
    //   .sort('-ratingsAverage');

    res.json({
        status: 'success',
        resultLength: events.length,
        data: events
    });
});

