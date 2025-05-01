const express = require("express");
const { sendChatMessage } = require("../services/aiChatService");

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { messages, userId } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "messages array is required." });
    }

    const result = await sendChatMessage({ messages, userId });

    if (result.error) {
      return res.status(500).json({ message: result.error });
    }

    return res.status(200).json({ reply: result.reply });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = router;
