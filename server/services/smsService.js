const axios = require('axios');

class SMSService {
  constructor() {
    // For demo purposes, we'll simulate SMS sending
    // In production, you would use a real SMS service like Twilio, AWS SNS, etc.
    this.isEnabled = process.env.SMS_ENABLED === 'true';
    this.apiKey = process.env.SMS_API_KEY;
    this.apiUrl = process.env.SMS_API_URL || 'https://api.example-sms.com/send';
  }

  // Send SMS notification
  async sendSMS(phoneNumber, message) {
    try {
      if (!this.isEnabled) {
        console.log(`[SMS SIMULATION] To: ${phoneNumber}`);
        console.log(`[SMS SIMULATION] Message: ${message}`);
        return { success: true, message: 'SMS sent successfully (simulated)' };
      }

      // Real SMS service integration would go here
      const response = await axios.post(this.apiUrl, {
        to: phoneNumber,
        message: message,
        apiKey: this.apiKey
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return { success: true, message: 'SMS sent successfully', data: response.data };
    } catch (error) {
      console.error('SMS sending error:', error);
      return { success: false, message: 'Failed to send SMS', error: error.message };
    }
  }

  // Send medicine reminder
  async sendMedicineReminder(user, medicine) {
    const message = `🏥 MediLingo Reminder\n\n` +
      `It's time to take your medicine:\n` +
      `💊 ${medicine.name}\n` +
      `📏 Dosage: ${medicine.dosage}\n` +
      `⏰ Time: ${medicine.time}\n` +
      `📅 Frequency: ${medicine.frequency}\n\n` +
      `Please take your medicine as prescribed. If you have any questions, consult your doctor.\n\n` +
      `- MediLingo Team`;

    return await this.sendSMS(user.mobileNumber, message);
  }

  // Send routine reminder
  async sendRoutineReminder(user, routine) {
    const message = `🏥 MediLingo Reminder\n\n` +
      `It's time for your routine:\n` +
      `🏃 ${routine.name}\n` +
      `⏰ Time: ${routine.time}\n` +
      `📝 Description: ${routine.description}\n` +
      `📅 Frequency: ${routine.frequency}\n\n` +
      `Stay healthy and consistent with your routine!\n\n` +
      `- MediLingo Team`;

    return await this.sendSMS(user.mobileNumber, message);
  }

  // Send appointment reminder
  async sendAppointmentReminder(user, appointment) {
    const message = `🏥 MediLingo Reminder\n\n` +
      `You have an upcoming appointment:\n` +
      `👨‍⚕️ Doctor: ${appointment.doctorName}\n` +
      `📅 Date: ${appointment.date}\n` +
      `⏰ Time: ${appointment.time}\n` +
      `📍 Location: ${appointment.location}\n\n` +
      `Please arrive 15 minutes early. If you need to reschedule, contact the clinic.\n\n` +
      `- MediLingo Team`;

    return await this.sendSMS(user.mobileNumber, message);
  }

  // Send emergency alert
  async sendEmergencyAlert(user, emergencyType, details) {
    const message = `🚨 MediLingo Emergency Alert\n\n` +
      `Emergency Type: ${emergencyType}\n` +
      `Details: ${details}\n` +
      `Time: ${new Date().toLocaleString()}\n\n` +
      `Please contact emergency services immediately if needed.\n` +
      `Emergency Number: 911\n\n` +
      `- MediLingo Team`;

    return await this.sendSMS(user.mobileNumber, message);
  }
}

module.exports = new SMSService();




