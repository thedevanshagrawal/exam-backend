import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const schoolDetailSchema = new Schema(
    {
        
    },
    
    {
        timestamps: true,
    }

);

// encrypting password before saving to Db
schoolDetailSchema.pre("save", async function (next) {
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
schoolDetailSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

schoolDetailSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,


        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

schoolDetailSchema.methods.generateRefreshToken = function () {
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

export const SchoolDetails = mongoose.model("SchoolDetails", schoolDetailSchema);
