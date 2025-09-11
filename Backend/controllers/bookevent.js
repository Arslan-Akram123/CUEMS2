const bookingEventSchema = require('../models/bookevent');
const eventSchema = require('../models/events');
const paymentSchema = require('../models/payment');
const sendEmail = require('../services/sendEmail');
const bookEvent = async (req, res) => {
    // console.log(req.body);
    const { notes, eventId } = req.body;
   
    // notes validation
    if (notes && notes.trim() !== '') {
        const trimmedNotes = notes.trim();
        if (trimmedNotes.length < 3 || trimmedNotes.length > 50) {
            return res.status(400).json({ error: 'Notes must be between 3 and 50 characters' });
        } else if (!/^[a-zA-Z0-9\s.,!?'"-]+$/.test(trimmedNotes)) {
            return res.status(400).json({ error: 'Notes can only contain letters, numbers, spaces, and basic punctuation (.,!?\'-)' });
        }
    }else{
        return res.status(400).json({ error: 'Notes are required' });
    }

    const userId = req.user.id;
    const availableSeats = await eventSchema.findById(eventId).select('totalSubscribers');
    if (availableSeats.totalSubscribers <= 0) {
        return res.status(400).json({ error: 'No more seats available' });
    }
    const findusers = await bookingEventSchema.findOne({ user: userId, event: eventId });
    if (!findusers) {
        const newBooking = new bookingEventSchema({ user: userId, event: eventId, bookingNotes: notes.trim() });
        try {
            const savedBooking = await newBooking.save();
            res.status(201).json(savedBooking);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(400).json({ error: 'You have already booked this event' });
    }
};

async function getNewBookings(req, res) {
    // console.log("get new bookings called");
    try {
        const newBookings = await bookingEventSchema.find().populate('user').populate('event').sort({ createdAt: -1 });
        const filterbookings = newBookings.filter(booking => booking.status === 'pending');
        res.status(200).json(filterbookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


async function UpdateAdminRead(req, res) {
    const { notif_id } = req.body;
    // console.log(notif_id);
    try {
        const updatedBooking = await bookingEventSchema.findByIdAndUpdate(notif_id, { adminRead: 'true' }, { new: true });
        if (!updatedBooking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.status(200).json(updatedBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getSpecificBooking(req, res) {
    const { id } = req.params;
    // console.log(" get specific booking", id);
    try {
        const specificBooking = await bookingEventSchema.findById(id).populate('user').populate('event');
        if (!specificBooking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.status(200).json(specificBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function UpdateConfirmBooking(req, res) {
    const { id } = req.params;
    try {
        const updatedBooking = await bookingEventSchema.findByIdAndUpdate(id, { status: 'confirmed', userRead: 'false' }, { new: true }).populate('user').populate('event');
        if (!updatedBooking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        const event = await eventSchema.findById(updatedBooking.event._id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        if (event.totalSubscribers <= 0) {
            return res.status(400).json({ error: 'All seats are already reserved for this event' });
        }
        // console.log("sending email to ", updatedBooking.user.email);
       
        sendEmail(updatedBooking.user.email,"Booking Update","Your booking has been confirmed","Your booking for  "+event.name+" event has been confirmed. Please proceed to payment to secure your spot.");
        event.reservedSeats += 1;
        event.totalSubscribers -= 1;
        if(event.price==0){
            updatedBooking.status='paid';
            await updatedBooking.save();
            const payload={user:updatedBooking.user._id,event:updatedBooking.event._id,amount:event.price};
            const newPayment = new paymentSchema(payload);
            await newPayment.save();
            event.reservedSeats -= 1;
            event.bookings += 1;
        }
        await event.save();
        res.status(200).json(updatedBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function UpdateCancelBooking(req, res) {
    const { id } = req.params;
    try {
        const previousstatusBooking = await bookingEventSchema.findById(id);
        const updatedBooking = await bookingEventSchema.findByIdAndUpdate(id, { status: 'cancelled', userRead: 'false' }, { new: true }).populate('user').populate('event');
        if (!updatedBooking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        const event = await eventSchema.findById(updatedBooking.event._id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
       
        // console.log("sending email to ", updatedBooking.user.email);
        sendEmail(updatedBooking.user.email, "Booking Update", "Your booking has been cancelled", "Your booking for " + event.name + " event has been cancelled. If this is a mistake, please contact us.");
        if (previousstatusBooking.status === 'pending') {
            // console.log("Booking was pending, not updating event seats.");
           return res.status(200).json(updatedBooking); 
        }
        event.reservedSeats -= 1;
        event.totalSubscribers += 1;
        await event.save();
        res.status(200).json(updatedBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getAllBookings(req, res) {
    try {
        const allBookings = await bookingEventSchema.find().populate('user').populate('event').sort({ createdAt: -1 });
        res.status(200).json(allBookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getAllUserBookings(req, res) {
    // console.log("get all user bookings called");
    const userId = req.user.id;
    try {
        const userBookings = await bookingEventSchema.find({ user: userId }).populate('user').populate('event').sort({ createdAt: -1 });
        res.status(200).json(userBookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function UpdateUserRead(req, res) {
    // console.log("update user read called");
    const { notif_id } = req.body;
    // console.log(notif_id);
    try {
        const updatedBooking = await bookingEventSchema.findByIdAndUpdate(notif_id, { userRead: 'true' }, { new: true });
        if (!updatedBooking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.status(200).json(updatedBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function completeBooking(req, res) {
    const { bookingId, eventId } = req.body;
    // console.log("bookingId", bookingId);
    // console.log("event id", eventId);
    try {
        const updatedBooking = await bookingEventSchema.findByIdAndUpdate(bookingId, { status: 'paid' }, { new: true }).populate('user').populate('event');
        if (!updatedBooking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        const event = await eventSchema.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        const payload={user:updatedBooking.user._id,event:updatedBooking.event._id,amount:event.price};
       const newPayment = new paymentSchema(payload);
       await newPayment.save();
        event.reservedSeats -= 1;
        event.bookings += 1;
        await event.save();
        res.status(200).json(updatedBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports = { bookEvent, getNewBookings, UpdateAdminRead, getSpecificBooking, UpdateConfirmBooking, UpdateCancelBooking, getAllBookings, getAllUserBookings, UpdateUserRead, completeBooking };