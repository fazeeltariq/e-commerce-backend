const errorHandler = (err, req, res, next) => {

    const statusCode = res.statusCode === 200 ? 500  : res.statusCode;

    
    res.status(statusCode).json( {
        message: err.message,
        stack:  process.env.NODE_ENV === "production"   ? null : err.stack
        }
    );

};

export default errorHandler;


// err.stack

// contains the stack trace showing where the error occurred.
