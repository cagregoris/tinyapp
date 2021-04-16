function generateRandomString() {
  let uniqueURL = ""
  let alphaNumeric = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const count = 6;
  for (let x = 0; x < count; x++) {
    uniqueURL += alphaNumeric.charAt(Math.floor(Math.random() * alphaNumeric.length))
  }
  return uniqueURL
};

const urlsForUser = (id, urlDatabase) => {
  const filteredUrls = {};
  // console.log("hi.......", id, "---", urlDatabase)
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      filteredUrls[url] = urlDatabase[url]
    }
  }
  // console.log("hello.......", filteredUrls)
  return filteredUrls;
};

const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      console.log("database[user] from getUsrByEmail function==============", database[user])
      return database[user]
    }
  }
}

module.exports = { generateRandomString, urlsForUser, getUserByEmail };