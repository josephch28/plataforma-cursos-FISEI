// src/middlewares/validate.js
module.exports = (schema) => (req, res, next) => {
  const { error, value } = schema(req);
  if (error) return res.status(400).json({ message: 'Validación fallida', errors: error });
  req.validated = value;
  next();
};
