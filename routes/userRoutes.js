import express from 'express';
import { getAllUsers, getUser, updateProfile, deleteProfile } from '../controllers/userController.js';
import { signUp, login, forgotPassword, resetPassword, updatePassword, protect } from '../controllers/authController.js';
import { restrictTo } from '../controllers/authContoller.js';

const router = express.Router();

//Route definitions

router.post('/signup', signUp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);


//TODO: Protect all routes for logged in users only
router.use(protect);
router.patch('/update-profile', updateProfile);
router.delete('/delete-profile', deleteProfile);
router.patch('/updatemy-password', updatePassword);


//TODO: Restrict all routes below to admin only
router.use(restrictTo('admin'));
router.route('/').get(getAllUsers);
router.route('/:id').get(getUser);

export default router;