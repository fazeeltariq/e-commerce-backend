const asyncHandler = (fn) => {

    // we make this function because express enforces this format 
    // we do not  directly return promise because then express did not have (req, res, next)
    // An async function always returns a Promise.
    return (req, res, next) => {

        Promise.resolve(fn(req, res, next)).catch(next);

    };

};

export default asyncHandler;
