import mongoose from "mongoose";


const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
  createdAt: Date,
});
const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;