const autuser = require('../models/user');
const { generateToken } = require('../services/user');
const sendEmail = require('../services/sendEmail');
// const validator = require('validator');
const validator = require('deep-email-validator');

async function registerUser(req, res) {
   console.log('Registration attempt:');
    const { fullName, email, password } = req.body;

    // Full name validation: required, at least 3 chars, only letters and spaces
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 3) {
        return res.status(400).json({ error: 'Full name is required and must be at least 3 characters.' });
    }
    if (!/^[a-zA-Z\s]+$/.test(fullName.trim())) {
        return res.status(400).json({ error: 'Full name can only contain letters and spaces.' });
    }

    // const allowedDomains = ['mul.edu.pk'];
    // const emailDomain = email.split('@')[1].toLowerCase();
    // if (allowedDomains.includes(emailDomain)) { 
    // } else {
    //     const result = await validator.validate(email, {
    //         validateSMTP: true 
    //     });
    //     if (!result.valid) {
    //         return res.status(400).json({
    //             error: "Invalid email address"
    //         });
    //     }
    // }
    const allowedDomains = ['mul.edu.pk'];
    const emailDomain = email.split('@')[1].toLowerCase();


    if (allowedDomains.includes(emailDomain) ||
        emailDomain === 'edu.pk' ||
        emailDomain.endsWith('.edu.pk')) {

    } else {
        const result = await validator.validate(email, {
            validateSMTP: true
        });
        if (!result.valid) {
            return res.status(400).json({
                error: "Invalid email address"
            });
        }
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (password.includes(' ')) {
        return res.status(400).json({
            error: 'Password cannot contain white spaces.'
        });
    }
    // Disallow problematic special punctuation for extra security
    const forbiddenPunct = /[,';"<>\\/%]/;
    if (forbiddenPunct.test(password)) {
        return res.status(400).json({
            error: 'Password cannot contain any of the following characters: , ; " \' < > \\ / %'
        });
    }
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            error: 'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.'
        });
    }
    if(password.length<8 || password.length>15){
        return res.status(400).json({
            error: 'Password must be between 8 and 15 characters long.'
        });
    }

    try {
        const existingUser = await autuser.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists with this email' });
        }

        const user = await autuser.create({ fullName, email, password });

        sendEmail(user.email, "Verification Email", "Please Activate Your Account", `<a href="${process.env.CLIENT_URL}/auth/activate/${user._id}">Click here</a> to activate your account`);



        return res.status(201).json({ message: 'Registered successfully. Now activate your account' });

    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
async function loginUser(req, res) {
    console.log('Login attempt:');
    const { email, password } = req.body;
    try {
        const user = await autuser.authenticate(email, password);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        if (!user.isActive) {
            return res.status(401).json({ error: 'Please activate your account' });

        }

        const token = generateToken(user);
        res.cookie('jwttoken', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });

        res.status(200).json({ message: 'Login successful', token });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(401).json({ error: err.message });
    }

}

async function activationAccount(req, res) {
    const { id } = req.params;
    const user = await autuser.findById(id);
    if (!user) {
        return res.status(404).send('User not found');
    }
    user.isActive = true;
    await user.save();
    res.send('Account activation successful. You can now log in.');
}


function generatePassword() {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+[]{}|;:,.<>?';

    // Random helper
    const getRandomChar = (chars) => chars[Math.floor(Math.random() * chars.length)];

    // Password length: 8–12
    const length = Math.floor(Math.random() * 5) + 8;

    // Minimum required: 1 uppercase, 1 number, 1 special
    const upperChar = getRandomChar(upper);
    const lowerLength = Math.max(2, length - 5); // Ensure enough lowercase
    const lowerChars = Array.from({ length: lowerLength }, () => getRandomChar(lower)).join('');
    const numberChars = Array.from({ length: 2 }, () => getRandomChar(numbers)).join('');
    const specialChars = Array.from({ length: length - (1 + lowerLength + 2) }, () => getRandomChar(symbols)).join('');


    const password = upperChar + lowerChars + numberChars + specialChars;

    return password;
}


let newPassword = "";



async function resetPassword(req, res) {
    const { email } = req.body;
    try {
        const user = await autuser.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        newPassword = generatePassword();
        sendEmail(user.email, "Password Reset Request", `Your new password is: ${newPassword}`, `<a href="${process.env.CLIENT_URL}/auth/confirm-reset-password/${user._id}">Click here</a> <span>to reset your password</span> <br>
            <p>Note: Your new password is: ${newPassword}</p>
            `);
        return res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (err) {
        console.error('Password reset error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function confirmResetPassword(req, res) {

    const { id } = req.params;
    try {
        const user = await autuser.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.password = newPassword;
        await user.save();
        return res.status(200).send('Your password has been reset successfully!');
    } catch (err) {
        console.error('Confirm reset password error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
async function Logout(req, res) {
    try {
        console.log('request received for logout');
        res.clearCookie('jwttoken');
        return res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
module.exports = {
    registerUser,
    loginUser,
    activationAccount,
    resetPassword,
    confirmResetPassword,
    Logout
};