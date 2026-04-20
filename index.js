import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import bcrypt from "bcrypt";
import session from 'express-session';
import { Sequelize, DataTypes } from 'sequelize';

dotenv.config();
const app = express();  

// --- SEQUELIZE CONNECTION ---
const sequelize = new Sequelize(process.env.DATABASE, process.env.USER, process.env.PASSWORD, {
  host: process.env.HOST,
  dialect: 'mysql',
  logging: false // keeps the console clean
});

// --- MODELS ---
const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false }
});

const Message = sequelize.define('Message', {
  username: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false }
});

// Relationships
User.hasMany(Message);
Message.belongsTo(User);

// Sync Database
sequelize.sync().then(() => console.log("Database & Tables synced"));

// --- MIDDLEWARE ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

const server = http.createServer(app);
const io = new Server(server);
const users = {};

// --- ROUTES ---

app.get('/', (req, res) => res.render('index'));

app.get('/register', (req, res) => res.render('register', { error: null, username: '', email: '' }));

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashed });
    res.redirect('/login');
  } catch (err) {
    res.render('register', { error: 'Email already exists!', username, email });
  }
});

app.get('/login', (req, res) => res.render('login', { error: null, email: '' }));

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.render('login', { error: 'Incorrect Credentials', email });
  }

  req.session.userId = user.id;
  req.session.userName = user.username;
  res.redirect('/chat');
});

app.get('/chat', async (req, res) => {
  if (!req.session.userName) return res.redirect('/login');
  
  // Fetch last 50 messages
  const messages = await Message.findAll({
    limit: 50,
    order: [['createdAt', 'ASC']]
  });
  
  res.render('chat', { username: req.session.userName, messages });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

// --- SOCKET.IO ---
io.on('connection', (socket) => {
  socket.on('join', (username) => {
    users[socket.id] = username;
    io.emit('chat message', { username: 'System', message: `${username} joined`, time: new Date().toLocaleTimeString() });
    io.emit('users list', Object.values(users));
  });

  socket.on('chat message', async (msg) => {
    const username = users[socket.id];
    if (!username) return;

    // Save using Sequelize
    await Message.create({
      username,
      message: msg,
      UserId: socket.handshake.session?.userId // If using express-socket.io-session
    });

    io.emit('chat message', { username, message: msg, time: new Date().toLocaleTimeString() });
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('users list', Object.values(users));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));