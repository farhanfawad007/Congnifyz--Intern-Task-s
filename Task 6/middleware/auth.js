function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }

  req.session.returnTo = req.originalUrl;
  return res.redirect('/login');
}

function redirectIfAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }

  return next();
}

module.exports = {
  requireAuth,
  redirectIfAuthenticated,
};
