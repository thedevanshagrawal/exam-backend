import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { response } from "express";
import jwt from "jsonwebtoken";
import { SchoolDetails } from "../models/SchoolDetails.model.js";
import { questionBank } from "../models/questionBank.model.js";
import { questionPaper } from "../models/questionPaper.model.js";


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

const registerAdmin = asyncHandler(async (req, res) => {
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
        fullName,
        email,
        password,
        contact_no,
        user_id,

    } = req.body;
    console.log("email: ", email);

    if (
        [fullName, email, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All field are required");
    }

    const existedUser = await User.findOne({
        $or: [{ user_id }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or user_id already exist");
    }

    const user = await User.create({
        fullName,
        email,
        password,
        contact_no,
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
        $or: [{ user_id }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or user_id already exist");
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

    const existedSchool = await User.findOne({
        $or: [{ school_id }, { email }],
    });

    if (existedSchool) {
        throw new ApiError(409, "School with email or school_id already exist");
    }

    const school = await User.create({
        schoolName, email, school_id, address, spoc_name, spoc_password, spoc_email, principal_name, principal_id, principal_email, principal_password
    });

    const createdSchool = await User.findById(school._id).select(
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

const studentProfile = asyncHandler(async (req, res) => {
    const { email } = req.query

    if (!email) {
        throw new ApiError(400, "email is required")
    }

    const studentDetails = await User.find(
        {
           
            email
        },
        "-password"
    )

    if (!studentDetails?.length) {
        throw new ApiError(404, "No student found for the given School Id")
    }

    return res
        .status(201)
        .json(new ApiResponse(
            200, studentDetails, "Student information fetched successfully"
        ))

})

const schoolProfileInAdminProfile = asyncHandler(async (req, res) => {
    const { school_id, email } = req.query

    if (!(school_id || email)) {
        throw new ApiError(400, "School Id or email is required")
    }

    const schoolDetails = await User.find(
        {
            school_id,
            email
        },
        "-password"
    )

    if (!schoolDetails?.length) {
        throw new ApiError(404, "No schoolDetails found for the given School Id")
    }

    return res
        .status(201)
        .json(new ApiResponse(
            200, studentDetails, "schoolDetails information fetched successfully"
        ))

})

const createquestionBank = asyncHandler(async (req, res) => {
    const { subject, question, answer, option1, option2, option3, option4, topic, difficulty_level } = req.body

    if (!(subject || topic || question)) {
        throw new ApiError(400, "Subject or topic or question is required")
    }

    // const existedQuestion = await find({
    //     $or: [{ question }]
    // })

    // if (existedQuestion) {
    //     throw new ApiError(409, "Question is existed")
    // }

    const Question = await questionBank.create({
        subject,
        question,
        answer,
        option1,
        option2,
        option3,
        option4,
        topic,
        difficulty_level
    })

    const createdQuestion = await questionBank.findById(Question._id).select(
        "-refreshToken"
    )

    if (!createdQuestion) {
        throw new ApiError(500, "Something went wrong while creating question paper")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdQuestion, "Question Paper created successfully")
        )

})



const createQuestionPaper = asyncHandler(async (req, res) => {
    const { question_id, school_id, test_name, duration, total_marks, School_class, difficulty_level } = req.body;

    // First, aggregate the data from questionBank based on your criteria
    const aggregatedData = await questionBank.aggregate([
        {
            $match: {
                difficulty_level: difficulty_level // Adjust this to your specific criteria
            }
        },
        // Project stage to include necessary fields
        {
            $project: {
                subject: 1,
                question: 1,
                answer: 1,
                option1: 1,
                option2: 1,
                option3: 1,
                option4: 1,
                topic: 1,
                difficulty_level: 1
            }
        }
    ]);

    // Prepare the array of question IDs and the full questions data
    const questionIds = aggregatedData.map(question => question._id.toString());
    const questionsData = aggregatedData.map(question => ({
        id: question._id.toString(),
        subject: question.subject,
        question: question.question,
        answer: question.answer,
        option1: question.option1,
        option2: question.option2,
        option3: question.option3,
        option4: question.option4,
        topic: question.topic,
        difficulty_level: question.difficulty_level
    }));

    // Now, create the question paper with the aggregated question IDs and data
    const QuestionPaper = await questionPaper.create({
        question_id: questionIds,
        school_id,
        test_name,
        duration,
        total_marks,
        School_class,
        difficulty_level,
        questionsData
    });

    console.log("QuestionPaper", question_id);
    console.log("questionsData", [...questionsData]);

    // Include the questions data in the response
    const scheduledQuestionPaper = {
        ...QuestionPaper._doc,
        ...questionsData
    };

    if (!QuestionPaper) {
        throw new ApiError(500, "Something went wrong while scheduling paper");
    }

    return res.status(201).json(
        new ApiResponse(200, scheduledQuestionPaper, "Scheduled paper successfully")
    );
});


export {
    registerAdmin,
    registerStudent,
    loginUser,
    logoutUser,
    registerSchool,
    createquestionBank,
    createQuestionPaper,
    studentProfile,
    schoolProfileInAdminProfile,
    // refreshAccessToken,
    // changeCurrentPassword,
    // getCurrentUser,
    // updateAccountDetails
};
