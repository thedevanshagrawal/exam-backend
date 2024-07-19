import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            trim: true,
            index: true,
        },

        StudentClass: {
            type: String,
        },
        fathers_name: {
            type: String,
        },
        dob: {
            type: String,
        },
        contact_no: {
            type: String,
        },
        user_id: {
            type: String,
            unique: true,
        },
        password: {
            type: String,
            
        },
        selectDashboard: {
            type: String,
            enum: ["Admin", "School", "Student"],
        },
        refreshToken: {
            type: String,
        },
        schoolName: {
            type: String,
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        contact_no: {
            type: String,
        },

        selectDashboard: {
            type: String,
            enum: ["Admin", "School", "Student"],
        },
        refreshToken: {
            type: String,
        },
        school_id: {
            type: String,
        },
        spoc_name: {
            type: String,
        },
        spoc_id: {
            type: String,
        },
        spoc_password: {
            type: String,
        },
        spoc_email: {
            type: String,
        },
        address: {
            type: String,
        },
        principal_name: {
            type: String,
        },
        principal_id: {
            type: String,
        },
        principal_password: {
            type: String,
        },
        principal_email: {
            type: String,
        },
    },
    {
        timestamps: true,
    }

);

// encrypting password before saving to Db
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();

    // or
    // if (this.isModified("password")) {
    //     this.password = await bcrypt.hash(this.password, 10)
    //     next()
    // }
    // else {
    //     next()
    // }
});

//checking user given password and DB saved password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,

            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userSchema);
