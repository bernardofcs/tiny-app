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
    let templateVars = { username: req.cookies["username"], urls: urlDatabase };
    res.render("urls_index", templateVars);

  });



  app.get("/urls/:id", (req, res) => {                   //request for detail and editing page
    let templateVars = { shortURL: req.params.id, urls: urlDatabase, username: req.cookies["username"] };
    res.render("urls_show", templateVars);
  });



  app.post("/urls", (req, res) => {              //creates a new short url for a given url and stores it in the list
    let short = generateRandomString();
    urlDatabase[short] = req.body['longURL'];
    let templateVars = { shortURL: short, urls: urlDatabase, username: req.cookies["username"]};
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

  app.post("/login", (req, res) => {
    res.cookie('username', req.body['username']);
    //console.log(res.cookie(req.body['username']));
    res.redirect('/');
  });

  app.post("/logout", (req, res) => {
    res.clearCookie('username')
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

  function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 6; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
};
