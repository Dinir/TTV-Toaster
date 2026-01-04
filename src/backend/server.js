const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const path = require('path')
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

// Import Twitch event listener
const eventListener = require('./twitch/eventListener')

// Start server
server.listen(PORT, async () => {
  console.log(`Twitch Toaster server running on http://localhost:${PORT}`)
  console.log('Waiting for Twitch events...')

  // Initialize Twitch EventSub listener
  try {
    await eventListener.initialize()
    console.log('Twitch integration ready!')
  } catch (error) {
    console.error('Failed to start Twitch listener:', error.message)
    console.error('Server will run but Twitch events will not be received.')
  }
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...')
  await eventListener.stop()
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
