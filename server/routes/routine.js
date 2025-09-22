const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Routine = require('../models/Routine');

const router = express.Router();

// @route   GET /api/routine
// @desc    Get user's routines
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const routines = await Routine.find({ 
      userId: req.user._id, 
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json({ routines });
  } catch (error) {
    console.error('Error fetching routines:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/routine
// @desc    Add new routine
// @access  Private
router.post('/', [
  auth,
  body('name')
    .notEmpty()
    .withMessage('Routine name is required')
    .isLength({ max: 100 })
    .withMessage('Routine name must be less than 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('time')
    .notEmpty()
    .withMessage('Time is required'),
  body('frequency')
    .optional()
    .isIn(['daily', 'weekly', 'twice-weekly', 'monthly'])
    .withMessage('Invalid frequency'),
  body('category')
    .optional()
    .isIn(['exercise', 'medication', 'diet', 'sleep', 'hygiene', 'therapy', 'other'])
    .withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      name, 
      description, 
      time, 
      frequency, 
      category, 
      duration, 
      endDate,
      goals 
    } = req.body;

    const routine = new Routine({
      userId: req.user._id,
      name,
      description,
      time,
      frequency: frequency || 'daily',
      category: category || 'other',
      duration: duration || 30,
      endDate: endDate ? new Date(endDate) : null,
      goals: goals || { targetDays: 0 }
    });

    await routine.save();

    res.status(201).json({ 
      message: 'Routine added successfully',
      routine 
    });
  } catch (error) {
    console.error('Error adding routine:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/routine/:id
// @desc    Update routine
// @access  Private
router.put('/:id', [
  auth,
  body('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Routine name must be less than 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('frequency')
    .optional()
    .isIn(['daily', 'weekly', 'twice-weekly', 'monthly'])
    .withMessage('Invalid frequency'),
  body('category')
    .optional()
    .isIn(['exercise', 'medication', 'diet', 'sleep', 'hygiene', 'therapy', 'other'])
    .withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      name, 
      description, 
      time, 
      frequency, 
      category, 
      duration, 
      endDate, 
      isActive,
      goals 
    } = req.body;
    
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (time !== undefined) updateData.time = time;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (category !== undefined) updateData.category = category;
    if (duration !== undefined) updateData.duration = duration;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (goals !== undefined) updateData.goals = goals;

    const routine = await Routine.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true }
    );

    if (!routine) {
      return res.status(404).json({ message: 'Routine not found' });
    }

    res.json({ 
      message: 'Routine updated successfully',
      routine 
    });
  } catch (error) {
    console.error('Error updating routine:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/routine/:id
// @desc    Delete routine
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const routine = await Routine.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!routine) {
      return res.status(404).json({ message: 'Routine not found' });
    }

    res.json({ message: 'Routine deleted successfully' });
  } catch (error) {
    console.error('Error deleting routine:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/routine/:id/complete
// @desc    Mark routine as completed
// @access  Private
router.post('/:id/complete', [
  auth,
  body('completed')
    .isBoolean()
    .withMessage('Completed must be a boolean'),
  body('notes')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Notes must be less than 200 characters'),
  body('duration')
    .optional()
    .isNumeric()
    .withMessage('Duration must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { completed, notes, duration } = req.body;

    const routine = await Routine.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!routine) {
      return res.status(404).json({ message: 'Routine not found' });
    }

    // Add completion record
    routine.completionHistory.push({
      completed,
      notes,
      duration
    });

    // Update streak
    if (completed) {
      routine.goals.currentStreak += 1;
      if (routine.goals.currentStreak > routine.goals.longestStreak) {
        routine.goals.longestStreak = routine.goals.currentStreak;
      }
    } else {
      routine.goals.currentStreak = 0;
    }

    await routine.save();

    res.json({ 
      message: 'Routine completion recorded successfully',
      routine 
    });
  } catch (error) {
    console.error('Error recording routine completion:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/routine/stats
// @desc    Get routine statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const routines = await Routine.find({ userId: req.user._id });
    
    const stats = {
      totalRoutines: routines.length,
      activeRoutines: routines.filter(r => r.isActive).length,
      totalCompletions: routines.reduce((sum, r) => sum + r.completionHistory.length, 0),
      averageStreak: routines.length > 0 ? 
        routines.reduce((sum, r) => sum + r.goals.currentStreak, 0) / routines.length : 0,
      categoryBreakdown: {}
    };

    // Category breakdown
    routines.forEach(routine => {
      if (!stats.categoryBreakdown[routine.category]) {
        stats.categoryBreakdown[routine.category] = 0;
      }
      stats.categoryBreakdown[routine.category]++;
    });

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching routine stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;




