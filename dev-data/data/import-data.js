import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
// import User from '../../models/userModel.js';
import Event from '../../models/eventModel.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../config.env') });

const DB = process.env.DATABASE.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD,
);


mongoose.connect(DB).then(() => {
    console.log('DB connection successful!');
}).catch(err => {
    console.error('DB connection error:', err);
});


//Read JSON files
const events = JSON.parse(fs.readFileSync(path.join(__dirname, 'events.json'), 'utf-8'));


//Insert data into DB
const importData = async () => {
    try {
        await Event.create(events);
        console.log('Data succesfully added');
    }
    catch (err) {
        console.log(err);
    }
    process.exit();
}

//Delete all data from DB
const deleteData = async () => {
    try {
        await Event.deleteMany();
        console.log('Data succesfully deleted');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

if (process.argv[2] === '--import') {
    importData();
}
else if (process.argv[2] === '--delete') {
    deleteData();
}