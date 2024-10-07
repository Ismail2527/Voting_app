const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required: true
    },
    email:{
        type:String
    },
    mobile:{
        type: String
    },
    address:{
        type: String,
        required:true
    },
    aadharCardNumber:{
        type:Number,
        required: true,
        unqiue:true
    },
    password:{
        type:String,
        required: true
    },
    role:{
        type:String,
        enum:['voter','admin'],
        default:'voter'
    },
    isVoted:{
        type:Boolean,
        default: false
    }

});

// Middleware to hash password before saving
userSchema.pre('save', async function(next) {
    const person = this;

    // Check if the password is already hashed (starts with "$2b$")
    if (!person.isModified('password') || person.password.startsWith('$2b$')) {
        return next();  // Skip if not modified or already hashed
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(person.password, salt);
        person.password = hashedPassword;
        next();
    } catch (err) {
        return next(err);
    }
});


// // Define the comparePassword method correctly
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (err) {
        throw err;
    }
};

const User = mongoose.model('User', userSchema);
module.exports = User;
