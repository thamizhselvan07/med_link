const jwt = require('jsonwebtoken');
const { User } = require('../config/db');

exports.login = async (req, res) => {
    const { username: email, password, role: selectedRole } = req.body;

    try {
        let user = await User.findOne({ email });

        // Logic for Patient Auto-Signup
        if (!user) {
            if (selectedRole === 'patient') {
                // Create new patient account automatically
                user = await User.create({
                    name: email.split('@')[0],
                    email,
                    password,
                    role: 'patient'
                });

                const token = jwt.sign({ id: user._id, role: 'patient' }, process.env.JWT_SECRET || 'secret_key', {
                    expiresIn: 86400 // 24 hours
                });

                return res.status(200).send({
                    auth: true,
                    token: token,
                    role: 'patient',
                    username: email,
                    name: user.name
                });
            } else {
                // Doctors/Nurses/Admin must have predefined accounts
                return res.status(404).send({ auth: false, message: "Account not found" });
            }
        }

        const passwordIsValid = await user.matchPassword(password);
        if (!passwordIsValid) return res.status(401).send({ auth: false, message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret_key', {
            expiresIn: 86400 // 24 hours
        });

        res.status(200).send({
            auth: true,
            token: token,
            role: user.role,
            username: user.email,
            name: user.name
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}, 'id name email role createdAt');
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
