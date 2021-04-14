const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

const emailLookup = (email, userData) => {
  for(const user in userData) {
    console.log("user info is:", user)
    if (userData[user].email === email) {
      return true
    } 
  } return false
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

app.get("/", (req, res) => {
  res.send("Hello!");
  console.log('Cookies ', req.cookies)
  //console.log('Signed Cookies ', req.signedCookies)
});

app.get("/urls", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] }
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] }
  res.render("urls_registration", templateVars)
})

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] }
  // console.log(templateVars);
  res.render("./partials/_header", templateVars)
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok");  
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/register", (req, res) => {
  // console.log(req.body)
  const email = req.body.email;
  // console.log(email);
  const password = req.body.password;
  // console.log(password);
  if (!email || !password) {
    // console.log("missing info")
    res.status(400).render('missingInfo');
  } else if (emailLookup(email, users)) {
    // console.log("email taken")
    res.status(400).render('emailTaken')
  } else {
  const user_id = generateRandomString();
  // console.log(user_id);
  console.log("users:", users)
  users[user_id] = {
    id: user_id,
    email: email,
    password: password
  }
    // console.log(users)
    res.cookie("user_id", user_id)
    res.redirect("/urls")
  }
});

app.post("/login", (req, res) => {
  //console.log("login req.body:", req.body)
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls")
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
});

app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  // console.log(shortURL);
  // console.log(longURL);
  // console.log(req.params.shortURL);
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls/");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});