const express = require('express');
const router = express.Router();
const User = require('./../models/user.js');
const {jwtAuthMiddleware,generateToken} = require('./../jwt');

// POST route to create a new person
router.post('/signup', async (req, res) => {
    try {
        const data = req.body;

        const newUser = new User(data);
        // Save the new user to the database
        const response = await newUser.save();
        console.log('Data saved');

        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        // const token = generateToken(response.username);
        console.log("Token is : ",token);
        res.status(200).json({response: response,token: token});
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/login',async(req,res)=>{
    try{
        //Extract username and password from request body
        const{aadharCardNumber,password} = req.body;

        //Find the user by username
        const user = await User.findOne({aadharCardNumber: aadharCardNumber});

        //If user does not exist or password does not match,return error
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid username or password'});
        }

        //generate token
        const payload = {
            id : user.id,
            // username : user.username
        }
        const token = generateToken(payload);

        // return token as response
        res.json({token})
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error'});
    }
})
// Profile route 
router.get('/profile',jwtAuthMiddleware,async (req,res)=>{
    try{
        const userData = req.user.id;
        const userId = userData.id;
        // console.log("User Data",userData);
        const user = await User.findById(userId);

        res.status(200).json({user});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error'});
    }
})

router.put('/profile/password',async(req,res)=>{
    try{
        const userId = req.user.id; // Extract the id from the token
        const {currentPassword,newPassword} = req.body;// Extract current and new passwords from request body

        //find the user by userId
        const user = await User.findById(userId);

        //If password does not match, return error
        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error:'Invalid username or password'});
        }

        //update the user's password
        user.password = newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({message:"Password Updated"})
    }catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
})


module.exports = router;
