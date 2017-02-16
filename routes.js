module.exports = (app) =>{
  const bcrypt = require('bcrypt');
  const users = {};
  const urlDatabase = {                          //objects that stores urls
    // "b2xVn2": "http://www.lighthouselabs.ca",
    // "9sm5xK": "http://www.google.com"
  };

  app.get("/", (req, res) => {
    res.redirect("/urls");
    //res.end("Hullo");
  });

  app.get("/urls/new", (req, res) => {          //request for the url creation page
    let templateVars = {};
    if (users[req.session["user_id"]]){
      templateVars = { username: users[req.session["user_id"]]['email'] };
      res.render("urls_new", templateVars);
      return;
    }
    res.status(400).send('Sorry, you need to be logged in order to shorten an URL<br><a href="/">Go Back</a>').end();

  });

  // app.get("/urls.json", (req, res) => {
  //   res.json(urlDatabase);
  // });

  // app.get("/hello", (req, res) => {
  //   res.end("<html><body>Hello <b>World</b></body></html>\n");
  // });

  app.get("/urls", (req, res) => {                        //index page: list of urls
    // let templateVars = { username: req.session["username"], urls: urlDatabase };
    let templateVars = {};
    if (users[req.session["user_id"]]){
      templateVars = { username: users[req.session["user_id"]]['email'], urls: urlDatabase[req.session["user_id"]] };
    }else{
      templateVars = { username: '', urls: {} };
    }
    res.render("urls_index", templateVars);

  });



  app.get("/urls/:id", (req, res) => {                   //request for detail and editing page
    let templateVars = {};
    if (users[req.session["user_id"]]){
      templateVars = { username: users[req.session["user_id"]]['email'], urls: urlDatabase[req.session["user_id"]], shortURL: req.params.id };
    }else{
      templateVars = { username: '', urls: {}, shortURL: req.params.id };
    }
    res.render("urls_show", templateVars);
  });



  app.post("/urls", (req, res) => {              //creates a new short url for a given url and stores it in the list
    let short = generateRandomString();
    urlDatabase[req.session.user_id][short] = req.body['longURL'];
    let templateVars = {};
    // if (users[req.session["user_id"]]){
    //   templateVars = { username: users[req.session["user_id"]]['email'], urls: urlDatabase, shortURL: short };
    // }else{
    //   templateVars = { username: '', urls: urlDatabase, shortURL: short };
    // }
    //console.log(urlDatabase);
    res.redirect("/");
  });


  app.post("/urls/:id/delete", (req, res) =>{     //deletes the selected entry from the list
    delete urlDatabase[req.session.user_id][req.params.id];
    res.redirect('/urls');

  });

  app.post("/urls/:id/update", (req, res) =>{     //updates the long of the select entry
    urlDatabase[req.session.user_id][req.params.id] = req.body['longURL'];
    res.redirect('/urls');
  });

  app.get("/u/:shortURL", (req, res) => {         //redirects the user to the respective long url, given a short url
    for(let user in urlDatabase){
      for(let url in urlDatabase[user]){
        if(url === req.params.shortURL){
          res.redirect(urlDatabase[user][url]);
          return;
        }
      }
    }
    // let longURL = urlDatabase[req.params.shortURL];
    // console.log(longURL);
    // res.redirect(longURL);
  });

  app.post("/logout", (req, res) => {
    req.session.user_id = null;
    res.redirect('/')
  });

  app.get("/register", (req, res) =>{
    res.render('register');
  });

  app.post("/register", (req, res) =>{
    if(req.body.email === '' || req.body.password === ''){
      res.status(400).send('Sorry, email or password missing!<br><a href="/register">Go Back</a>').end();
        return;
    }
    for(const user in users){
      if(users[user]['email'] === req.body.email){
        res.status(400).send('Sorry, the email is already registered!<br><a href="/register">Go Back</a>').end();
        return;
      }
    }
    let randomId = generateRandomString();
    const password = req.body.password;
    const hashed_password = bcrypt.hashSync(password, 10);
    users[randomId] = {
      id: randomId,
      email: req.body.email,
      password: hashed_password
    };
    req.session.user_id = randomId;
    urlDatabase[randomId] = {};
    res.redirect('/');
  });

  app.get("/login", (req, res) =>{
    res.render('login');
  })

  app.post("/login", (req, res) => {
    for(const user in users){
      if(users[user]['email'] === req.body.email){
        if(bcrypt.compareSync(req.body.password, users[user]['password'])){
          req.session.user_id = users[user]['id'];
          res.redirect('/');
          return;
        }else{
          res.status(400).send('Sorry, this is the wrong password for this email!<br><a href="/login">Go Back</a>').end();
          return;
        }
      }
    }
    res.status(400).send('Sorry, the email is not registered!<br><a href="/login">Go Back</a>').end();
  });

  function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 6; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
};
