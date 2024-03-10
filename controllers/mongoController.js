const Users = require('../models/Users');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await Users.find();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createUser = async (req, res) => {
    const { name, email, age } = req.body;
    try {
        const newUser = new Users({ name, email, age });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

