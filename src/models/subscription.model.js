// subscription has a subscription id, channel-a channel is a user, subscriber-it is a user
import mongoose,{Schema} from "mongoose"
const subscriptionSchema=new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,  //oe who is subscribing
        ref:"User"
    },
    channel:{
         type:Schema.Types.ObjectId,  //oe to whom subscriber is subscribing
         ref:"User"
    }
},timestamps=true)
export const Subscription=mongoose.model("Subscription",subscriptionSchema)