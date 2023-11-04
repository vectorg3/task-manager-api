import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import UserModel from '../models/User.js';

export const signUp = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors.array()[0]);
        }
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        let checkUserName = await UserModel.findOne({ userName: req.body.userName });
        if (checkUserName)
            return res
                .status(400)
                .json({ msg: 'That username is already taken' });
        const doc = new UserModel({
            userName: req.body.userName,
            passwordHash: hash,
            tasks: req.body.tasks ?? []
        });

        const user = await doc.save();

        const token = jwt.sign(
            {
                _id: user._id,
            },
            'secretKey',
            {
                expiresIn: '30d',
            }
        );

        const { passwordHash, ...userData } = user._doc;

        res.json({
            ...userData,
            token,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            msg: 'Fail on sign up',
        });
    }
};

export const login = async (req, res) => {
    try {
        const user = await UserModel.findOne({ userName: req.body.userName });

        if (!user) {
            return res.status(404).json({
                msg: 'User was not found',
            });
        }

        const isValidPass = await bcrypt.compare(
            req.body.password,
            user._doc.passwordHash
        );

        if (!isValidPass) {
            return res.status(404).json({
                msg: 'Неверный логин или пароль',
            });
        }

        const token = jwt.sign(
            {
                _id: user._id,
            },
            'secretKey',
            {
                expiresIn: '30d',
            }
        );

        const { passwordHash, ...userData } = user._doc;

        res.json({
            ...userData,
            token,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            msg: 'Failed authentication',
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                msg: 'User was not found',
            });
        }
        const { createdAt, updatedAt, __v, ...userData } =
            user._doc;

        res.json({
            ...userData,
        });
    } catch (err) {
        console.log(err);
        return res.status(403).json({
            msg: 'No access',
        });
    }
};

export const saveTasks = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);
        if(!user){
            return res.status(403).json({
                msg: 'User was not found'
            })
        }
        user.tasks = req.body;
        console.log(user)

        await user.save();
        
        return res.json({
            tasks: req.body
        });
    } catch (error) {
        return res.status(500).json({
            msg: 'Error while saving tasks'
        })
    }
}