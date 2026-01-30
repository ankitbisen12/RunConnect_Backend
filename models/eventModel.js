import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event must have a name"],
      unique: true,
      maxLength: [200, "Event name should not exceed 200 characters"],
      minLength: [10, "Event name should have at least 5 characters"],
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageCover: {
      type: String,
      required: true,
    },
    maxParticipants: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: [true, "Event must have a duration"],
    },
    eventType: {
      type: String,
      required: [true, "Event must have a type"],
      enum: {
        values: ["Running", "Cycling"],
        message: "Event type is either: online, in-person, hybrid",
      },
    },
    price: {
      type: Number,
      required: [true, "Event must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: "Discount price ({VALUE})should be below regular price",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
);

eventSchema.virtual("id").get(function () {
  return this._id;
});

eventSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Event = mongoose.model("Event", eventSchema);
export default Event;
