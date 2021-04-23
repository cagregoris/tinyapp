// generates a random string
// Used to create user Ids and short URLs
function generateRandomString() {
  let uniqueURL = ""
  let alphaNumeric = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const count = 6;
  for (let x = 0; x < count; x++) {
    uniqueURL += alphaNumeric.charAt(Math.floor(Math.random() * alphaNumeric.length))
  }
  return uniqueURL
};

// returns an object of short urls specific to the userID
const urlsForUser = (id, urlDatabase) => {
  const filteredUrls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      filteredUrls[url] = urlDatabase[url]
    }
  }
  return filteredUrls;
};

//Returns user ID for the user given email address
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      console.log("database[user] from getUsrByEmail function==============", database[user])
      return database[user]
    }
  }
}

module.exports = { generateRandomString, urlsForUser, getUserByEmail };