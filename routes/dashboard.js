const router = require('express').Router();
const {ensureAuthenticated} = require('../middleware/authenticate')
const User = require('../schemas/userSchema')
router.get('/', ensureAuthenticated, async (req, res) => {
    const user = await User.findOne({userId: req.user.userId})
    res.render('dashboard', {user})
})

module.exports = router;
