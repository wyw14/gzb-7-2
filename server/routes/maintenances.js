const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../utils/storage');

const router = express.Router();

router.get('/', (req, res) => {
  const maintenances = readJSON('maintenances.json', []);
  const users = readJSON('users.json', []);
  const { instrumentId, ownerId, type } = req.query;

  let result = maintenances;

  if (instrumentId) {
    result = result.filter(m => m.instrumentId === instrumentId);
  }
  if (ownerId) {
    result = result.filter(m => m.ownerId === ownerId);
  }
  if (type) {
    result = result.filter(m => m.type === type);
  }

  result.sort((a, b) => new Date(b.date) - new Date(a.date));

  const enriched = result.map(m => ({
    ...m,
    owner: users.find(u => u.id === m.ownerId) || null
  }));

  res.json(enriched);
});

router.get('/:id', (req, res) => {
  const maintenances = readJSON('maintenances.json', []);
  const users = readJSON('users.json', []);
  const record = maintenances.find(m => m.id === req.params.id);

  if (!record) {
    return res.status(404).json({ error: '保养记录不存在' });
  }

  res.json({
    ...record,
    owner: users.find(u => u.id === record.ownerId) || null
  });
});

router.post('/', (req, res) => {
  const instruments = readJSON('instruments.json', []);
  const instrument = instruments.find(i => i.id === req.body.instrumentId);

  if (!instrument) {
    return res.status(400).json({ error: '乐器不存在' });
  }

  if (req.body.ownerId !== instrument.ownerId) {
    return res.status(403).json({ error: '只有乐器主人才能添加保养记录' });
  }

  const validTypes = ['换弦', '调音', '维修', '清洁', '配件更换'];
  if (!req.body.type || !validTypes.includes(req.body.type)) {
    return res.status(400).json({ error: '保养类型无效，可选：换弦、调音、维修、清洁、配件更换' });
  }

  const maintenances = readJSON('maintenances.json', []);

  const newRecord = {
    id: 'm' + uuidv4().slice(0, 8),
    instrumentId: req.body.instrumentId,
    ownerId: req.body.ownerId,
    type: req.body.type,
    date: req.body.date || new Date().toISOString().split('T')[0],
    description: req.body.description || '',
    cost: req.body.cost || 0,
    createdAt: new Date().toISOString()
  };

  maintenances.push(newRecord);
  writeJSON('maintenances.json', maintenances);

  res.json({ success: true, maintenance: newRecord });
});

router.put('/:id', (req, res) => {
  const maintenances = readJSON('maintenances.json', []);
  const idx = maintenances.findIndex(m => m.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ error: '保养记录不存在' });
  }

  const validTypes = ['换弦', '调音', '维修', '清洁', '配件更换'];
  if (req.body.type && !validTypes.includes(req.body.type)) {
    return res.status(400).json({ error: '保养类型无效' });
  }

  maintenances[idx] = { ...maintenances[idx], ...req.body, id: maintenances[idx].id };
  writeJSON('maintenances.json', maintenances);

  res.json({ success: true, maintenance: maintenances[idx] });
});

router.delete('/:id', (req, res) => {
  const maintenances = readJSON('maintenances.json', []);
  const filtered = maintenances.filter(m => m.id !== req.params.id);

  if (filtered.length === maintenances.length) {
    return res.status(404).json({ error: '保养记录不存在' });
  }

  writeJSON('maintenances.json', filtered);
  res.json({ success: true });
});

module.exports = router;
