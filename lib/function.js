const crypto = require('crypto');

function generateApikey(input, password) {
  const key = crypto.scryptSync(password, 'salt', 16);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let encryptedText = cipher.update(input, 'utf8', 'hex');
  encryptedText += cipher.final('hex');
  
  const encryptedData = iv.toString('hex') + encryptedText;
  return 'CAF-'+encryptedData.substr(0, 12);
}
module.exports.generateApikey = generateApikey

function getHashedPassword(password) {
  const sha256 = crypto.createHash('sha256');
  const hash = sha256.update(password).digest('base64');
  return hash;
}
module.exports.getHashedPassword = getHashedPassword