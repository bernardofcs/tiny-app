module.exports = (app) =>{
  const bcrypt = require('bcrypt');
  const users = {/*ABCDEF: {id: 'ABCDEF', email: 'bernardofcs@hotmail.com', password: '$2a$06$qF4eYJKlVO85Z9E73MNX4OfPRMFbYS6ea5g0uKRUTi5DGnJmL37Tq'}*/};
  const urlDatabase = {                           //objects that stores urls
    // "b2xVn2": "http://www.lighthouselabs.ca",
    // "9sm5xK": "http://www.google.com"
  };

  app.get("/", (req, res) => {
    if(users[req.session.user_id]){
      res.redirect("/urls");
    }else{
      res.redirect("/login");
    }
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
    if (users[req.session.user_id]){
      templateVars = { username: users[req.session["user_id"]]['email'], urls: urlDatabase[req.session["user_id"]] };
      res.render("urls_index", templateVars);
    }else{
      res.status(401).send('Please login to your account to access the URLs page.<br><a href="/login"><button>Login</button></a>').end();
    };

  });



  app.get("/urls/:id", (req, res) => {                   //request for detail and editing page
    let templateVars = {};
    let urlExistsGlobal = false;
    for(let user in urlDatabase){
      for(let url in urlDatabase[user]){
        if(url === req.params.id){
          urlExistsGlobal = true;
        }
      }
    }
    if (!users[req.session.user_id]){
      res.status(401).send('Please login to your account to access specific URL pages.<br><a href="/login"><button>Login</button></a>').end();
      return;
    }
    if(!urlExistsGlobal){
      res.status(404).send('URL was not found').end();
      return;
    }

    if(!urlDatabase[req.session.user_id][req.params.id]){
      res.status(403).send('This URL belongs to another user.<br><a href="/urls"><button>Back to URLs page</button></a>').end();
      return;
    }

    templateVars = { username: users[req.session["user_id"]]['email'], urls: urlDatabase[req.session["user_id"]], shortURL: req.params.id };
    res.render("urls_show", templateVars);
  });



  app.post("/urls", (req, res) => {              //creates a new short url for a given url and stores it in the list
    if(!users[req.session.user_id]){
      res.status(401).send('Please login to your account to create URL pages.<br><a href="/login"><button>Login</button></a>').end();
      return;
    }
    let short = generateRandomString();
    urlDatabase[req.session.user_id][short] = req.body['longURL'];
    let templateVars = {};
    res.redirect(`/urls/${short}`);
  });


  app.delete("/urls/:id/delete", (req, res) =>{     //deletes the selected entry from the list
    let urlExistsGlobal = false;
    for(let user in urlDatabase){
      for(let url in urlDatabase[user]){
        if(url === req.params.id){
          urlExistsGlobal = true;
        }
      }
    }
    if (!users[req.session.user_id]){
      res.status(401).send('Please login to your account to delete URL pages.<br><a href="/login"><button>Login</button></a>').end();
      return;
    }
    if(!urlExistsGlobal){
      res.status(404).send('URL was not found').end();
      return;
    }

    if(!urlDatabase[req.session.user_id][req.params.id]){
      res.status(403).send('This URL belongs to another user.<br><a href="/urls"><button>Back to URLs page</button></a>').end();
      return;
    }
    delete urlDatabase[req.session.user_id][req.params.id];
    res.redirect('/urls');

  });

  app.put("/urls/:id/update", (req, res) =>{     //updates the long of the select entry
    let urlExistsGlobal = false;
    for(let user in urlDatabase){
      for(let url in urlDatabase[user]){
        if(url === req.params.id){
          urlExistsGlobal = true;
        }
      }
    }
    if (!users[req.session.user_id]){
      res.status(401).send('Please login to your account to update URL pages.<br><a href="/login"><button>Login</button></a>').end();
      return;
    }
    if(!urlExistsGlobal){
      res.status(404).send('URL was not found').end();
      return;
    }

    if(!urlDatabase[req.session.user_id][req.params.id]){
      res.status(403).send('This URL belongs to another user.<br><a href="/urls"><button>Back to URLs page</button></a>').end();
      return;
    }
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
    res.status(404).send('URL was not found').end();
  });

  app.post("/logout", (req, res) => {
    req.session.user_id = null;
    res.redirect('/')
  });

  app.get("/register", (req, res) =>{
    if(users[req.session.user_id]){
      res.redirect('/');
      return;
    }
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
    if(users[req.session.user_id]){
      res.redirect('/');
      return;
    }
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
          res.status(401).send('Sorry, this is the wrong password for this email!<br><a href="/login">Go Back</a>').end();
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
