const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Medicine = require('../models/Medicine');

const router = express.Router();

// @route   GET /api/medicine
// @desc    Get user's medicines
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const medicines = await Medicine.find({ 
      userId: req.user._id, 
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json({ medicines });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/medicine
// @desc    Add new medicine
// @access  Private
router.post('/', [
  auth,
  body('name')
    .notEmpty()
    .withMessage('Medicine name is required')
    .isLength({ max: 100 })
    .withMessage('Medicine name must be less than 100 characters'),
  body('dosage')
    .notEmpty()
    .withMessage('Dosage is required')
    .isLength({ max: 50 })
    .withMessage('Dosage must be less than 50 characters'),
  body('time')
    .notEmpty()
    .withMessage('Time is required'),
  body('frequency')
    .optional()
    .isIn(['daily', 'twice-daily', 'weekly', 'as-needed'])
    .withMessage('Invalid frequency')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, dosage, time, frequency, instructions, endDate } = req.body;

    const medicine = new Medicine({
      userId: req.user._id,
      name,
      dosage,
      time,
      frequency: frequency || 'daily',
      instructions,
      endDate: endDate ? new Date(endDate) : null
    });

    await medicine.save();

    res.status(201).json({ 
      message: 'Medicine added successfully',
      medicine 
    });
  } catch (error) {
    console.error('Error adding medicine:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/medicine/:id
// @desc    Update medicine
// @access  Private
router.put('/:id', [
  auth,
  body('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Medicine name must be less than 100 characters'),
  body('dosage')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Dosage must be less than 50 characters'),
  body('frequency')
    .optional()
    .isIn(['daily', 'twice-daily', 'weekly', 'as-needed'])
    .withMessage('Invalid frequency')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, dosage, time, frequency, instructions, endDate, isActive } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (dosage !== undefined) updateData.dosage = dosage;
    if (time !== undefined) updateData.time = time;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({ 
      message: 'Medicine updated successfully',
      medicine 
    });
  } catch (error) {
    console.error('Error updating medicine:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/medicine/:id
// @desc    Delete medicine
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error('Error deleting medicine:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/medicine/:id/side-effect
// @desc    Report side effect
// @access  Private
router.post('/:id/side-effect', [
  auth,
  body('description')
    .notEmpty()
    .withMessage('Side effect description is required'),
  body('severity')
    .isIn(['mild', 'moderate', 'severe'])
    .withMessage('Invalid severity level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { description, severity } = req.body;

    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        $push: {
          sideEffects: {
            description,
            severity
          }
        }
      },
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({ 
      message: 'Side effect reported successfully',
      medicine 
    });
  } catch (error) {
    console.error('Error reporting side effect:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;




