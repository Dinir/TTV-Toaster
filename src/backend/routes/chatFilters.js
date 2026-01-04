const chatListener = require('../twitch/chatListener')

/**
 * Chat Filter Configuration Routes
 *
 * Allows users to configure chat message filters
 */

function setupChatFilterRoutes (app) {
  /**
   * GET /api/chat/filters
   * Get current chat filters
   */
  app.get('/api/chat/filters', (req, res) => {
    const filters = chatListener.getFilters()
    res.json(filters)
  })

  /**
   * POST /api/chat/filters
   * Update chat filters
   */
  app.post('/api/chat/filters', async (req, res) => {
    try {
      await chatListener.saveFilters(req.body)
      res.json({ success: true, filters: chatListener.getFilters() })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  })

  /**
   * POST /api/chat/filters/reset
   * Reset filters to defaults
   */
  app.post('/api/chat/filters/reset', async (req, res) => {
    try {
      await chatListener.saveFilters({
        enabled: true,
        conditions: {
          startsWithPrefix: '!',
          mentionsBot: false,
          containsKeywords: [],
          fromSpecificUsers: [],
          minLength: 0,
          maxLength: 0
        },
        rateLimit: {
          enabled: true,
          maxMessagesPerSecond: 10
        }
      })
      res.json({ success: true, filters: chatListener.getFilters() })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  })
}

module.exports = { setupChatFilterRoutes }
