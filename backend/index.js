import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import editionsRouter from './routes/editions.js';
import speakersRouter from './routes/speakers.js';
import episodesRouter from './routes/episodes.js';
import reelsRouter from './routes/reels.js';
import schedulesRouter from './routes/schedules.js';
import scheduleTasksRouter from './routes/schedule_tasks.js';
import loginRouter from './routes/login.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/login', loginRouter);
app.use('/api/editions', editionsRouter);
app.use('/api/speakers', speakersRouter);
app.use('/api/episodes', episodesRouter);
app.use('/api/reels', reelsRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/schedule-tasks', scheduleTasksRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
