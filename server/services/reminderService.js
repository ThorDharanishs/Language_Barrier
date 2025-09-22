const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const Routine = require('../models/Routine');
const User = require('../models/User');
const smsService = require('./smsService');

class ReminderService {
  constructor() {
    this.isRunning = false;
  }

  // Start the reminder service
  start() {
    if (this.isRunning) {
      console.log('Reminder service is already running');
      return;
    }

    try {
      // Check for medicine reminders every minute
      cron.schedule('* * * * *', async () => {
        try {
          await this.checkMedicineReminders();
        } catch (error) {
          console.error('Error in medicine reminder check:', error);
        }
      });

      // Check for routine reminders every minute
      cron.schedule('* * * * *', async () => {
        try {
          await this.checkRoutineReminders();
        } catch (error) {
          console.error('Error in routine reminder check:', error);
        }
      });

      this.isRunning = true;
      console.log('Reminder service started');
    } catch (error) {
      console.error('Error starting reminder service:', error);
    }
  }

  // Stop the reminder service
  stop() {
    if (this.isRunning) {
      cron.getTasks().forEach(task => task.destroy());
      this.isRunning = false;
      console.log('Reminder service stopped');
    }
  }

  // Check medicine reminders
  async checkMedicineReminders() {
    try {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      const currentDate = now.toDateString();

      // Get all active medicines
      const medicines = await Medicine.find({ isActive: true })
        .populate('userId', 'mobileNumber username');

      for (const medicine of medicines) {
        const medicineTime = medicine.time;
        
        // Check if it's time for this medicine
        if (this.isTimeForReminder(medicineTime, currentTime, medicine.frequency)) {
          // Check if we already sent a reminder today
          const reminderKey = `medicine_${medicine._id}_${currentDate}`;
          const alreadySent = await this.wasReminderSent(reminderKey);
          
          if (!alreadySent) {
            await this.sendMedicineReminder(medicine);
            await this.markReminderSent(reminderKey);
          }
        }
      }
    } catch (error) {
      console.error('Error checking medicine reminders:', error);
    }
  }

  // Check routine reminders
  async checkRoutineReminders() {
    try {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      const currentDate = now.toDateString();

      // Get all active routines
      const routines = await Routine.find({ isActive: true })
        .populate('userId', 'mobileNumber username');

      for (const routine of routines) {
        const routineTime = routine.time;
        
        // Check if it's time for this routine
        if (this.isTimeForReminder(routineTime, currentTime, routine.frequency)) {
          // Check if we already sent a reminder today
          const reminderKey = `routine_${routine._id}_${currentDate}`;
          const alreadySent = await this.wasReminderSent(reminderKey);
          
          if (!alreadySent) {
            await this.sendRoutineReminder(routine);
            await this.markReminderSent(reminderKey);
          }
        }
      }
    } catch (error) {
      console.error('Error checking routine reminders:', error);
    }
  }

  // Check if it's time for a reminder
  isTimeForReminder(scheduledTime, currentTime, frequency) {
    // For now, we'll do exact time matching
    // In a more sophisticated system, you might want to add some tolerance
    if (scheduledTime === currentTime) {
      return true;
    }

    // For twice-daily medicines, check if it's been 12 hours since last reminder
    if (frequency === 'twice-daily') {
      // This would require more complex logic to track last reminder time
      // For now, we'll just check the scheduled time
      return scheduledTime === currentTime;
    }

    return false;
  }

  // Send medicine reminder
  async sendMedicineReminder(medicine) {
    try {
      const result = await smsService.sendMedicineReminder(medicine.userId, medicine);
      console.log(`Medicine reminder sent to ${medicine.userId.username}:`, result);
    } catch (error) {
      console.error('Error sending medicine reminder:', error);
    }
  }

  // Send routine reminder
  async sendRoutineReminder(routine) {
    try {
      const result = await smsService.sendRoutineReminder(routine.userId, routine);
      console.log(`Routine reminder sent to ${routine.userId.username}:`, result);
    } catch (error) {
      console.error('Error sending routine reminder:', error);
    }
  }

  // Check if reminder was already sent today
  async wasReminderSent(reminderKey) {
    // In a real application, you would store this in a database
    // For now, we'll use a simple in-memory cache
    return this.reminderCache && this.reminderCache[reminderKey];
  }

  // Mark reminder as sent
  async markReminderSent(reminderKey) {
    if (!this.reminderCache) {
      this.reminderCache = {};
    }
    this.reminderCache[reminderKey] = true;
  }

  // Clear daily reminders (call this at midnight)
  clearDailyReminders() {
    if (this.reminderCache) {
      this.reminderCache = {};
    }
  }
}

module.exports = new ReminderService();
