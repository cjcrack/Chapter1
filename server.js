const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit.log');

function ensureData(){
  if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if(!fs.existsSync(ACCOUNTS_FILE)) fs.writeFileSync(ACCOUNTS_FILE, '[]');
  if(!fs.existsSync(AUDIT_FILE)) fs.writeFileSync(AUDIT_FILE, '');
}

function readAccounts(){
  return JSON.parse(fs.readFileSync(ACCOUNTS_FILE));
}

function writeAccounts(accs){
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accs, null, 2));
}

function audit(action, detail){
  fs.appendFileSync(AUDIT_FILE, JSON.stringify({time:new Date().toISOString(), action, detail}) + '\n');
}

const captchas = {};
function generateCaptcha(){
  const a = Math.floor(Math.random()*10);
  const b = Math.floor(Math.random()*10);
  const id = crypto.randomBytes(8).toString('hex');
  captchas[id] = a + b;
  return {id, a, b};
}

app.get('/api/captcha', (req,res) => {
  res.json(generateCaptcha());
});

app.post('/api/register', (req,res) => {
  const {username, contact, name, identity, age, captchaId, captchaAnswer} = req.body;
  if(!username || !contact || !name || !identity || age === undefined || !captchaAnswer){
    return res.status(400).json({error:'required'});
  }
  if(parseInt(age,10) < 18){
    return res.status(400).json({error:'age'});
  }
  if(!captchas[captchaId] || parseInt(captchaAnswer,10) !== captchas[captchaId]){
    return res.status(400).json({error:'captcha'});
  }
  delete captchas[captchaId];

  const accounts = readAccounts();
  if(accounts.some(a => a.username === username || a.contact === contact)){
    return res.status(400).json({error:'duplicate'});
  }

  const acc = {username, contact, name, identity, age: parseInt(age,10)};
  accounts.push(acc);
  writeAccounts(accounts);
  audit('createAccount', acc.username);
  res.json({message:'ok', name});
});

ensureData();
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Server listening on ' + port);
});
