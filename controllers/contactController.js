/**
 * Contact form controller
 * Validates and acknowledges messages (no persistence for simplicity)
 */

exports.submit = async (req, res) => {
  try {
    // Validation handled by validate middleware
    res.json({ success: true, message: 'Thank you for your message. We will get back to you soon.' });
  } catch (err) {
    console.error('Contact submit error:', err);
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
};
