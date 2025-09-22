const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up MediLingo...\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  console.log(`✅ Node.js version: ${nodeVersion.trim()}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js v14 or higher.');
  process.exit(1);
}

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, 'server', '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medilingo
JWT_SECRET=your_jwt_secret_key_here_change_in_production
TRANSLATION_API_URL=https://cc9c464c728d.ngrok-free.app/translate
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file in server directory');
} else {
  console.log('✅ .env file already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...\n');

try {
  console.log('Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('\nInstalling server dependencies...');
  execSync('cd server && npm install', { stdio: 'inherit' });
  
  console.log('\nInstalling client dependencies...');
  execSync('cd client && npm install', { stdio: 'inherit' });
  
  console.log('\n✅ All dependencies installed successfully!');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Make sure MongoDB is running on your system');
console.log('2. Update the .env file with your MongoDB connection string if needed');
console.log('3. Run "npm run dev" to start the development server');
console.log('4. Open http://localhost:3000 in your browser');
console.log('\nHappy coding! 🚀');
















