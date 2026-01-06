import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const generateAccessAndRefreshTokens = async (userID) => {
  try {
    const user = await User.findById(userID);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
     
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    
    return { accessToken, refreshToken };

  } catch (error) {
    throw new ApiError(500, "Failed to generate access and refresh tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //
  //
  
  const { fullName, email, username, password } = req.body;
  console.log("email :", email);

  // stricter validation: fail when any required field is missing/empty
  if ([fullName, email, username, password].some((field) => !field || field.toString().trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  // FIX: throw only if user creation failed
  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
})

const loginUser= asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;
    
    if(!password || (!email && !username)){
        throw new ApiError(400, "username/ email or password is required");
    }
     const user = await User.findOne({
      $or: [{ email }, { username }]
     })
    if(!user){throw new ApiError(404, "User not found");}

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){throw new ApiError(401, "Invalid password");}

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    //optional
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
     
    //cookkies bhejne ke liye options bannane apdenge
    const options = {
        httpOnly: true,
        secure: true
      };
      return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(200,{ user: loggedInUser, accessToken, refreshToken })
        );
});
// ...existing code...
const logoutUser = asyncHandler(async (req, res) => {
  // await DB update
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  // use secure: false for local testing (true requires HTTPS)
  const options = {
    httpOnly: true,
    secure: false
  };

  return res
    .status(200)
    .cookie("accessToken", "", options)
    .cookie("refreshToken", "", options)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});
// ...existing code...
export { registerUser, loginUser, logoutUser };