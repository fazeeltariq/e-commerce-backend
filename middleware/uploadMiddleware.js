import multer from "multer";

const storage = multer.memoryStorage(); // Don't save uploaded files on the hard disk. Keep them in RAM (memory).

 // configure multer
const upload = multer({   storage,
    
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

export default upload;



 // The image is stored temporarily in memory as a Buffer.

// Suppose you upload:
// iphone.png
// Internally, it's just binary data:

// 101010101110001010...

// Node.js stores that binary data in a Buffer.

// Example:
// req.files[0].buffer

// might look like:
// <Buffer 89 50 4e 47 0d 0a 1a 0a ...>
// You don't need to read it yourself—it's just the image data in memory.