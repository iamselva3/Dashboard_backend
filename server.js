// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import helmet from 'helmet';
// import connectDB from './config/db.js';
// import errorHandler from './middleware/errorMiddleware.js';

// // Import routes
// import dataRoutes from './routes/dataRoutes.js';
// import analyticsRoutes from './routes/analyticsRoutes.js';
// import filterRoutes from './routes/filterRoutes.js';

// // Load environment variables
// dotenv.config();

// // Connect to database
// await connectDB();

// const app = express();

// // Middleware
// app.use(helmet({
//   crossOriginResourcePolicy: false,
// }));
// app.use(cors({
//   origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use('/api/data', dataRoutes);
// app.use('/api/analytics', analyticsRoutes);
// app.use('/api/filters', filterRoutes);

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.json({
//     success: true,
//     message: 'Server is running',
//     timestamp: new Date().toISOString()
//   });
// });

// // Error handling middleware
// app.use(errorHandler);

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
//   console.log(`CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
// });

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

import connectDB from './config/db.js';
import errorHandler from './middleware/errorMiddleware.js';

// Routes
import dataRoutes from './routes/dataRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import filterRoutes from './routes/filterRoutes.js';

// Load env
dotenv.config();

// Connect DB
await connectDB();

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);


const allowedOrigins = [
  'http://localhost:3000',
  'https://dashboard-frontend-h627j3thb-selvas-projects-cd77bb6e.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {

      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS not allowed'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, 
  })
);

app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/data', dataRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/filters', filterRoutes);


app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});


app.use(errorHandler);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
