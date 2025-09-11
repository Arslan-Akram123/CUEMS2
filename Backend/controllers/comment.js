const commentSchema = require("../models/comment");


const getAllComments = async (req, res) => {
    try {
        const comments = await commentSchema.find().populate('user').populate('event').sort({ createdAt: -1 });
        // console.log(comments);
        res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const addComment = async (req, res) => {
    const {eventId ,comment,rating } = req.body;
    if (!comment || comment.trim() === '') {
        return res.status(400).json({ error: 'Comment is required' });
    }else if (comment.trim().length < 3 || comment.trim().length >100) {
        return res.status(400).json({ error: 'Comment must be between 3 and 100 characters' });
    } else if (!/^[a-zA-Z0-9\s.,!?'"-]+$/.test(comment)) {
        return res.status(400).json({ error: 'Comment can only contain letters, numbers, spaces, and basic punctuation (.,!?\'-)' });
    }
    // console.log(req.user);
    const userId = req.user.id;
    const trimcomment=comment.trim();
    const payload = { user:userId, event:eventId, comment:trimcomment, rating };
    try {
        const newComment = await commentSchema.create(payload);
        res.status(201).json(newComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getCommentById = async (req, res) => {
    const eventId = req.params.id;
    try {
        const comments = await commentSchema.find({ event: eventId })
            .populate('user')
            .populate('event');
            // console.log(comments);
        res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

async function deleteComment(req, res) {
    const commentId = req.params.id;
    try {
        const deletedComment = await commentSchema.findByIdAndDelete(commentId);
        if (!deletedComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { getAllComments, addComment, getCommentById,deleteComment };