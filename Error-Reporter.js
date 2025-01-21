const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging purposes
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
    });
  };
  
  export default errorHandler;
  