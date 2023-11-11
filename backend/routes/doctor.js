const express = require("express");
const {
	getDoctorProfile,
	editDetails,
	getDoctorAppointments,
	getDoctorPatients,
	changePassword,
	addFreeAppointmentSlots,
	acceptContract,
	scheduleFollowUp,
	viewWallet,
	uploadHealthRecords,

} = require("../controllers/doctorController");

const authorize = require('../middlewares/authorization')

const router = express.Router();
const multer = require('multer');
const path = require('path');

// Get Doctor's Details
router.get("/", authorize, getDoctorProfile);

// Edit Email, Affiliation, Rate (?)
router.patch("/", authorize, editDetails);

// View All Doctor's Appointments
router.get("/appointments", authorize, getDoctorAppointments);

// View All Doctor's Patients
router.get("/patients", authorize, getDoctorPatients);

//handle uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "public/");
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
	},
});
const upload = multer({ storage });
//Upload a Patient's health record
router.post(
	"/uploadHealthRecord", 
	authorize, 
	upload.single("healthRecord"),
	uploadHealthRecords)

// Change Password
router.patch("/changePassword", authorize, changePassword);

//Add Doctor Free Slots
router.post("/addFreeAppointmentSlots", authorize, addFreeAppointmentSlots);

//Accept Employment Contract
router.patch("/acceptContract", authorize, acceptContract);

//Add Patient Follow Up
router.post("/scheduleFollowUp", authorize, scheduleFollowUp)

//Get Amount in my Wallet
router.get('/wallet', authorize, viewWallet)

//View Health Records of My Patients
// router.get("/healthRecords", authorize, viewMyPatientHealthRecords);

module.exports = router;
