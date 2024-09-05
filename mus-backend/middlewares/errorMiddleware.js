// middlewares/errorMiddleware.js
const errorMiddleware = (err, req, res) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
};

module.exports = errorMiddleware;
