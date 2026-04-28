import type { NextFunction, Request, Response } from 'express';
import express from 'express';
const app = express();

app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.send('Hello World!');
});

export default app;
