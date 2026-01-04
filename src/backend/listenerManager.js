/**
 * Listener Manager
 *
 * Manages Twitch EventSub and Chat listeners
 * Starts them after user authentication
 */

const eventListener = require('./twitch/eventListener')
const chatListener = require('./twitch/chatListener')

class ListenerManager {
  constructor () {
    this.isRunning = false
  }

  /**
   * Start all Twitch listeners
   */
  async start () {
    if (this.isRunning) {
      console.log('[ListenerManager] Listeners already running')
      return
    }

    console.log('[ListenerManager] Starting Twitch listeners...')

    // Initialize Twitch EventSub listener
    try {
      await eventListener.initialize()
      console.log('[ListenerManager] EventSub ready!')
    } catch (error) {
      console.error('[ListenerManager] Failed to start EventSub:', error.message)
    }

    // Initialize Twitch Chat listener
    try {
      await chatListener.initialize()
      console.log('[ListenerManager] Chat ready!')
    } catch (error) {
      console.error('[ListenerManager] Failed to start Chat:', error.message)
    }

    this.isRunning = true
    console.log('[ListenerManager] All listeners started')
  }

  /**
   * Stop all Twitch listeners
   */
  async stop () {
    if (!this.isRunning) {
      return
    }

    console.log('[ListenerManager] Stopping Twitch listeners...')

    try {
      await eventListener.stop()
    } catch (error) {
      console.error('[ListenerManager] Error stopping EventSub:', error.message)
    }

    try {
      await chatListener.stop()
    } catch (error) {
      console.error('[ListenerManager] Error stopping Chat:', error.message)
    }

    this.isRunning = false
    console.log('[ListenerManager] All listeners stopped')
  }

  /**
   * Restart all listeners (useful after re-authentication)
   */
  async restart () {
    await this.stop()
    await this.start()
  }
}

// Export singleton instance
module.exports = new ListenerManager()
