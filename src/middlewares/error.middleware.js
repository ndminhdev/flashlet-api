const errorHandler = (err, req, resp, next) => {
  // disable next line in production mode
  console.log(err);
  if (err.errors) {
    err.code = 422;
  }

  const { code, message, data, value } = err;
  resp.status(code || 500).json({
    message,
    data: data || value
  });
};

export default errorHandler;
