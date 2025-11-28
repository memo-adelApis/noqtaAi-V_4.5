import mongoose from "mongoose";


const unitSchema = new mongoose.Schema({
    name: String,
    abbreviation: String,
    createdAt: Date,
}); 

const Unit = mongoose.models.Unit || mongoose.model("Unit", unitSchema);

export default Unit;
