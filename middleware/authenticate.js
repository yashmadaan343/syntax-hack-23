function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    else res.redirect('/auth/login');
  }

function forwardAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    else res.redirect('/dashboard');
  }

function ensureAdminAuthenticated(req, res, next) {
  if(!req.isAuthenticated()) res.redirect('/auth/login')
  if(!req.user.admin) res.redirect('/')
  else return next()
}

module.exports = { ensureAuthenticated, forwardAuthenticated, ensureAdminAuthenticated };
