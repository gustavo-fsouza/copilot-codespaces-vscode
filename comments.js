//Create web server

//Import express
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { Comment } = require('../models');
const { asyncHandler } = require('../middleware/async-handler');
const { authenticateUser } = require('../middleware/auth-user');

//GET /api/comments 200 - Returns a list of comments (including the user that owns each comment)
router.get('/', asyncHandler(async (req, res) => {
    const comments = await Comment.findAll();
    res.json(comments);
}));

//GET /api/comments/:id 200 - Returns the comment (including the user that owns the comment) for the provided comment ID
router.get('/:id', asyncHandler(async (req, res) => {
    const comment = await Comment.findByPk(req.params.id);
    res.json(comment);
}
));

//POST /api/comments 201 - Creates a comment, sets the Location header to the URI for the comment, and returns no content
router.post('/', authenticateUser, [
    check('comment').exists({ checkNull: true, checkFalsy: true })
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        res.status(400).json({ errors: errorMessages });
    } else {
        const comment = await Comment.create(req.body);
        res.status(201).location(`/api/comments/${comment.id}`).end();
    }
}));

//PUT /api/comments/:id 204 - Updates a comment and returns no content
router.put('/:id', authenticateUser, [
    check('comment').exists({ checkNull: true, checkFalsy: true })
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        res.status(400).json({ errors: errorMessages });
    } else {
        const comment = await Comment.findByPk(req.params.id);
        await comment.update(req.body);
        res.status(204).end();
    }
}));

//DELETE /api/comments/:id 204 - Deletes a comment and returns no content
router.delete('/:id', authenticateUser, asyncHandler(async (req, res) => {
    const comment = await Comment.findByPk(req.params.id);
    await comment.destroy();
    res.status(204).end();
}));

module.exports = router;
