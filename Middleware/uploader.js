const multer=require('multer')
const path = require('path')


// files storage//cb=callback
const imagesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"./uploads")
  },
  filename: function (req, file, cb) {
    console.log("Original File Name:", file.originalname);
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const extention = path.extname(file.originalname)
    const fileName = uniquePrefix + extention;
    
    cb(null, fileName)
  }
})

// files filter

const imageFilter = (req, file, cb) => {
  if (['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype) ||  ['jpeg', 'png', 'jpg'].includes(file.originalname.split('.').pop().toLowerCase())) {
    cb(null, true)
  } else if(file.size >  102400){
    cb("file is too large",false)

  }else {
    cb('Unsupported File Format', false)
  }
}

// files uploaders

module.exports.uploadImages = multer({
  storage: imagesStorage,
  fileFilter: imageFilter
})

//--------------------------------------------------------------------------

// module.exports.uploadImage = (req, res, next) => {
//   console.log(req.user.userId)
//   if (!req.files) {
//     return res.status(400).json({ message: "please upload a photo" });
//   }

//   file = req.files.profileImage;
//   console.log(req.files.profileImage)
//   //make sure the file is image
//   if (!file.mimetype.startsWith("image")) {
    
//     return res.status(400).json({ message: "please upload an image" });
//   }

//   //make sure the size of photo is good
//   if (file.size > 1000000) {
//     return res.status(400).json({ message: "file is too big" });
//   }
//   //rename the photo
//   file.name = `./uploads/photo_${req.user.userId}${path.parse(file.name).ext}`;
//   file.mv(file.name, async (err) => {
//     if (err) {
//       console.log(err);
//       return res.status(500).json({ message: "problem with photo" });
//     }
//   });
//   req.body.photo = file.name;
//   next();
// };
