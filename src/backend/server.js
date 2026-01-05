const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Setup OAuth routes
const { setupAuthRoutes } = require('./routes/auth')
setupAuthRoutes(app)

// Setup chat filter routes
const { setupChatFilterRoutes } = require('./routes/chatFilters')
setupChatFilterRoutes(app)

// Setup test event routes
const { setupTestEventRoutes } = require('./routes/testEvents')
setupTestEventRoutes(app)

// Setup event history routes
const { setupEventHistoryRoutes } = require('./routes/eventHistory')
setupEventHistoryRoutes(app)

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../../public')))

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected to scratch page:', socket.id)

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Export io for use in other modules
module.exports = { io }

// Import event bridge after io is exported
require('./eventBridge')

// Import listener manager
const listenerManager = require('./listenerManager')

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\nError: Port ${PORT} is already in use!`)
    console.error('Please stop the other process or change the PORT in your .env file')
    process.exit(1)
  } else {
    console.error('Server error:', error)
    process.exit(1)
  }
})

// Start server
server.listen(PORT, async () => {
  console.log(`TTV Toaster server running on http://localhost:${PORT}`)
  console.log('Visit http://localhost:3000 to get started!')

  // Check if user is already authenticated
  const tokensPath = path.join(__dirname, '../../.tokens.json')
  if (fs.existsSync(tokensPath)) {
    console.log('Found existing authentication, starting listeners...')
    try {
      await listenerManager.start()
    } catch (error) {
      console.error('Failed to start listeners:', error.message)
      console.error('Please re-authenticate at http://localhost:3000')
    }
  } else {
    console.log('No authentication found. Please login at http://localhost:3000')
  }
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...')
  await listenerManager.stop()
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
