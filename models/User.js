const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }
  // 必要に応じて、他のフィールドも追加
});

module.exports = mongoose.model('User', userSchema);
