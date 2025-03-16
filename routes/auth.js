const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// ユーザー登録の処理
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if(existingUser) {
      return res.send('ユーザーは既に存在します');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: passwordHash });
    await newUser.save();
    req.session.username = username;
    res.redirect('/app');
  } catch(err) {
    res.status(500).send('エラーが発生しました');
  }
});

// ログインの処理
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if(user && await bcrypt.compare(password, user.password)) {
      req.session.username = username;
      res.redirect('/app');
    } else {
      res.send('ユーザー名またはパスワードが間違っています');
    }
  } catch(err) {
    res.status(500).send('エラーが発生しました');
  }
});

module.exports = router;
