const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const cors = require('cors') 

const app = express();
const port = 3000;

app.use(cors()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new Client({
  user: 'sai',
  host: '127.0.0.1',
  database: 'classconnect',
  password: '1445',
  port: 5432, 
});

db.connect();

app.post("/register", async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body['password-confirm'];

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).send("All fields are required");
  }

  if (password !== confirmPassword) {
    return res.status(400).send("Passwords do not match");
  }

  try {
    const exist = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    
    if (exist.rows.length > 0) {
      return res.status(400).send("User already exists");
    }

    await db.query("INSERT INTO users (email, name, password) VALUES ($1, $2, $3)", [email, username, password]);
    res.status(201).send("Registration successful Now Login to Continue");
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).send("Internal server error");
  }
});
app.post("/login", async (req, res) => {
  const email = req.body.useremail;
  const password = req.body.userpassword;
  const exist = await db.query(
    "SELECT * FROM users WHERE email = $1", [email]
  );
  if (exist.rows.length > 0) {
    const user = exist.rows[0];
    const storedPassword = user.password;
    const username = user.name;
    if (storedPassword === password) {
      res.json({ status: "logged", name: username });
    } 
    else {
      res.json({ status: "Incorrect password" });
    }
  } else {
    res.json({ status: "User doesn't exist" });
   
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
