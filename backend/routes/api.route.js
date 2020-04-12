const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

// Home
app.get('/how-is-today', (req, res, next) => {

});

// Student Model
const studentSchema = require('../models/StudentSchema');

// CREATE Student
router.route('/create-student').post((req, res, next) => {
    studentSchema.create(req.body, (error, data) => {
        if (error)
            return next(error);
        else {
            console.log('New student:');
            console.log(data);
            res.json(data);
        }
    });
});

// Get Student List
router.route('/get-student-list').get((req, res, next) => {
    studentSchema.find((error, data) => {
        if (error)
            return next(error);
        else
            res.json(data);
    });
});

// Get Single Student
router.route('/get-student/:id').get((req, res, next) => {
    studentSchema.findById(req.params.id, (error, data) => {
        if (error)
            return next(error);
        else
            res.json(data);
    });
});

// Update Student
router.route('/update-student/:id').put((req, res, next) => {
    studentSchema.findByIdAndUpdate(req.params.id, { $set: req.body },
        (error, data) => {
            if (error) {
                console.log(error);
                return next(error);
            } else {
                res.json(data);
                console.log('Student updated successfully!');
            }
        });
});

// Delete Student
router.route('/delete-student/:id').delete((req, res, next) => {
    studentSchema.findByIdAndRemove(req.params.id, (error, data) => {
        if (error)
            return next(error);
        else
            res.status(200).json({ msg: data });
    });
});

module.exports = router;