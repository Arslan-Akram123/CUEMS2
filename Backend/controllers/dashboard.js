const category = require("../models/category");
const university = require("../models/universities");
const event = require("../models/events");
const user = require("../models/user");
const bookEvent = require("../models/bookevent");
const comment = require("../models/comment");

const getDashboardData = async (req, res) => {
    try {
        const categories = await category.find();
        const universities = await university.find();
        const events = await event.find();
        const users = await user.find();
        const bookEvents = await bookEvent.find();
        const comments = await comment.find();
       const confirmorpaidbookevents= bookEvents.filter(be=>be.status=="confirmed" || be.status=="paid");
    //    console.log(confirmorpaidbookevents.length);
       const payload={totalUsers:users.length,totalCategories:categories.length,totalUniversities:universities.length,totalEvents:events.length,totalBookEvents:confirmorpaidbookevents.length,totalComments:comments.length};
        res.status(200).json(payload);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { getDashboardData };