const GiftcardBot = require('../src/bot');
const database = require('../src/database/mongodb');

let botInstance = null;

async function getBot() {
  if (!botInstance) {
    botInstance = new GiftcardBot();
    await database.connect();
    // Initialize bot without launching (for webhook mode)
    botInstance.bot.use(botInstance.setupMiddleware());
    botInstance.setupHandlers();
    botInstance.setupActions();
  }
  return botInstance;
}

module.exports = async (req, res) => {
  try {
    const bot = await getBot();
    await bot.bot.handleUpdate(req.body, res);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};