
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const routes = require('./routes'); // <-- unico punto di montaggio

const app = express();
// Configura CORS per permettere credentials
app.use(cors({
  origin: 'http://localhost:5173', // URL del frontend Vite
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.get('/api/health', (req, res) => res.json({ status: 'OK', ts: new Date().toISOString() }));

app.use('/api', routes);            // <-- tutte le route montate qui

// 404 & error handler alla fine
app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Route not founded' }));

app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
module.exports = app;
