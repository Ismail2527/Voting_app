const express = require('express');
const router = express.Router();
const Candidate = require('./../models/candidate.js');
const User = require('./../models/user.js');  // Ensure correct path to your User model
const {jwtAuthMiddleware,generateToken} = require('./../jwt');
// Check the user is admin or not
const checkAdminRole = async(userId) =>{
    try{
        const user = await User.findById(userId);
        if(user.role === 'admin'){
            return true;
        }
    }catch(err){
        return false;
    }
}
// POST route to create a Candidate
router.post('/',jwtAuthMiddleware, async (req, res) => {
    try {
        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({message: 'user has not admin role'});
        }
        const data = req.body;

        const newCandidate = new Candidate(data);
        // Save the new user to the database
        const response = await newCandidate.save();
        console.log('Data saved');

        res.status(200).json({response: response});
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Profile route 
// router.get('/profile',jwtAuthMiddleware,async (req,res)=>{
//     try{
//         const userData = req.user.id;
//         const userId = userData.id;
//         // console.log("User Data",userData);
//         const user = await User.findById(userId);

//         res.status(200).json({user});
//     }catch(err){
//         console.error(err);
//         res.status(500).json({ error: 'Internal Server Error'});
//     }
// })

router.put('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    try{
        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({message: 'user has not admin role'});
        }
        const candidateID = req.params.candidateID;
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateID,updatedCandidateData,{
            new : true,
            runValidators:true,
        })
        if(!response){
            return res.status(404).json({error:'Person not found'});
        }
        console.log('data updated');
        res.status(200).json(response);
    }catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
})
router.delete('/:candidateID',async(req,res)=>{
    try{
        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({message: 'user has not admin role'});
        }
        const candidateID = req.params.candidateID;
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndDelete(candidateID)

        if(!response){
            return res.status(404).json({error:'Person not found'});
        }
        console.log('candidate deleted');
        res.status(200).json(response);
    }catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

// let's start voting
router.post('/vote/:candidateID',jwtAuthMiddleware,async (req,res)=>{
    //no admin can vote
    // user can only vote once
    candidateID = req.params.candidateID;
    userId = req.user.id;;

    try{
        //Find the Candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({message : 'Candidate not found'});
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message : 'user not found'});
        }
        if(user.isVoted){
            res.status(400).json({message: 'You have already voted'});
        }
        if(user.role == 'admin'){
            res.status(403).json({message : 'admin is not allowed'});
        }
        // update the candidate Document to record the vote
        candidate.votes.push({user:userId});
        candidate.voteCount++;
        await candidate.save();

        //update the user document
        user.isVoted = true;
        await user.save();

        res.status(200).json({message: 'You vote successfully'});
    }catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
})


// vote count
router.get('/vote/count',async(req,res)=>{
    try{
        //find all candidates and sort them by voteCount is descending order
        const candidate = await Candidate.find().sort({voteCount:'desc'});

        //Map the candidates to only return their name and voteCoutn
        const voteRecord = candidate.map((data)=>{
            return{
                party: data.party,
                count: data.voteCount
            }
        });
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server Error'})
    }
})


module.exports = router;
