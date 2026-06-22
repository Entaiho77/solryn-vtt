const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/races', require('./routes/races'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/spells', require('./routes/spells'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/creatures', require('./routes/creatures'));
app.use('/api/reference', require('./routes/reference'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'Solryn API is running' });
});

app.listen(PORT, () => {
  console.log(`Solryn API listening on http://localhost:${PORT}`);
});
