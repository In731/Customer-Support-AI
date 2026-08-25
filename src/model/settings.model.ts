import mongoose , { model, Schema } from "mongoose";

interface ISettings{
    ownerId:string
    businessName:string
    supportEmail:string
    knowledge:string
    primaryColor?:string
    widgetIcon?:string
    welcomeMessage?:string
}

const settingsSchema=new Schema<ISettings>({
 ownerId:{
    type:String,
    required:true,
    unique:true
 },
  businessName:{
    type:String
 },
  supportEmail:{
    type:String
 },
  knowledge:{
    type:String
 },
  primaryColor:{
    type:String,
    default:"#000000"
  },
  widgetIcon:{
    type:String,
    default:"🤖"
  },
  welcomeMessage:{
    type:String,
    default:"Hi! How can I help you today?"
  },


},{timestamps:true})

const Settings=mongoose.models.Settings || model("Settings",settingsSchema)
export default Settings