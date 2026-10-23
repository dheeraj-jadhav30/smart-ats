import mongoose from 'mongoose' 

const sessionSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true , 'user is required']
    },
    refreshTokenHash:{
        type:String ,
        required:[true , 'Refresh Token is required']
    },
    ip:{
        type:String ,
        required:[true, 'IP address is must']
    },
    userAgent:{
        type:String ,
        required:[true , "userAgent is must"]
    },
    revoked:{
        type:Boolean ,
        default:false
    }
} , {
    timestamps:true
})

const sessionModel = mongoose.model('session' , sessionSchema)

export default sessionModel