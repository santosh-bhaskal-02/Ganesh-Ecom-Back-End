
function errorHandler(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: "Unauthorized User" });
    }

    if (err.name === 'ValidationError') {
        return res.status(401).json({ message: err });
    }

    if (err.name === "UnauthorizedError") {
        return res.status(401).json({ message: "Invalid or missing token." });
    }
    
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal Server Error" });

}
module.exports = errorHandler;