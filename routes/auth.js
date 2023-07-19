const router = require('express').Router();
const User = require('../schemas/userSchema.js'),

  bcrypt = require("bcrypt"),
  { uuid } = require('uuidv4'),
  passport = require('passport'),
  { ensureAuthenticated, forwardAuthenticated } = require('../middleware/authenticate.js')


//register
router.get('/register', forwardAuthenticated, (req, res) => {
  res.render('auth/register', {user: req.user})
})


router.post('/register', async (req, res) => {
  let errors = [];
  const { name, password, confirmPassword, phoneno } = req.body;

  if (!name || !password || !phoneno) {
    errors.push({ msg: "All fields are required" })
  };
  if (password != confirmPassword) {
    errors.push({ msg: "Passwords do not match" });
  }
  if (errors.length > 0) {
    res.send(errors);
  } else {

    User.findOne({ phoneno: phoneno }).then((user) => {
      if (user) {
        errors.push({ msg: "User already exists, try logging in instead." })
        return res.send(errors)
      }
      const userId = uuid();
      const newUser = new User({
        name: name,
        password: password,
        userId: userId,
        phoneno: phoneno,
      });
      bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser.save().then((user) => {
            passport.authenticate('local', (err, user, info) => {
              if (err) throw err;
              if (!user) res.send({ "msg": `${info.message}` });
              else {
                req.logIn(user, (err) => {
                  if (err) throw err;
                  res.render('auth/login', { msg: "Successfully Authenticated", success: "true", user: req.user });
                });
              }
            })(req, res);

          }).catch((err) => console.log(err));
        })
      );
    });
  }

})


//login 

router.get('/login', forwardAuthenticated, (req, res) => {
  res.render('auth/login', {user: req.user})
})

router.post('/login', async (req, res, next) => {
  passport.authenticate('local', { session: true }, (err, user, info) => {
    if (err) throw err;
    if (!user) {
      console.log(info.message)
      res.send({ "msg": `${info.message}` })
    } else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.redirect('/dashboard');
      });
    }
  })(req, res, next);
})

router.get('/user', (req, res) => {
  res.send(req.user)
})

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/')
})

module.exports = router;
