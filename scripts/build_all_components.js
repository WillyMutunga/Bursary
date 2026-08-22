const fs = require('fs');
const path = require('path');
const compDir = path.join(__dirname, '..', 'frontend', 'src', 'components');
if (!fs.existsSync(compDir)) fs.mkdirSync(compDir, { recursive: true });
console.log('Builder initialized');
