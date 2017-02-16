module.exports = (app) =>{
  const bcrypt = require('bcrypt');
  const users = {};                             //object that stores user info
  const urlDatabase = {};                       //objects that stores urls, grouped by user


  app.get("/", (req, res) => {
    if(users[req.session.user_id]){
      res.redirect("/urls");
    }else{
      res.redirect("/login");
    }
  });

  app.get("/urls/new", (req, res) => {          //request for the url creation page
    let templateVars = {};
    if (users[req.session["user_id"]]){
      templateVars = { username: users[req.session["user_id"]]['email']};
      res.render("urls_new", templateVars);
      return;
    }
    res.status(400).send('Sorry, you need to be logged in order to shorten an URL<br><a href="/">Go Back</a>').end();

  });


  app.get("/urls", (req, res) => {                        //list of urls created by the authenticated user
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
    const nowDate = new Date();
    const date = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate();
    urlDatabase[req.session.user_id][short] = {longUrl: req.body['longURL'], totalVisits: 0, uniqueVisits: 0, date: date, visits: {timestamp: nowDate, user:req.session.user_id}};
    console.log(urlDatabase);
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
    urlDatabase[req.session.user_id][req.params.id]['longUrl'] = req.body['longURL'];
    res.redirect('/urls');
  });

  app.get("/u/:shortURL", (req, res) => {         //redirects the user to the respective long url, given a short url
    for(let user in urlDatabase){
      for(let url in urlDatabase[user]){
        if(url === req.params.shortURL){
          urlDatabase[user][url]['totalVisits'] += 1;
          res.redirect(urlDatabase[user][url]['longUrl']);
          return;
        }
      }
    }
    res.status(404).send('URL was not found').end();
  });

  app.post("/logout", (req, res) => {                      //user logs out
    req.session.user_id = null;
    res.redirect('/')
  });

  app.get("/register", (req, res) =>{                       //request for registration page
    if(users[req.session.user_id]){
      res.redirect('/');
      return;
    }
    res.render('register');
  });

  app.post("/register", (req, res) =>{                        //registers a new user
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

  app.get("/login", (req, res) =>{                     //request for login page
    if(users[req.session.user_id]){
      res.redirect('/');
      return;
    }
    res.render('login');
  })

  app.post("/login", (req, res) => {                   //user authentication
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

  function generateRandomString() {             //generates a random 6 digit string
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for(let i=0; i < 6; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
};
