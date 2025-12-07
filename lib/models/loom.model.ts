import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";

const loomSchema = new mongoose.Schema({
   text:{type:String,required:true},
   author:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
   community:{type:mongoose.Schema.Types.ObjectId,ref:"Community"},
   createdAt:{type:Date,default:Date.now},
   parentId:{type:String},
   children:[{type:mongoose.Schema.Types.ObjectId,ref:"Loom"}],
   likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
   image: { type: String },
});

const Loom = mongoose.models.Loom || mongoose.model("Loom", loomSchema);

export default Loom;