import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  users: { type: String, },
  username: { type: String, unique: true },
  password: { type: String}, // NOTE: Store hashed passwords in production
  score: { type: Number, default: 0 },
  currentGame: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

export default User;