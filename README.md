# 💬 ChatHub - Real-Time Chat Application

A full-stack real-time chat application built with Node.js, Express, Socket.IO, and MySQL. It includes secure authentication using bcrypt and session-based login handling.

---

###  Features

- User registration and login with email and password  
- Password hashing using bcrypt  
- Session-based authentication  
- 💬 Real-time messaging with Socket.IO  
- 👥 Online users tracking  
- Join and leave notifications  
- 🎨 Simple UI built with Tailwind CSS  

---

### 🛠️ Tech Stack

- **Backend:** Node.js, Express  
- **Frontend:** EJS, Tailwind CSS  
- **Real-time:** Socket.IO  
- **Database:** MySQL  
- **Authentication:** bcrypt, express-session  

---

### 📂 Project Structure

```
ChatHub/
├── public/
│   ├── client.js
│   └── style.css
├── views/
│   ├── index.ejs
│   ├── chat.ejs
│   ├── login.ejs
│   └── register.ejs
├── index.js
├── .gitignore
└── package.json
```
---

### ⚙️ Setup
Clone the repository<br>
```
git clone https://github.com/SMHaider-Zaidi/chathub.git
cd chathub
```

Install dependencies<br>
```
npm install
```

Run the application<br>
```
node index.js
```

Open 👉 http://localhost:3000

---

### Future Improvements
📧 Email verification<br>
💬 Private messaging<br>
⌨️ Typing indicators<br>
☁️ Deployment
