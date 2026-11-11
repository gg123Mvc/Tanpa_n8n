import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/auth.js';
import authRoutes from './routes/authRoutes.js';
import formRoutes from './routes/formRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import aiAgentRoutes from './routes/aiAgentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import knowledgeBaseRoutes from './routes/knowledgeBaseRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — allow all origins in development
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/form', formRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai-agent', aiAgentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/knowledge-base', knowledgeBaseRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route tidak ditemukan' });
});

// Error Handler
app.use(errorHandler);

export default app;

// Start Server locally if not running on Vercel
if (!process.env.VERCEL) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS: semua origin diizinkan`);
  });

  // Handle port already in use
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} sudah digunakan. Jalankan perintah ini untuk mematikan proses lama:`);
      console.error(`   Get-NetTCPConnection -LocalPort ${PORT} | Select OwningProcess | Stop-Process`);
      process.exit(1);
    }
    throw err;
  });
}
