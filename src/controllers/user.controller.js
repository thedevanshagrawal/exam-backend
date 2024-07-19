import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { response } from "express";
import jwt from "jsonwebtoken";
import { SchoolDetails } from "../models/SchoolDetails.model.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating and access token"
        );
    }
};

const registerStudent = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const {
        username,
        fullName,
        email,
        password,
        StudentClass,
        fathers_name,
        dob,
        contact_no,
        student_id,
        user_id,
    } = req.body;
    console.log("email: ", email);

    if (
        [username, fullName, email, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All field are required");
    }

    const existedUser = await User.findOne({
        $or: [{ student_id }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or student_id already exist");
    }

    const user = await User.create({
        username,
        fullName,
        email,
        password,
        StudentClass,
        fathers_name,
        dob,
        contact_no,
        student_id,
        user_id,
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registring the user"
        );
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User registered successfully")
        );
});

const registerSchool = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const {
        schoolName, email, school_id, address, spoc_name, spoc_password, spoc_email, principal_name, principal_id, principal_email, principal_password
    } = req.body;
    console.log("email: ", email);

    if (
        [schoolName, school_id, email].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All field are required");
    }

    if (!(schoolName || email)) {
        throw new ApiError(400, "schoolName or email is required");
    }

    const existedSchool = await SchoolDetails.findOne({
        $or: [{ school_id }, { email }],
    });

    if (existedSchool) {
        throw new ApiError(409, "School with email or school_id already exist");
    }

    const school = await SchoolDetails.create({
        schoolName, email, school_id, address, spoc_name, spoc_password, spoc_email, principal_name, principal_id, principal_email, principal_password
    });

    const createdSchool = await SchoolDetails.findById(school._id).select(
        "-password -refreshToken"
    );

    if (!createdSchool) {
        throw new ApiError(
            500,
            "Something went wrong while registring the user"
        );
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdSchool, "User registered successfully")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookie

    const { email, selectDashboard, password } = req.body;
    console.log("req.body: ", req.body);

    console.log("email: ", email);
    console.log("selectDashboard: ", selectDashboard);
    console.log("password: ", password);

    if (!(selectDashboard || email)) {
        throw new ApiError(400, "selectDashboard or email is required");
    }

    const user = await User.findOne({
        $or: [{ selectDashboard }, { email }],
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged In Successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"));
});

// const ccdd = asyncHandler(async (req, res) => {

//     const { schoolName, email, school_id, address, spoc_name, spoc_password, spoc_email, principal_name, principal_id, principal_email, principal_password } = req.body;

//     console.log("email: ", email);
//     console.log("schoolName: ", schoolName);

//     

//     if (
//         [schoolName, principal_name, email].some(
//             (field) => field?.trim() === ""
//         )
//     ) {
//         throw new ApiError(400, "All field are required");
//     }

//     const existedSchool = await SchoolDetails.findOne({
//         $or: [{ school_id }, { schoolName }],
//     });

//     if (existedSchool) {
//         throw new ApiError(409, "School with email or school_id already exist");
//     }

//     const School = await SchoolDetails.create({
//         schoolName, email, school_id, address, spoc_name, spoc_password, spoc_email, principal_name, principal_id, principal_email, principal_password
//     });

//     const createdSchool = await SchoolDetails.findById(School._id).select(
//         "-password -refreshToken"
//     );

//     if (!createdSchool) {
//         throw new ApiError(
//             500,
//             "Something went wrong while registring the School"
//         );
//     }

//     return res
//         .status(201)
//         .json(
//             new ApiResponse(200, createdSchool, "School registered successfully")
//         );
// }
// )


// const refreshAccessToken = asyncHandler(async (req, res) => {
//     const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

//     if (!incomingRefreshToken) {
//         throw new ApiError(401, "unauthorized request")
//     }

//     try {
//         const decodedToken = jwt.verify(
//             incomingRefreshToken,
//             process.env.REFRESH_TOKEN_SECRET
//         )

//         const user = await User.findById(decodedToken?._id)

//         if (!user) {
//             throw new ApiError(401, "Invalid refresh token")
//         }

//         if (incomingRefreshToken !== user?.refreshToken) {
//             throw new ApiError(401, "Refresh is expired or used")
//         }

//         const options = {
//             httpOnly: true,
//             secure: true
//         }

//         const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

//         return res
//             .status(200)
//             .cookie("accessToken", accessToken, options)
//             .cookie("refreshToken", newRefreshToken, options)
//             .json(
//                 new ApiResponse(
//                     200,
//                     { accessToken, refreshToken: newRefreshToken },
//                     "Access token refreshed"
//                 )
//             )

//     } catch (error) {
//         throw new ApiError(401, error?.message || "Invalid refresh token")
//     }
// })

// const changeCurrentPassword = asyncHandler(async (req, res) => {
//     const { oldPassword, newPassword } = req.body

//     // const { oldPassword, newPassword, confirmPassword } = req.body

//     // if (!(newPassword === confirmPassword)) {
//     //     throw new ApiError(400, "Password not matched")
//     // }

//     const user = await User.findById(req.user?._id)
//     const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

//     if (!isPasswordCorrect) {
//         throw new ApiError(400, "Invalid old Password")
//     }

//     user.password = newPassword
//     await user.save({ validateBeforeSave: false })

//     return res
//         .status(200)
//         .json(new ApiResponse(200, {}, "Password changed successfully"))
// })

// const getCurrentUser = asyncHandler(async (req, res) => {
//     return res
//         .status(200)
//         .json(200, req.user, "current user fetched successfully")
// })

// const updateAccountDetails = asyncHandler(async (req, res) => {
//     const { fullName, email } = req.body

//     if (!fullName || !email) {
//         throw new ApiError(400, "All fields are required")
//     }

//     const user = await User.findByIdAndUpdate(
//         req.user?._id,
//         {
//             $set: {
//                 fullName,       // or fullName: fullName
//                 email,         // or email: email
//             }
//         },
//         { new: true }
//     ).select("-password")

//     return res
//         .status(200)
//         .json(new ApiResponse(200, user, "Account Details updated successfully"))
// })

export {
    registerStudent,
    loginUser,
    logoutUser,
    registerSchool,
    // refreshAccessToken,
    // changeCurrentPassword,
    // getCurrentUser,
    // updateAccountDetails
};
