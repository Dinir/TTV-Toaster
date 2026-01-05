/**
 * Event History Manager
 *
 * Stores recent events in memory for replay and debugging
 */

class EventHistory {
  constructor (maxEvents = 50) {
    this.maxEvents = maxEvents
    this.events = []
  }

  /**
   * Add an event to history
   * @param {string} type - Event type
   * @param {object} data - Event data
   */
  add (type, data) {
    const event = {
      id: Date.now() + Math.random(), // Unique ID
      type,
      data,
      timestamp: Date.now()
    }

    this.events.unshift(event) // Add to beginning

    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents)
    }

    return event
  }

  /**
   * Get all events
   * @param {number} limit - Max number of events to return
   */
  getAll (limit = 50) {
    return this.events.slice(0, limit)
  }

  /**
   * Get events by type
   * @param {string} type - Event type to filter by
   * @param {number} limit - Max number of events to return
   */
  getByType (type, limit = 50) {
    return this.events
      .filter(event => event.type === type)
      .slice(0, limit)
  }

  /**
   * Get event by ID
   * @param {number} id - Event ID
   */
  getById (id) {
    return this.events.find(event => event.id === id)
  }

  /**
   * Clear all events
   */
  clear () {
    this.events = []
  }

  /**
   * Get event statistics
   */
  getStats () {
    const stats = {
      total: this.events.length,
      byType: {}
    }

    this.events.forEach(event => {
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1
    })

    return stats
  }
}

// Export singleton instance
module.exports = new EventHistory()
