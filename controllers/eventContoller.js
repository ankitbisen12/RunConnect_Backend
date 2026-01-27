import Event from '../models/eventModel.js';
import catchAsync from '../utils/catchAsync.js';
import { getAll, getOne, updateOne, deleteOne, createOne } from '../controllers/handleFactory.js';

//controllers 

export const getEvent = getOne(Event);
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