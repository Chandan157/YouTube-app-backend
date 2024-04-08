import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//toggle like on video
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const likedAlready = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (likedAlready) {
    await Like.findByIdAndDelete(likedAlready?._id);

    return res.status(200).json(new ApiResponse(200, { isLiked: false }));
  }

  await Like.create({
    video: videoId,
    likedBy: req.user?._id,
  });

  return res.status(200).json(new ApiResponse(200, { isLiked: true }));
});

//toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  const likedAlready = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (likedAlready) {
    await Like.findByIdAndDelete(likedAlready?._id);

    return res.status(200).json(new ApiResponse(200, { isLiked: false }));
  }

  await Like.create({
    comment: commentId,
    likedBy: req.user?._id,
  });

  return res.status(200).json(new ApiResponse(200, { isLiked: true }));
});

//toggle like on tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweetId");
  }

  const likedAlready = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  if (likedAlready) {
    await Like.findByIdAndDelete(likedAlready?._id);

    return res
      .status(200)
      .json(new ApiResponse(200, { tweetId, isLiked: false }));
  }

  await Like.create({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  return res.status(200).json(new ApiResponse(200, { isLiked: true }));
});

//get all liked videos
const getLikedVideos = asyncHandler(async (req, res) => {
  console.log("video fetch");

  try {
    const allLikedVideos = await Like.aggregate([
      {
        $match: {
          video: {
            $exists: true,
          },
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "videos",
          pipeline: [
            {
              $match: {
                isPublished: true,
              },
            },
            {
              $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
                pipeline: [
                  {
                    $count: "totalLikes",
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "videoOwner",
                pipeline: [
                  {
                    $project: {
                      username: 1,
                      email: 1,
                      fullName: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                likes: {
                  $first: "$likes.totalLikes",
                },
                videoOwner: {
                  $first: "$videoOwner",
                },
              },
            },
            {
              $project: {
                _id: 1,
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                createdAt: 1,
                views: 1,
                likes: 1,
                videoOwner: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          videos: {
            _id: 1,
            videoFile: 1,
            thumbnail: 1,
            title: 1,
            description: 1,
            duration: 1,
            createdAt: 1,
            views: 1,
            likes: 1,
            videoOwner: 1,
          },
        },
      },
    ]);

    if (allLikedVideos.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Nobody liked any video till now."));
    } else {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            allLikedVideos,
            "All liked video fetched from database."
          )
        );
    }
  } catch (error) {
    throw new ApiError(
      500,
      `"Getting error in fetching the videos from database. error is ${error}"`
    );
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
