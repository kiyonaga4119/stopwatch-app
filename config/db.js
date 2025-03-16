const mongoose = require('mongoose');
// strictQueryの設定を明示的に指定して警告を抑制
mongoose.set('strictQuery', false);
const mongoURI = 'mongodb://localhost:27017/yourdbname'; // 適宜DB名を変更

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

module.exports = mongoose;
