import mongoose, { Schema } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
const subscriptionSchema = new mongoose.Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, //one who is subscribing
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, //one who is being subscribed to
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "user is missing ");
  }

  //writing aggregation pipeline to get subscriber count and isSubscribed field

  const channel = await User.aggregate([
    {
      $match: { username: username.toLowerCase() },
    },
    {
      $lookup: {
        from: "subscriptions", 
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channelIsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] }, //$in checks in array as well as objects
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        channelIsSubscribedToCount: 1,
        avatar: 1,
        subscriberCount: 1,
        isSubscribed: 1,
        coverImage: 1,
        email : 1

      },
     },
  ]);
  if(!channel?.length){
    throw new ApiError (404 , "Channel not found");
  }
  return res
  .status(200)
  .json(new ApiResponse(200, channel[0], "Channel profile fetched successfully");
});

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
