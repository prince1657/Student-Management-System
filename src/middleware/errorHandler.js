function notFound(req, res) {
  res.status(404).json({
    status: 404,
    success: false,
    message: `No API route matches ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) console.error(err.stack);
  res.status(status).json({
    status,
    success: false,
    message: status >= 500 ? 'Internal server error' : err.message
  });
}

module.exports = { notFound, errorHandler };
