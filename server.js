const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
let db;

MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db('anon-message-app');
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// simple JWT middleware
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password, referralCode } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'required fields missing' });

    // check existing user
    const existing = await db.collection('users').findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = {
      username,
      email,
      password: hashed,
      createdAt: new Date(),
      referralCode: referralCode || null,
      referralEarnings: 10,
      referralCount: 0,
      totalBonusRewards: 0,
      referralActive: true,
      isAdmin: false,
      accountActive: true
    };
    const result = await db.collection('users').insertOne(user);
    const id = result.insertedId.toString();
    const token = jwt.sign({ id, username, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id, username, email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'required fields missing' });

    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id.toString(), username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id.toString(), username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// user lookup by id
app.get('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== id) return res.status(403).json({ error: 'Forbidden' });
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// lookup by referral code or username (no auth required)
app.get('/api/users/lookup', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'code query param required' });
    const user = await db.collection('users').findOne({
      $or: [ { referralCode: code }, { username: code } ]
    }, { projection: { username: 1 } });
    if (!user) return res.status(404).json({ error: 'not found' });
    res.json({ username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// update simple user properties
app.put('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== id) return res.status(403).json({ error: 'Forbidden' });
    const changes = req.body;
    // do not allow sensitive fields
    delete changes.password;
    delete changes.email;
    await db.collection('users').updateOne({ _id: new ObjectId(id) }, { $set: changes });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// change password
app.post('/api/auth/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(400).json({ error: 'Current password incorrect' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.collection('users').updateOne({ _id: new ObjectId(req.user.id) }, { $set: { password: hashed } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// delete account
app.post('/api/auth/delete-account', authMiddleware, async (req, res) => {
  try {
    const id = req.user.id;
    await db.collection('users').updateOne({ _id: new ObjectId(id) }, { $set: { accountActive: false, deletedAt: new Date() } });
    // optionally also remove messages or keep them
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// messages
app.post('/api/messages', authMiddleware, async (req, res) => {
  try {
    const msg = req.body;
    msg.timestamp = new Date();
    msg.read = false;
    msg.from = req.user.username || 'Anonymous';
    const result = await db.collection('messages').insertOne(msg);
    res.status(201).json({ id: result.insertedId.toString(), ...msg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/messages', authMiddleware, async (req, res) => {
  try {
    const { to } = req.query;
    const msgs = await db.collection('messages')
      .find({ to })
      .sort({ timestamp: -1 })
      .toArray();
    res.json(msgs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('API server listening on', port));
