module.exports = (app) =>{
  const users = {};
  const urlDatabase = {                          //objects that stores urls
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  };

  app.get("/", (req, res) => {
    res.redirect("/urls");
    //res.end("Hullo");
  });

  app.get("/urls/new", (req, res) => {          //request for the url creation page
    res.render("urls_new");
  });

  // app.get("/urls.json", (req, res) => {
  //   res.json(urlDatabase);
  // });

  // app.get("/hello", (req, res) => {
  //   res.end("<html><body>Hello <b>World</b></body></html>\n");
  // });

  app.get("/urls", (req, res) => {                        //index page: list of urls
    // let templateVars = { username: req.cookies["username"], urls: urlDatabase };
    let templateVars = {};
    if (users[req.cookies["user_id"]]){
      templateVars = { username: users[req.cookies["user_id"]]['email'], urls: urlDatabase };
    }else{
      templateVars = { username: '', urls: urlDatabase };
    }
    res.render("urls_index", templateVars);

  });



  app.get("/urls/:id", (req, res) => {                   //request for detail and editing page
    let templateVars = {};
    if (users[req.cookies["user_id"]]){
      templateVars = { username: users[req.cookies["user_id"]]['email'], urls: urlDatabase, shortURL: req.params.id };
    }else{
      templateVars = { username: '', urls: urlDatabase, shortURL: req.params.id };
    }
    res.render("urls_show", templateVars);
  });



  app.post("/urls", (req, res) => {              //creates a new short url for a given url and stores it in the list
    let short = generateRandomString();
    urlDatabase[short] = req.body['longURL'];
    let templateVars = {};
    if (users[req.cookies["user_id"]]){
      templateVars = { username: users[req.cookies["user_id"]]['email'], urls: urlDatabase, shortURL: short };
    }else{
      templateVars = { username: '', urls: urlDatabase, shortURL: short };
    }
    res.render("urls_show", templateVars);
   // console.log(urlDatabase);
  });


  app.post("/urls/:id/delete", (req, res) =>{     //deletes the selected entry from the list
    delete urlDatabase[req.params.id];
    res.redirect('/urls');

  });

  app.post("/urls/:id/update", (req, res) =>{     //updates the long of the select entry
    urlDatabase[req.params.id] = req.body['longURL'];
    res.redirect('/urls');
  });

  app.get("/u/:shortURL", (req, res) => {         //redirects the user to the respective long url, given a short url
    let longURL = urlDatabase[req.params.shortURL];
    console.log(longURL);
    res.redirect(longURL);
  });

  app.post("/logout", (req, res) => {
    res.clearCookie('user_id')
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
    users[randomId] = {
      id: randomId,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', randomId);
    res.redirect('/');
  });

  app.get("/login", (req, res) =>{
    res.render('login');
  })

  app.post("/login", (req, res) => {
    for(const user in users){
      if(users[user]['email'] === req.body.email){
        if(users[user]['password'] === req.body.password){
          res.cookie('user_id', users[user]['id']);
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
