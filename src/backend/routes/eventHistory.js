const eventHistory = require('../eventHistory')

function setupEventHistoryRoutes (app) {
  // Get all events
  app.get('/api/events', (req, res) => {
    const limit = parseInt(req.query.limit) || 50
    const events = eventHistory.getAll(limit)
    res.json({ events, count: events.length })
  })

  // Get events by type
  app.get('/api/events/:type', (req, res) => {
    const { type } = req.params
    const limit = parseInt(req.query.limit) || 50
    const events = eventHistory.getByType(type, limit)
    res.json({ events, count: events.length, type })
  })

  // Get event statistics
  app.get('/api/events-stats', (req, res) => {
    const stats = eventHistory.getStats()
    res.json(stats)
  })

  // Clear event history (useful for testing)
  app.post('/api/events/clear', (req, res) => {
    eventHistory.clear()
    res.json({ success: true, message: 'Event history cleared' })
  })
}

module.exports = { setupEventHistoryRoutes }
