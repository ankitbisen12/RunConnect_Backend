import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import crypto from "crypto";
import { createHashData } from "../utils/common";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Please provide your email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"],
    },
    photo: String,
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minLength: [10, "Password must be at least 8 characters long"],
        select: false,
    },
    confirmPassword: {
        type: String,
        required: [true, "Please confirm your password"],
        //This only works on CREATE and SAVE!!!
        validate: {
            validator: function (el) {
                return el === this.password; /// password == passwordConfirm
            },
            message: "Passwords are not the same!",
        },
    },
    role: {
        type: String,
        enum: ["user", "admin", "organizer"],
        default: "user",
    },
    active: {
        type: Boolean,
        default: true,
        select: false    /// hide from output
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
});

//Document middleware.
userSchema.pre("save", async function (next) {
    //if Password is not modified then skip hashing.
    if (!this.isModified("password")) return next();

    //Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    //delete confirmPassweord field. Need just for verification.
    this.confirmPassword = undefined;
    next();
});

userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000; //to capture password change time.
    next();
});

userSchema.pre(/^find/, function () {
    this.find({ active: { $ne: false } });
    next();
});

//Instance method.
//at the time of login, checking login password and saved password is matching or not.
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const chnagedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return JWTTimestamp < chnagedTimeStamp; //if JWT tooken issued time is less than password changed i.e password changed after token is issued.
    }

    return false; //password not changed
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = createHashData(resetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10 minutes from now.

    console.log({ resetToken }, this.passwordResetToken);
    return resetToken;
};

const User = mongoose.model("User", userSchema);

export default User;
