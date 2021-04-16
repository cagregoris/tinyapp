const express = require("express");
const cookieSession = require("cookie-session")
const app = express();
const PORT = 8080; // default port 8080


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const bcrypt = require('bcrypt');

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['Carolyn'],
  maxAge: 24 * 60 * 60 * 1000
}))


const urlDatabase = {};

const users = {};

const { generateRandomString, urlsForUser, getUserByEmail } = require('./helpers')


app.get("/", (req, res) => {
  res.send("Hello!");
  // console.log('Cookies ', req.cookies)
  // console.log('Signed Cookies ', req.signedCookies)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId]
  const urls = urlsForUser(userId, urlDatabase); 
  let templateVars = { user, urls };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const user = users[userID]
  const templateVars = { shortURL: req.params.shortURL, user: user, longURL: urlDatabase[shortURL].longURL };  
  res.render("urls_show", templateVars)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(longURL)
  res.redirect(longURL);
});

app.post("/urls", (req, res) => { 
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userID
  }
  console.log("something---", userID.id, "----", urlDatabase)
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = longURL
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] }
  res.render("urls_login", templateVars)
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if(user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.id;
    console.log("user.id---------", user.id)
    res.redirect("/urls")
  } else {
    res.status(403).render('passwordMatch');
  };
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls")
})

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] }
  res.render("urls_registration", templateVars)
})

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email && password) {

    if (!getUserByEmail(email, users)) {
      const user_id = generateRandomString();
      users[user_id] = {
        id: user_id,
        email: email,
        password: bcrypt.hashSync(password, 10)
      }
        console.log(user_id)
        req.session.user_id = user_id;
        res.redirect("/urls")
    } else {
      res.render('emailTaken')
    }

  } else {
    res.render('missingInfor')
  }
});