const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");


const urlDatabase = {};

const users = {};

const emailLookup = (email, userData) => {
  for(const user in userData) {
    if (userData[user].email === email) {
      return userData[user].id
    } 
  } 
}

const passwordLookup = (password, userData) => {
  for(const user in userData) {
    return userData[user].password;
  } 
}

function generateRandomString() {
  let uniqueURL = ""
  let alphaNumeric = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const count = 6;
  for (let x = 0; x < count; x++) {
    uniqueURL += alphaNumeric.charAt(Math.floor(Math.random() * alphaNumeric.length))
  }
  return uniqueURL
};

const urlsForUser = (id) => {
  const filteredUrls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      filteredUrls[url] = urlDatabase[url]
    }
  }
  return filteredUrls;
};


app.get("/", (req, res) => {
  res.send("Hello!");
  // console.log('Cookies ', req.cookies)
  // console.log('Signed Cookies ', req.signedCookies)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  let templateVars = { user: users[userId], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, user: users[req.cookies.user_id], longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars)
  console.log('userDatabase is:', urlDatabase)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(longURL)
  res.redirect(longURL);
});

app.post("/urls", (req, res) => { 
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL
  res.redirect("/urls/");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] }
  res.render("urls_login", templateVars)
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if(emailLookup(email, users) && passwordLookup(password, users) !== password) {
    res.status(403).render('passwordMatch')
  } else if(!emailLookup(email, users)) {
    res.status(403).render('emailNotFound')
  } else {
    const key = Object.keys(users)
    res.cookie("user_id", key);
    res.redirect("/urls")
  }
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls")
})

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] }
  res.render("urls_registration", templateVars)
})

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).render('missingInfo');
  } else if (emailLookup(email, users)) {
    res.status(400).render('emailTaken')
  } else {
  const user_id = generateRandomString();
  users[user_id] = {
    id: user_id,
    email: email,
    password: password
  }
    res.cookie("user_id", user_id)
    res.redirect("/urls")
  }
});