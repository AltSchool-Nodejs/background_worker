const express = require('express');
const JobNames = require('./jobs/names');
const { enqueue, getCounts } = require('./jobs/queue');

const PORT = Number(process.env.PORT) || 8000;

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

/** Example: optional ops endpoint — do not expose in public internet without auth */
app.get('/queue/stats', async (_req, res, next) => {
  try {
    const counts = await getCounts();
    res.json(counts);
  } catch (err) {
    next(err);
  }
});

/**
 * Typical flow: persist the user, then enqueue side effects (email, analytics, etc.).
 * The HTTP response returns immediately; the worker sends the email.
 */
app.post('/users', async (req, res, next) => {
  try {
    const { email, name } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'email is required' });
    }

    // await userModel.create({ email, name }) …

    await enqueue(JobNames.SEND_WELCOME_EMAIL, {
      to: email,
      name: name || 'there',
    });

    return res.status(201).json({
      message: 'User registered; welcome email queued',
    });
  } catch (err) {
    return next(err);
  }
});

app.use((err, _req, res, _next) => {
  console.error('[server]', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`API listening on http://127.0.0.1:${PORT}`);
});
