import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 LurkingPods API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
