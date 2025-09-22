const express = require('express');
const router = express.Router();
const DoctorTip = require('../models/DoctorTip');
const auth = require('../middleware/auth');

// Get all approved tips
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    
    const query = { isApproved: true };
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const tips = await DoctorTip.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('doctorId', 'username email profile.specialization profile.experience');
    
    const total = await DoctorTip.countDocuments(query);
    
    res.json({
      tips,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching tips:', error);
    res.status(500).json({ message: 'Error fetching tips' });
  }
});

// Get tip by ID
router.get('/:id', async (req, res) => {
  try {
    const tip = await DoctorTip.findById(req.params.id)
      .populate('doctorId', 'username email profile.specialization profile.experience');
    
    if (!tip) {
      return res.status(404).json({ message: 'Tip not found' });
    }
    
    // Increment view count
    tip.views += 1;
    await tip.save();
    
    res.json({ tip });
  } catch (error) {
    console.error('Error fetching tip:', error);
    res.status(500).json({ message: 'Error fetching tip' });
  }
});

// Create new tip (doctors only)
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    
    // Check if user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can create tips' });
    }
    
    const tip = new DoctorTip({
      title,
      content,
      category,
      tags: tags || [],
      doctorId: req.user.id,
      doctorName: req.user.username,
      doctorSpecialization: req.user.profile?.specialization || 'General Practice',
      doctorExperience: req.user.profile?.experience || 0
    });
    
    await tip.save();
    
    res.status(201).json({ 
      message: 'Tip created successfully',
      tip 
    });
  } catch (error) {
    console.error('Error creating tip:', error);
    res.status(500).json({ message: 'Error creating tip' });
  }
});

// Update tip (doctor who created it only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    
    const tip = await DoctorTip.findById(req.params.id);
    
    if (!tip) {
      return res.status(404).json({ message: 'Tip not found' });
    }
    
    // Check if user is the creator or admin
    if (tip.doctorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this tip' });
    }
    
    tip.title = title || tip.title;
    tip.content = content || tip.content;
    tip.category = category || tip.category;
    tip.tags = tags || tip.tags;
    
    await tip.save();
    
    res.json({ 
      message: 'Tip updated successfully',
      tip 
    });
  } catch (error) {
    console.error('Error updating tip:', error);
    res.status(500).json({ message: 'Error updating tip' });
  }
});

// Delete tip (doctor who created it only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const tip = await DoctorTip.findById(req.params.id);
    
    if (!tip) {
      return res.status(404).json({ message: 'Tip not found' });
    }
    
    // Check if user is the creator or admin
    if (tip.doctorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this tip' });
    }
    
    await DoctorTip.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Tip deleted successfully' });
  } catch (error) {
    console.error('Error deleting tip:', error);
    res.status(500).json({ message: 'Error deleting tip' });
  }
});

// Like tip
router.post('/:id/like', auth, async (req, res) => {
  try {
    const tip = await DoctorTip.findById(req.params.id);
    
    if (!tip) {
      return res.status(404).json({ message: 'Tip not found' });
    }
    
    tip.likes += 1;
    await tip.save();
    
    res.json({ 
      message: 'Tip liked successfully',
      likes: tip.likes 
    });
  } catch (error) {
    console.error('Error liking tip:', error);
    res.status(500).json({ message: 'Error liking tip' });
  }
});

// Get tips by doctor
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const tips = await DoctorTip.find({ 
      doctorId: req.params.doctorId,
      isApproved: true 
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await DoctorTip.countDocuments({ 
      doctorId: req.params.doctorId,
      isApproved: true 
    });
    
    res.json({
      tips,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching doctor tips:', error);
    res.status(500).json({ message: 'Error fetching doctor tips' });
  }
});

// Search tips
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const searchQuery = {
      isApproved: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };
    
    const tips = await DoctorTip.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('doctorId', 'username profile.specialization');
    
    const total = await DoctorTip.countDocuments(searchQuery);
    
    res.json({
      tips,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error searching tips:', error);
    res.status(500).json({ message: 'Error searching tips' });
  }
});

module.exports = router;

