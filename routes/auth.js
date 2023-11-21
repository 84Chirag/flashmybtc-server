require('dotenv').config(); // (dotenv) pakage use for secrecy
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const userdata = require('../middleware/userdata'); // Import custom middleware for user authentication.

// Replace with a secure secret key in production 
// don't use .env.local just .env and install package (dotenv)
const JWT_SECRET = process.env.NODE_EXPRESS_PASS_SECRET_KEY
// console.log(JWT_SECRET)

//ROUTE 1 :Creating a user signing up Route for a user using post"/signup". no login required
router.post('/signup', [
    //below are the check we use for validating the data 
    // Validation checks for the request body fields using express-validator.
    body('name', 'Enter Your Name Correctly').isLength({ min: 3 }),
    body('email', 'Enter Your email Correctly').isEmail(),
    body('password', 'Enter Your password Correctly').isLength({ min: 5 })
], async (req, res) => {
    let success = false;
    // Validate the request body against the defined checks.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        // If there are validation errors, return a 400 Bad Request response with the errors.
        return res.status(400).json({ success, errors: errors.array() });
    }
    try {
        let user = await User.findOne({ email: req.body.email });
        // If the request data is valid, create a new User instance and save it to the database using User.create()
        if (user) {
            return res.status(400).json({ success, error: "A User With Mentioned Email Exists" })
        }

        // adding salt from bcrypt with hash passwrd
        const salt = await bcrypt.genSalt(10);

        // hashing password with salt and passing it to database
        const securepassword = await bcrypt.hash(req.body.password, salt);

        // Craeting a JSON response of user database indexes id named data. 
        //used to check back when when token is returned by user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: securepassword
        });
        const data = {
            user: {
                id: user.id
            }
        }

        //assigning authtoken both data and JWT_SECRET and sending it to user as response
        //JWT_SECRET is used to check if anyone has temper with the token when user send the token back
        const authtoken = jwt.sign(data, JWT_SECRET)
        // console.log(authtoken);

        //so here we are sending authenticationtoken which is user's database index id with my signature to user as authentication token which will set it in it's local storage to keep him logged in until he log out himself
        success = true;
        res.json({ success, authtoken })
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("There is some Internal Server Error")
    }
});


//ROUTE 2 : authenticating a user Route for loging in a user using post"/login". no login required
router.post('/login', [
    //for validation of req data from user
    body('email', "Enter Valid Credentials").isEmail(),
    body('password', "Enter Valid Password").exists()
], async (req, res) => {
    let success = false;

    //if validation is not true then res is error with array of error and status of 400
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    //destructuring email and password from req body
    const { email, password } = req.body;

    //wrapping in try and catch to avoid getting the server crashed cause of error
    try {

        //checking email in database to check user exist or not 
        //and if not responding with status 400 and json message
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json("Enter valid Credentials");
        }

        //after finding email comparing pasword and incase of mismatch res with status of 400 and json message
        const passwordmatch = await bcrypt.compare(password, user.password);
        if (!passwordmatch) {
            return res.status(400).json("Enter A valid Password");
        }

        //assigning data, user, id of database id
        const data = {
            user: {
                id: user.id
            }
        };

        //assigning authtoken both data and JWT_SECRET and sending it to user as response
        //JWT_SECRET is used to check if anyone has temper with the token when user send the token back
        const authtoken = jwt.sign(data, JWT_SECRET);
        // console.log(authtoken);

        success = true;
        //so here we are sending authenticationtoken which is user's database index id with my signature to user as authentication token which will set it in it's local storage to keep him logged in until he log out himself
        res.json({ success, authtoken });

    } catch (error) {
        // sending error if there any error in server as internal error
        console.error(error);
        res.status(500).send("There Is Technical Error In Server Due To Some Error");
    }
})

//ROUTE 3 : Route for getting data of loggedin user, using post"/getuser".login required
router.post('/getuser', userdata, async (req, res) => {
    try {

        // retreiving the authenticated user's data
        userId = req.user.id;
        // const user = await User.findById(userId)
          const user = await User.findById(userId).select("-password")
        // Send the user data (excluding the password) to the authenticated user.
        
        res.json({ user });
    } catch (error) {
        // Send an internal server error if there's an issue on the server.
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})

module.exports = router