import { cacheInstance } from '../cache/LRUCache.js';

export const getCacheStats = async (req, res) => {
  try {
    const stats = cacheInstance.getStats();
    const memory = process.memoryUsage();

    return res.json({
      ...stats,
      heapUsedMB: parseFloat((memory.heapUsed / 1024 / 1024).toFixed(2)),
      heapTotalMB: parseFloat((memory.heapTotal / 1024 / 1024).toFixed(2)),
      rssMB: parseFloat((memory.rss / 1024 / 1024).toFixed(2)),
      uptime: process.uptime()
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
