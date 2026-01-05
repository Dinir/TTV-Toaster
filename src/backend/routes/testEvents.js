const eventBridge = require('../eventBridge')

function setupTestEventRoutes (app) {
  // Test event endpoint
  app.post('/api/test/:eventType', (req, res) => {
    const { eventType } = req.params

    const mockEvents = {
      raid: {
        username: 'teststreamer',
        displayName: 'TestStreamer',
        viewerCount: 42,
        profileImageUrl: 'https://static-cdn.jtvnw.net/jtv_user_pictures/default_profile_image-300x300.png',
        broadcasterType: 'partner',
        description: 'Just a test raid from a partner streamer',
        gameName: 'Just Chatting',
        gameId: '509658',
        title: 'Testing TTV Toaster!'
      },
      follow: {
        username: 'newfollower',
        displayName: 'NewFollower',
        profileImageUrl: 'https://static-cdn.jtvnw.net/jtv_user_pictures/default_profile_image-300x300.png',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days old
        description: 'A test follower account'
      },
      subscribe: {
        username: 'testsub',
        displayName: 'TestSub',
        tier: '1000',
        isGift: false,
        profileImageUrl: 'https://static-cdn.jtvnw.net/jtv_user_pictures/default_profile_image-300x300.png',
        broadcasterType: 'affiliate',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365) // 1 year old
      },
      gift: {
        username: 'generousgifter',
        displayName: 'GenerousGifter',
        amount: 5,
        tier: '1000',
        isAnonymous: false,
        profileImageUrl: 'https://static-cdn.jtvnw.net/jtv_user_pictures/default_profile_image-300x300.png',
        cumulativeAmount: 10
      },
      cheer: {
        username: 'bitscheerer',
        displayName: 'BitsCheerer',
        bits: 100,
        message: 'PogChamp Great stream! Cheer100',
        isAnonymous: false,
        profileImageUrl: 'https://static-cdn.jtvnw.net/jtv_user_pictures/default_profile_image-300x300.png',
        broadcasterType: ''
      },
      redemption: {
        username: 'redeemer',
        displayName: 'Redeemer',
        rewardTitle: 'Hydrate!',
        rewardCost: 500,
        rewardPrompt: 'Make the streamer drink water',
        userInput: 'Please drink some water!',
        profileImageUrl: 'https://static-cdn.jtvnw.net/jtv_user_pictures/default_profile_image-300x300.png',
        redeemedAt: new Date()
      },
      chat: {
        username: 'chatter',
        displayName: 'Chatter',
        message: '!hello This is a test chat message',
        color: '#FF6347',
        isMod: true,
        isSubscriber: true,
        isVip: false,
        badges: { moderator: '1', subscriber: '12' }
      }
    }

    const mockEvent = mockEvents[eventType]

    if (!mockEvent) {
      return res.status(400).json({
        error: 'Invalid event type',
        validTypes: Object.keys(mockEvents)
      })
    }

    // Send test event through the appropriate event bridge handler
    const handlerMap = {
      raid: 'handleRaid',
      follow: 'handleFollow',
      subscribe: 'handleSubscribe',
      gift: 'handleGift',
      cheer: 'handleCheer',
      redemption: 'handleRedemption',
      chat: 'handleChatMessage'
    }

    const handlerMethod = handlerMap[eventType]
    if (handlerMethod && typeof eventBridge[handlerMethod] === 'function') {
      eventBridge[handlerMethod](mockEvent)
    }

    res.json({
      success: true,
      message: `Test ${eventType} event triggered`,
      data: mockEvent
    })
  })
}

module.exports = { setupTestEventRoutes }
