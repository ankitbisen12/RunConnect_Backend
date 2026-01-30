import express from 'express';
import { getAllUsers, getUser, updateProfile, deleteProfile } from '../controllers/userController.js';
import { signUp, login } from '../controllers/authController.js';

const router = express.Router();

//Route definitions

router.post('/signup', signUp);
router.post('/login', login);

//TODO: Protect all routes for logged in users only
router.patch('/update-profile', updateProfile);
router.delete('/delete-profile', deleteProfile);

//TODO: Restrict all routes below to admin only
router.route('/').get(getAllUsers);

router.route('/:id').get(getUser);

export default router;