const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const reminderService = require('./services/reminderService');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/translate', require('./routes/translate'));
app.use('/api/history', require('./routes/history'));
app.use('/api/tips', require('./routes/tips'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/medicine', require('./routes/medicine'));
app.use('/api/routine', require('./routes/routine'));

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medilingo')
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Start reminder service
  reminderService.start();
});




