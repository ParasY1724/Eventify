const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinary = require('../utils/cloudinary');

const authController = {
  getUser: async (req, res) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  },
  register: async (req, res) => {
    try {
      const { email, password, name, phone } = req.body;
      let avatarUrl = '';

      // Upload avatar if provided
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        avatarUrl = result.secure_url;
      }

      const user = new User({ 
        email, 
        password, 
        name, 
        phone,
        avatarUrl 
      });
      
      await user.save();
      
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.status(201).json({ 
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          avatarUrl: user.avatarUrl
        }, 
        token 
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid login credentials');
      }
      
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ 
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          avatarUrl: user.avatarUrl
        }, 
        token 
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  updateUser: async (req, res) => {
    try {
      const userId = req.user._id; 
      console.log(req.body);
      const { name, phone, email } = req.body;
      let avatarUrl = req.user.avatarUrl;
  
      // Handle avatar upload if a new one is provided
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        avatarUrl = result.secure_url;
      }
  
      // Update user in database
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { name, phone, email, avatarUrl },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json({
        user: {
          _id: updatedUser._id,
          email: updatedUser.email,
          name: updatedUser.name,
          phone: updatedUser.phone,
          avatarUrl: updatedUser.avatarUrl
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }  
};

module.exports = authController;