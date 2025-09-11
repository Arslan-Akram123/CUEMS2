const express = require('express');
const multer = require('multer');
const { addProfileData,getProfileData,ChangePassword,updateProfileStatus,getAllUsers } = require('../controllers/setting');
const { handleMulterError } = require('../middlewares/multer');
const Router = express.Router();



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../Frontend/public/uploads/');
  },
  filename: function (req, file, cb) {
    
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});

Router.post('/addProfileData', upload.single('profileImage'), handleMulterError, addProfileData);
Router.get('/getProfileData',getProfileData);
Router.post('/change-password',ChangePassword); 
Router.get('/getAllUsers',getAllUsers);
Router.put('/updateProfileData',updateProfileStatus);


module.exports = Router;