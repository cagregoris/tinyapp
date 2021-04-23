//===SETUP===========================================================================================
const express = require("express");
const cookieSession = require("cookie-session")
const app = express();
const PORT = 8080; 


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const bcrypt = require('bcrypt');

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['Carolyn'],
  maxAge: 24 * 60 * 60 * 1000
}))

//==OBJECTS
const urlDatabase = {};
const users = {};

//===FUNCTIONS
const { generateRandomString, urlsForUser, getUserByEmail } = require('./helpers')

//===ROUTES==========================================================================================


// redirects to login page
app.get("/", (req, res) => {
  res.redirect("/login")
});

app.listen(PORT, () => {
});

// If user is logged in, this page displays the user's urls
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId]
  const urls = urlsForUser(userId, urlDatabase); 
  let templateVars = { user, urls };
  if (!userId) {
    res.redirect('/login')
  } else {
    res.render("urls_index", templateVars);
  }
});

// page for user to create new url
// if user is not logged in, they are redirected to the login page
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login')
  }
});

// if user is logged in and the url belongs to the user, this page shows details about the short url.
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const user = users[userID]
  const templateVars = { shortURL: req.params.shortURL, user: user, longURL: urlDatabase[shortURL].longURL };  
  const userUrls = urlsForUser(userID, urlDatabase)

  if (!urlDatabase[shortURL]) {
    res.render('urlDoesNotExist')
  } else if (!userID || !userUrls[shortURL]) {
    res.render('unauthorized')
  } 
  else {
    res.render("urls_show", templateVars)
  }
});

// redirects to the url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//adds the new url to the database and redirects to the short url page.
app.post("/urls", (req, res) => { 
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: userID
    }
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.render('unauthorized')
  }
});

// updates the long url
app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = longURL
    res.redirect("/urls");
});

// deletes url from database
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
});

// users that are registered login page
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] }
  res.render("urls_login", templateVars)
});

// if login information is valid, user is redirected to urls_index
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if(user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls")
  } else {
    res.status(403).render('passwordMatch');
  };
});

// redirects to urls page and clears cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls")
})

// user registration page
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] }
  res.render("urls_registration", templateVars)
})

// if registration info is valid, redirects to urls index
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
        req.session.user_id = user_id;
        res.redirect("/urls")
    } else {
      res.render('emailTaken')
    }

  } else {
    res.render('missingInfo')
  }
});