const express = require('express');
const connectDB = require('./db');  // ✅ Correct! 
connectDB();
const bodyParser = require('body-parser');
const path = require('path');
// const User = require('./models/User');

// Import your models for each collection
const Organizer = require('./createOrganizersCollection');
const Event = require('./createEventsCollection');
const User = require('./createUsersCollection');
const UDS = require('./createUdsCollection');
const Housekeeping = require('./createHousekeepingCollection');
const Wifi = require('./createWifiCollection');
const Purchase = require('./createPurchaseListCollection');
const Poster = require('./createPostersCollection');
const Sponsor = require('./createSponsorsCollection');
const VenuesAlloted = require('./createVenuesCollection').VenuesAlloted; // Corrected import
const VenuesPending = require('./createVenuesCollection').VenuesPending; // Corrected import
const AllVenues = require('./createVenuesCollection').AllVenues;
const FinalEvent = require('./createFinalEventsCollection');

const app = express();
const PORT = 3000;

// Middleware for JSON and URL-encoded form data
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Connect to the database


app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-eval'");

    next();
});

app.post('/verify-organizer', async (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: 'No data received',
    });
  }

  const { identity, id, password } = req.body;

  if (!identity || !id || !password) {
    return res.status(400).json({
      success: false,
      message: 'Missing credentials',
    });
  }

  try {
    const organizer = await Organizer.findOne({ identity, id, password });

    if (organizer) {
      return res.json({ success: true, user: organizer });
    } else {
      return res.json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error verifying organizer:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error',
    });
  }
});

app.post('/login', async (req, res) => {
  const { club_name, club_email, password } = req.body;

  if (!club_name || !club_email || !password) {
      return res.json({ success: false, error: 'Please fill in all fields.' });
  }

  try {
      const user = await User.findOne({ club_name, club_email, password });

      if (user) {
          return res.json({ success: true });
      } else {
          return res.json({ success: false, error: 'Invalid credentials' });
      }
  } catch (err) {
      console.error('MongoDB error during login:', err);
      return res.json({ success: false, error: 'Server error' });
  }
});

app.post('/signup', async (req, res) => {
  const { club_name, club_email, password, confirm_password } = req.body;

  if (!club_name || !club_email || !password || !confirm_password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  if (password !== confirm_password) {
      return res.status(400).json({ success: false, error: 'Passwords do not match' });
  }

  try {
      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ club_name }, { club_email }] });
      if (existingUser) {
          return res.status(400).json({ success: false, error: 'User already exists' });
      }

      // Create and save user
      const newUser = new User({ club_name, club_email, password }); // (You can hash password here)
      await newUser.save();

      return res.json({ success: true, message: 'User registered successfully' });
  } catch (err) {
      console.error('MongoDB error:', err);
      return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/register-event', async (req, res) => {
  const {
    eventName, clubName, date1, date2, venue1, venue2, venue3,
    timeFrom, timeTo, eventDescription, studentCoord1, phone1,
    studentCoord2, phone2, facultyCoord, clubEmail, fee
  } = req.body;

  try {
    const newEvent = new Event({
      eventName, clubName, date1, date2, venue1, venue2, venue3,
      timeFrom, timeTo, eventDescription, studentCoord1, phone1,
      studentCoord2, phone2, facultyCoord, clubEmail, fee
    });

    const savedEvent = await newEvent.save();
    console.log('✅ Event saved in MongoDB with ID:', savedEvent._id);

    res.json({ success: true, eventId: savedEvent._id });
  } catch (error) {
    console.error('❌ Error saving event:', error);
    res.status(500).json({ success: false, error: 'Failed to register event.' });
  }
});

app.post('/submit-requirements', async (req, res) => {
  try {
    const { clubName, eventName, eventDate, udsData, housekeepingData, wifiData } = req.body;

    // 🔹 Save UDS requirements
    const udsDocs = udsData.map(item => ({
      clubName,
      event_date: eventDate,
      event_name: eventName,
      requirement_name: item.requirement_name,
      quantity: item.quantity
    }));
    await UDS.insertMany(udsDocs);

    // 🔹 Save Housekeeping requirements
    const hkDocs = housekeepingData.map(item => ({
      clubName,
      event_date: eventDate,
      event_name: eventName,
      requirement_name: item.requirement_name,
      quantity: item.quantity
    }));
    await Housekeeping.insertMany(hkDocs);

    // 🔹 Save WiFi requirement (only one)
    const { requirement_name, quantity } = wifiData;
    await Wifi.create({
      clubName,
      event_date: eventDate,
      event_name: eventName,
      requirement_name,
      quantity
    });

    // ✅ Done
    res.json({ success: true, message: 'All requirements saved to MongoDB.' });
    
  } catch (err) {
    console.error('❌ Error saving requirements:', err);
    res.status(500).json({ success: false, error: 'Failed to save requirements.' });
  }
});

app.post('/submit-purchase-data', async (req, res) => {
  try {
    const { clubName, eventDate, eventName, onlineData, offlineData } = req.body;

    if (!clubName || !eventDate || !eventName || !Array.isArray(onlineData) || !Array.isArray(offlineData)) {
      return res.status(400).json({ success: false, error: "Missing required fields." });
    }
    const purchaseItems = [];

    // Add online data
    onlineData.forEach(item => {
      const { item_name, quantity, price, source, amount } = item;
      purchaseItems.push({
        clubName,
        event_date: eventDate,
        event_name: eventName,
        item_name,
        quantity,
        price,
        source,
        amount,
        upload_time: new Date()
      });
    });

    // Add offline data
    offlineData.forEach(item => {
      const { item_name, quantity, price, source, amount } = item;
      purchaseItems.push({
        clubName,
        event_date: eventDate,
        event_name: eventName,
        item_name,
        quantity,
        price,
        source,
        amount,
        upload_time: new Date()
      });
    });

    await Purchase.insertMany(purchaseItems);

    // Send a success response if everything went well
    res.json({ success: true, message: 'Purchase data saved successfully to MongoDB.' });

  } catch (err) {
    console.error("❌ Error saving purchase data:", err.message);
    res.status(500).json({ success: false, error: 'Failed to save purchase data.' });
  }
});

app.post('/submit-poster', async (req, res) => {
  try {
    const { clubName, eventDate, eventName, driveLink } = req.body;

    if (!clubName || !eventDate || !eventName || !driveLink) {
      return res.status(400).json({ success: false, error: "Missing required fields." });
    }

    // Create a new poster document
    const newPoster = new Poster({
      clubName,
      event_date: eventDate,
      event_name: eventName,
      drive_link: driveLink
    });

    // Save the document to MongoDB
    await newPoster.save();

    console.log(`✅ Poster saved successfully with ID ${newPoster._id}`);
    res.json({ success: true });

  } catch (err) {
    console.error("❌ Error saving poster:", err.message);
    res.status(500).json({ success: false, error: "Database insertion failed." });
  }
});

app.post('/submit-sponsors', async (req, res) => {
  const sponsors = req.body;

  if (!Array.isArray(sponsors) || sponsors.length === 0) {
    return res.status(400).json({ success: false, error: "No sponsors data provided." });
  }

  try {
    // Insert each sponsor
    for (const sponsor of sponsors) {
      const { eventDate, eventName, sponsorName, sponsorAmount, status, clubName } = sponsor;
      const uploadTime = new Date().toISOString(); // Get current time for upload_on
      const amount = parseFloat(sponsorAmount); // Ensure amount is a number

      // Create a new Sponsor document
      const newSponsor = new Sponsor({
        clubName,
        event_date: eventDate,
        event_name: eventName,
        sponsor_name: sponsorName,
        amount,
        status,
        upload_on: uploadTime
      });

      // Save the sponsor document to MongoDB
      await newSponsor.save();
    }

    // If everything is successful
    res.json({ success: true, message: 'All sponsors saved successfully.' });

  } catch (err) {
    console.error("❌ Error inserting sponsor:", err.message);
    res.status(500).json({ success: false, error: "Database insertion failed for sponsors." });
  }
});

app.get('/clubs', async (req, res) => {
  try {
    const clubs = await User.find({ club_name: { $ne: null }, club_email: { $ne: null } }).select('club_name club_email');
    
    if (clubs.length === 0) {
      return res.status(404).json({ message: 'No clubs found.' });
    }
    res.json(clubs); 
  } catch (err) {
    console.error('Error fetching clubs:', err.message);
    return res.status(500).json({ error: 'Failed to fetch clubs' });
  }
});

app.get('/events/:clubName', async (req, res) => {
  const clubName = req.params.clubName;

  try {
    // Fetch events from MongoDB based on the provided clubName
    const events = await Event.find({ clubName }).exec();

    if (events.length === 0) {
      return res.status(404).json({ message: `No events found for club: ${clubName}` });
    }

    res.json(events); // Send the events data as a JSON response
  } catch (err) {
    console.error('Error fetching events:', err.message);
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Assuming you already have imported the models: UDS, Housekeeping, Wifi

app.get('/api/requirements/:clubName', async (req, res) => {
  const clubName = req.params.clubName;
  const eventName = req.query.event;

  if (!clubName || !eventName) {
    return res.status(400).json({ error: 'Club name and event name are required.' });
  }

  try {
    const [udsData, housekeepingData, wifiData] = await Promise.all([
      UDS.find({ clubName: clubName, event_name: eventName }).lean(),
      Housekeeping.find({ clubName: clubName, event_name: eventName }).lean(),
      Wifi.find({ clubName: clubName, event_name: eventName }).lean()
    ]);

    res.status(200).json({
      uds: udsData || [],
      housekeeping: housekeepingData || [],
      wifi: wifiData || []
    });
  } catch (err) {
    console.error('Error fetching data:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});




app.get('/api/posters/:clubName', async (req, res) => {
  const clubName = req.params.clubName;
  const eventName = req.query.event;

  if (!clubName || !eventName) {
    return res.status(400).json({ error: 'Club name and event name are required' });
  }

  try {
    // Query MongoDB to find posters for the given clubName and eventName
    const posters = await Poster.find({ clubName:clubName, event_name:eventName }).exec();

    // If no posters found, return a 404 error
    if (posters.length === 0) {
      return res.status(404).json({ error: 'No posters found for this club and event' });
    }

    // Return the posters data
    res.json({ posters });
  } catch (err) {
    console.error('Error fetching posters:', err.message);
    res.status(500).json({ error: 'Failed to fetch posters data' });
  }
});
  
app.get('/api/sponsors/:clubName', async (req, res) => {
  const clubName = req.params.clubName;
  const eventName = req.query.event;
  if (!clubName || !eventName) {
    return res.status(400).json({ error: 'Club name and event name are required' });
  }
  try {
    const sponsors = await Sponsor.find({ clubName:clubName, event_name:eventName }).exec();
    if (sponsors.length === 0) {
      return res.status(404).json({ error: 'No sponsors found for this club and event' });
    }
    res.json({ sponsors });
  } catch (err) {
    console.error('Error fetching sponsors:', err.message);
    res.status(500).json({ error: 'Failed to fetch sponsors data' });
  }
});

app.get('/api/purchase/:club', async (req, res) => {
  const clubName = req.params.club;
  const eventName = req.query.event;

  if (!clubName || !eventName) {
    return res.status(400).json({ error: 'Club name and event name are required' });
  }

  try {
    // Query MongoDB to find purchase items for the given clubName and eventName
    const purchaseList = await Purchase.find({ clubName:clubName, event_name:eventName }).exec();

    // If no purchase items found, return a 404 error
    if (purchaseList.length === 0) {
      return res.status(404).json({ error: 'No purchase items found for this club and event' });
    }

    // Return the purchase list data
    res.json({ purchase: purchaseList });
  } catch (err) {
    console.error('Error fetching purchase list:', err.message);
    res.status(500).json({ error: 'Failed to fetch purchase list' });
  }
});

app.get('/api/venues', async (req, res) => {
  try {
      const venues = await VenuesPending.find().exec();
      if (venues.length === 0) {
          return res.status(404).json({ error: 'No pending venues found' });
      }
      res.json(venues);  
  } catch (err) {
      console.error('Error fetching venues:', err.message);
      res.status(500).json({ error: 'Failed to fetch venues' });
  }
});

app.get('/api/all-venues', async (req, res) => {
  try {
      const venues = await AllVenues.find().exec();
      if (venues.length === 0) {
          return res.status(404).json({ error: 'No venues found' });
      }
      res.json(venues); 
  } catch (err) {
      console.error('Error fetching venues:', err.message);
      res.status(500).json({ error: 'Failed to fetch venues' });
  }
});
  
app.get('/api/allotted-venues', async (req, res) => {
    try {
        const venuesAlloted = await VenuesAlloted.find().exec();
        if (venuesAlloted.length === 0) {
            return res.status(404).json({ error: 'No allotted venues found' });
        }
        res.json(venuesAlloted);
    } catch (err) {
        console.error('Error fetching allotted venues:', err.message);
        res.status(500).json({ error: 'Failed to fetch allotted venues' });
    }
});
  
  app.get('/api/nonallotted-venues', async (req, res) => {
  try {
      const venuesPending = await VenuesPending.find().exec();
      if (venuesPending.length === 0) {
          return res.status(404).json({ error: 'No pending venues found' });
      }
      res.json(venuesPending); 
  } catch (err) {
      console.error('Error fetching non-allotted venues:', err.message);
      res.status(500).json({ error: 'Failed to fetch pending venues' });
  }
});

app.get("/api/final-clubs", async (req, res) => {
  try {
    const clubs = await User.distinct("club_name");
    const formatted = clubs.map(name => ({ club_name: name }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching club names:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
  
app.get("/api/events/:clubName", async (req, res) => {
  const clubName = req.params.clubName;

  try {
    const events = await Event.find({ clubName });
    if (events.length === 0) {
      return res.status(404).json({ error: "No events found for this club." });
    }
    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Error fetching events." });
  }
});

app.post("/api/submit-final-event", async (req, res) => {
  const {
    present_date,
    event_name,
    club_name,
    date_allotted,
    venue_allotted,
    time_from,
    time_to,
    student_coord1,
    phone1,
    student_coord2,
    phone2,
    club_mail,
    reg_fee,
    approved_by,
    date_of_approval,
    comments
  } = req.body;

  try {
    const finalEvent = new FinalEvent({
      present_date,
      event_name,
      club_name,
      date_allotted,
      venue_allotted,
      time_from,
      time_to,
      student_coord1,
      phone1,
      student_coord2,
      phone2,
      club_mail,
      reg_fee,
      approved_by,
      date_of_approval,
      comments
    });

    await finalEvent.save();

    if (venue_allotted) {
    
      const deleteResult = await VenuesPending.deleteOne({ venue_pending: venue_allotted });
      console.log(`Deleted ${deleteResult.deletedCount} document(s) from VenuesPending`);

      // Insert into VenuesAlloted collection
      const VenueAllottedModel = new VenuesAlloted({
        date: date_allotted,
        event_name,
        club_name,
        venue_allotted,
        time_from,
        time_to
      });

      await VenueAllottedModel.save();
      console.log("Venue successfully allotted.");
    }

    res.json({ message: "Event submitted and venue updated successfully!" });

  } catch (error) {
    console.error("Error in /submit-final-event:", error);
    res.status(500).json({ error: "Failed to submit event." });
  }
});

app.get("/api/final-events", async (req, res) => {
  try {
    const finalEvents = await FinalEvent.find(); // Fetches all documents
    res.json(finalEvents);
  } catch (err) {
    console.error("Error fetching final events:", err.message);
    res.status(500).json({ error: "Error fetching final events." });
  }
});

app.get("/get-events", async (req, res) => {
  try {
    const events = await Event.find(); // Fetch all events
    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err.message);
    res.status(500).json({ error: "Error fetching events." });
  }
});
  
app.post("/update-events", async (req, res) => {
  const events = req.body.events;
  try {
    await Event.deleteMany({});
    await Event.insertMany(events);
    res.json({ message: "Events collection updated successfully." });
  } catch (err) {
    console.error("Error updating events collection:", err.message);
    res.status(500).json({ error: "Failed to update events collection." });
  }
});
  
  app.get("/get-uds", async (req, res) => {
  try {
    const udsData = await UDS.find({});
    res.json(udsData);
  } catch (err) {
    console.error("Failed to fetch UDS rows:", err.message);
    res.status(500).json({ error: "Failed to fetch UDS data." });
  }
});
  
app.post("/update-uds", async (req, res) => {
  const udsEntries = req.body.uds;

  // Validate that udsEntries is an array
  if (!Array.isArray(udsEntries)) {
    return res.status(400).json({ error: "Invalid data format. Expected an array." });
  }

  try {
    // Step 1: Clear the collection
    await UDS.deleteMany({});

    // Step 2: Validate and insert new data
    const validEntries = udsEntries.filter(entry =>
      entry.clubName && entry.event_date && entry.event_name &&
      entry.requirement_name && entry.quantity !== undefined
    );

    if (validEntries.length !== udsEntries.length) {
      console.warn("Some entries had missing fields and were not inserted.");
    }

    await UDS.insertMany(validEntries);

    res.json({ message: "UDS collection updated successfully." });
  } catch (error) {
    console.error("Error updating UDS collection:", error.message);
    res.status(500).json({ error: "Failed to update UDS collection." });
  }
});
   
app.get("/get-posters", async (req, res) => {
  try {
    const posters = await Poster.find({});
    res.json(posters);
  } catch (error) {
    console.error("Failed to fetch posters:", error.message);
    res.status(500).json({ error: "Failed to fetch posters." });
  }
});

app.post("/update-posters", async (req, res) => {
  const posters = req.body.posters;

  if (!Array.isArray(posters)) {
    return res.status(400).json({ error: "Invalid posters data." });
  }

  try {
    await Poster.deleteMany({});
    const validPosters = posters.filter(p =>
      p.clubName && p.event_date && p.event_name && p.drive_link
    ).map(p => ({
      ...p,
      upload_on: p.upload_on || null
    }));

    await Poster.insertMany(validPosters);

    res.json({ message: "Posters collection updated successfully." });
  } catch (error) {
    console.error("Failed to update posters:", error.message);
    res.status(500).json({ error: "Failed to update posters." });
  }
});

app.get("/get-purchaselist", async (req, res) => {
    try {
      const items = await Purchase.find({});
      res.json(items);
    } catch (error) {
      console.error("Failed to fetch purchase list:", error.message);
      res.status(500).json({ error: "Failed to fetch purchase list." });
    }
});
  
app.post("/update-purchaselist", async (req, res) => {
    const purchaselist = req.body.purchaselist;
  
    if (!Array.isArray(purchaselist)) {
      return res.status(400).json({ error: "Invalid purchaselist data." });
    }
  
    try {
      // Step 1: Clear existing documents
      await Purchase.deleteMany({});
  
      const validItems = purchaselist.filter(item =>
        item.clubName && item.event_date && item.event_name && item.item_name
      ).map(item => ({
        ...item,
        upload_time: item.upload_time || null
      }));
  
      await PurchaseItem.insertMany(validItems);
  
      res.json({ message: "Purchase list updated successfully." });
    } catch (error) {
      console.error("Failed to update purchase list:", error.message);
      res.status(500).json({ error: "Failed to update purchase list." });
    }
});

app.get("/get-housekeeping", async (req, res) => {
    try {
      const items = await Housekeeping.find({});
      res.json(items);
    } catch (error) {
      console.error("Failed to fetch housekeeping data:", error.message);
      res.status(500).json({ error: "Failed to fetch housekeeping data." });
    }
});
  
app.post("/update-housekeeping", async (req, res) => {
    const housekeeping = req.body.housekeeping;
  
    if (!Array.isArray(housekeeping)) {
      return res.status(400).json({ error: "Invalid housekeeping data." });
    }
  
    try {
      // Step 1: Clear existing documents
      await Housekeeping.deleteMany({});
  
      // Step 2: Insert new data
      const validItems = housekeeping.filter(item =>
        item.clubName && item.event_date && item.event_name && item.requirement_name
      ).map(item => ({
        ...item
      }));
  
      await Housekeeping.insertMany(validItems);
  
      res.json({ message: "Housekeeping table updated successfully." });
    } catch (error) {
      console.error("Failed to update housekeeping data:", error.message);
      res.status(500).json({ error: "Failed to update housekeeping data." });
    }
});

app.get("/get-wifi", async (req, res) => {
  try {
    const wifiDetails = await Wifi.find({});
    res.json(wifiDetails);
  } catch (error) {
    console.error("Failed to fetch WiFi data:", error.message);
    res.status(500).json({ error: "Failed to fetch WiFi data." });
  }
});

app.post("/update-wifi", async (req, res) => {
  const wifiDetails = req.body.wifiDetails;

  if (!Array.isArray(wifiDetails)) {
    return res.status(400).json({ error: "Invalid WiFi data format." });
  }
  try {
    await Wifi.deleteMany({});
    const validWifiDetails = wifiDetails.filter(detail =>
      detail.clubName && detail.event_date && detail.event_name && detail.requirement_name
    ).map(detail => ({
      ...detail
    }));
    await Wifi.insertMany(validWifiDetails);
    res.json({ message: "WiFi details updated successfully." });
  } catch (error) {
    console.error("Failed to update WiFi details:", error.message);
    res.status(500).json({ error: "Failed to update WiFi details." });
  }
});

app.get("/get-sponsors", async (req, res) => {
  try {
    const sponsors = await Sponsor.find({});
    res.json(sponsors);
  } catch (error) {
    console.error("Failed to fetch sponsors data:", error.message);
    res.status(500).json({ error: "Failed to fetch sponsors data." });
  }
});

app.post("/update-sponsors", async (req, res) => {
  const sponsors = req.body.sponsors; // Ensure this matches the frontend key

  if (!Array.isArray(sponsors)) {
    return res.status(400).json({ error: "Invalid sponsors data format." });
  }

  try {
    // Clear current sponsors before inserting new data
    await Sponsor.deleteMany({});

    // Filter valid sponsor details
    const validSponsors = sponsors.filter(sponsor => 
      sponsor.clubName && sponsor.event_date && sponsor.event_name && sponsor.sponsor_name
    ).map(sponsor => ({
      clubName: sponsor.clubName,
      event_date: sponsor.event_date,
      event_name: sponsor.event_name,
      sponsor_name: sponsor.sponsor_name,
      amount: sponsor.amount,
      status: sponsor.status
    }));

    // Insert valid sponsor data
    await Sponsor.insertMany(validSponsors);

    res.json({ message: "Sponsors details updated successfully." });
  } catch (error) {
    console.error("Failed to update sponsors details:", error.message);
    res.status(500).json({ error: "Failed to update sponsors details." });
  }
});


app.get("/get-organizers", async (req, res) => {
  try {
    const organizers = await Organizer.find({});
    res.json(organizers);
  } catch (error) {
    console.error("Error fetching organizers:", error.message);
    res.status(500).json({ error: "Error fetching organizers." });
  }
});

app.post("/update-organizers", async (req, res) => {
  const organizers = req.body.organizers;

  if (!Array.isArray(organizers)) {
    return res.status(400).json({ error: "Invalid organizers data format." });
  }

  try {
    await Organizer.deleteMany({});
    const validOrganizers = organizers.filter(organizer =>
      organizer.identity && organizer.id && organizer.password
    ).map(organizer => ({
      ...organizer
    }));

    await Organizer.insertMany(validOrganizers);

    res.json({ message: "Organizers table updated successfully." });
  } catch (error) {
    console.error("Error updating organizers:", error.message);
    res.status(500).json({ error: "Error updating organizers." });
  }
});

app.get("/get-final-events", async (req, res) => {
  try {
    const finalEvents = await FinalEvent.find({});
    res.json(finalEvents);
  } catch (error) {
    console.error("Error fetching final events:", error.message);
    res.status(500).json({ error: "Error fetching final events." });
  }
});

app.post("/update-final-events", async (req, res) => {
  const events = req.body.events;

  if (!Array.isArray(events)) {
    return res.status(400).json({ error: "Invalid data format. Expected an array." });
  }

  try {
    await FinalEvent.deleteMany({});
    const validEvents = events.filter(event => 
      event.present_date && event.event_name && event.club_name 
    ).map(event => ({
      ...event
    }));

    await FinalEvent.insertMany(validEvents);

    res.json({ message: "Final Events table updated successfully." });
  } catch (error) {
    console.error("Error updating final events:", error.message);
    res.status(500).json({ error: "Error updating final events." });
  }
});

app.get("/get-users", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Error fetching users." });
  }
});

app.post("/update-users", async (req, res) => {
  const users = req.body.users; // Matching the frontend's structure

  if (!Array.isArray(users)) {
    return res.status(400).json({ error: "Invalid format: expected an array under 'users'." });
  }

  try {
    // Delete all existing users before inserting the updated list
    await User.deleteMany({});
    
    // Ensure that only valid users (with required fields) are inserted
    const validUsers = users.filter(user => 
      user.club_name && user.club_email && user.password 
    ).map(user => ({
      club_name: user.club_name,
      club_email: user.club_email,
      password: user.password
    }));

    // Insert valid users into the database
    await User.insertMany(validUsers);

    res.json({ message: "Users table updated successfully." });
  } catch (error) {
    console.error("Error updating users:", error.message);
    res.status(500).json({ error: "Error updating users." });
  }
});


app.post("/update-allotted-venues", async (req, res) => {
  const venues = req.body.events; // Ensure that the request body contains 'events'

  if (!Array.isArray(venues)) {
    return res.status(400).json({ error: "Invalid format: expected an array under 'events'." });
  }

  try {
    // Step 1: Clear existing allotted venues data
    await VenuesAlloted.deleteMany({});

    // Step 2: Insert new venues
    const validVenues = venues.filter(venue => 
      venue.date && venue.event_name && venue.club_name && venue.venue_alloted && venue.time_from && venue.time_to
    ).map(venue => ({
      ...venue
    }));

    await VenueAlloted.insertMany(validVenues);

    res.json({ message: "Allotted Venues updated successfully." });
  } catch (error) {
    console.error("Error updating allotted venues:", error.message);
    res.status(500).json({ error: "Error updating allotted venues." });
  }
});

app.get("/get-all-venues", async (req, res) => {
  console.log("GET /get-all-venues called");
  try {
    const venues = await AllVenues.find({});
    console.log("Fetched venues:", venues);
    res.json(venues);
  } catch (err) {
    console.error("Failed to fetch data:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/update-all-venues", async (req, res) => {
  const venues = req.body.venues;

  // Check if the input is an array
  if (!Array.isArray(venues)) {
    return res.status(400).json({ error: "Expected an array of venues." });
  }

  // Filter valid venues (non-empty and valid 'venue_name')
  const validVenues = venues
    .filter(venue => venue.venue_name && typeof venue.venue_name === 'string' && venue.venue_name.trim() !== "")
    .map(venue => ({ venue_name: venue.venue_name.trim() })); // Optional: trims venue names

  if (validVenues.length === 0) {
    return res.status(400).json({ error: "No valid venues provided." });
  }

  try {
    // Clear the existing venues and insert the new ones
    await AllVenues.deleteMany({});  // Deletes all documents in the collection
    const insertedVenues = await AllVenues.insertMany(validVenues);  // Insert valid venues

    res.json({ message: "All venues updated successfully.", insertedVenues });
  } catch (err) {
    console.error("Error updating venues:", err.message);
    res.status(500).json({ error: "Failed to save venues." });
  }
});

app.get("/get-venues-allotted", async (req, res) => {
  console.log("GET /get-venues-allotted called");
  try {
    const venues = await VenuesAlloted.find({});
    console.log("Fetched venues:", venues);
    res.json(venues);
  } catch (err) {
    console.error("Failed to fetch venues:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/update-venues-allotted", async (req, res) => {
  const venues = req.body.venues;
  if (!Array.isArray(venues) || venues.length === 0) {
    return res.status(400).json({ error: "Invalid data format or empty venues array." });
  }

  try {
    await VenuesAlloted.deleteMany({});

    // Step 2: Insert new venue data
    const validVenues = venues.map((venue) => ({
      date: venue.date,
      event_name: venue.event_name,
      club_name: venue.club_name,
      venue_alloted: venue.venue_alloted,
      time_from: venue.time_from,
      time_to: venue.time_to
    }));

    await VenuesAlloted.insertMany(validVenues);

    res.json({ message: "VenuesAlloted data updated successfully." });
  } catch (err) {
    console.error("Failed to update VenuesAlloted:", err.message);
    res.status(500).json({ error: "Failed to update VenuesAlloted." });
  }
});

app.get("/get-venues-pending", async (req, res) => {
  console.log("GET /get-venues-pending called");

  try {
    const venues = await VenuesPending.find({});
    console.log("Fetched venues:", venues);
    res.json(venues);
  } catch (err) {
    console.error("Error fetching data:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/update-venues-pending", async (req, res) => {
  const venues = req.body.venues;
  if (!Array.isArray(venues) || venues.length === 0) {
    return res.status(400).json({ error: "Invalid data format or empty venues array." });
  }

  try {
    await VenuesPending.deleteMany({});
    const validVenues = venues.filter((venue) => venue.date && venue.venue_pending && venue.reason);

    if (validVenues.length === 0) {
      return res.status(400).json({ error: "No valid venue data to insert." });
    }
    await VenuesPending.insertMany(validVenues);
    res.json({ message: "VenuesPending data updated successfully." });
  } catch (err) {
    console.error("Failed to update VenuesPending:", err.message);
    res.status(500).json({ error: "Failed to update VenuesPending." });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const clubName = req.query.clubName;
    const events = await Event.find({ clubName });

    if (events.length === 0) {
      return res.status(404).json({ message: "No events found for this club." });
    }

    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

app.post('/api/submit-events', async (req, res) => {
  try {
    const { clubName, events } = req.body;
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: "Events array cannot be empty." });
    }
    await Event.deleteMany({ clubName });
    await Event.insertMany(events);

    res.json({ message: "Events saved successfully!" });
  } catch (err) {
    console.error("Failed to save events:", err.message);
    res.status(500).json({ error: "Failed to save events." });
  }
});

app.get('/api/uds', async (req, res) => {
  try {
    const { clubName } = req.query;

    if (!clubName) {
      return res.status(400).json({ error: 'Club name is required.' });
    }

    const udsData = await UDS.find({ clubName });

    if (udsData.length === 0) {
      return res.status(404).json({ message: 'No UDS data found for this club.' });
    }

    res.json(udsData);
  } catch (err) {
    console.error('Error fetching UDS data:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/submit-uds', async (req, res) => {
  try {
    const { clubName, uds } = req.body;

    if (!clubName || !Array.isArray(uds)) {
      return res.status(400).json({ error: 'Invalid data format or empty UDS array' });
    }
    await UDS.deleteMany({ clubName });
    await UDS.insertMany(uds);

    res.json({ message: 'UDS data submitted successfully' });
  } catch (err) {
    console.error('Failed to submit UDS data:', err.message);
    res.status(500).json({ error: 'Failed to submit UDS data.' });
  }
});

app.get('/api/housekeeping', async (req, res) => {
  try {
    const { clubName } = req.query;

    if (!clubName) {
      return res.status(400).json({ error: 'Club name is required.' });
    }

    const housekeepingData = await Housekeeping.find({ clubName });

    if (housekeepingData.length === 0) {
      return res.status(404).json({ message: 'No housekeeping data found for this club.' });
    }

    res.json(housekeepingData);
  } catch (err) {
    console.error('Error fetching housekeeping data:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/submit-housekeeping', async (req, res) => {
  try {
    const { clubName, items } = req.body;

    if (!clubName || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid data format or empty housekeeping array' });
    }
    await Housekeeping.deleteMany({ clubName });
    await Housekeeping.insertMany(items.map(item => ({
      clubName: clubName,
      event_date: item.event_date,
      event_name: item.event_name,
      requirement_name: item.requirement_name,
      quantity: item.quantity
    })));
    res.json({ message: 'Housekeeping data submitted successfully' });
  } catch (err) {
    console.error('Failed to submit housekeeping data:', err.message);
    res.status(500).json({ error: 'Failed to submit housekeeping data.' });
  }
});

app.get('/api/wifi', async (req, res) => {
  try {
    const { clubName } = req.query;
    if (!clubName) {
      return res.status(400).json({ error: 'Club name is required.' });
    }
    const wifiData = await Wifi.find({ clubName });
    if (wifiData.length === 0) {
      return res.status(404).json({ message: 'No Wi-Fi data found for this club.' });
    }
    res.json(wifiData);
  } catch (err) {
    console.error('Error fetching Wi-Fi data:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/submit-wifi', async (req, res) => {
  try {
    const { clubName, items } = req.body;

    if (!clubName || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid data format or empty Wi-Fi array' });
    }
    await Wifi.deleteMany({ clubName });
    await Wifi.insertMany(items.map(item => ({
      clubName: clubName,
      event_date: item.event_date,
      event_name: item.event_name,
      requirement_name: item.requirement_name,
      quantity: item.quantity,
    })));

    res.json({ message: 'Wi-Fi data submitted successfully.' });
  } catch (err) {
    console.error('Error inserting Wi-Fi data:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/sponsors', async (req, res) => {
  try {
    const { clubName } = req.query;
    if (!clubName) {
      return res.status(400).json({ error: 'Club name is required.' });
    }
    const sponsors = await Sponsor.find({ clubName });
    if (sponsors.length === 0) {
      return res.status(404).json({ message: 'No sponsors found for this club.' });
    }
    res.json(sponsors);
  } catch (err) {
    console.error('Error fetching sponsors:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/submit-sponsors', async (req, res) => {
  try {
    const { clubName, items } = req.body;

    if (!clubName || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid data format or empty sponsor array' });
    }
    await Sponsor.deleteMany({ clubName });
    await Sponsor.insertMany(items.map(item => ({
      clubName: clubName,
      event_date: item.event_date,
      event_name: item.event_name,
      sponsor_name: item.sponsor_name,
      amount: item.amount,
      status: item.status,
    })));

    res.json({ message: 'Sponsors data submitted successfully.' });
  } catch (err) {
    console.error('Error inserting sponsor data:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/posters', async (req, res) => {
  try {
    const { clubName } = req.query;
    if (!clubName) {
      return res.status(400).json({ error: 'Club name is required.' });
    }
    const posters = await Poster.find({ clubName });
    if (posters.length === 0) {
      return res.status(404).json({ message: 'No posters found for this club.' });
    }
    res.json(posters);
  } catch (err) {
    console.error('Error fetching posters:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/submit-posters', async (req, res) => {
  try {
    const { clubName, items } = req.body;

    if (!clubName || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid data format or empty poster array' });
    }
    await Poster.deleteMany({ clubName });
    await Poster.insertMany(items.map(item => ({
      clubName: clubName,
      event_date: item.event_date,
      event_name: item.event_name,
      drive_link: item.drive_link,
    })));

    res.json({ message: 'Posters data submitted successfully.' });
  } catch (err) {
    console.error('Error inserting poster data:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/purchases', async (req, res) => {
  try {
    const { clubName } = req.query;

    if (!clubName) {
      return res.status(400).json({ error: 'Club name is required.' });
    }

    const purchases = await Purchase.find({ clubName });

    if (purchases.length === 0) {
      return res.status(404).json({ message: 'No purchases found for this club.' });
    }

    res.json(purchases);
  } catch (err) {
    console.error('Error fetching purchases:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/submit-purchases', async (req, res) => {
  try {
    const { clubName, items } = req.body;

    if (!clubName || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid data format or empty purchase array' });
    }
    await Purchase.deleteMany({ clubName });
    await Purchase.insertMany(items.map(item => ({
      clubName: clubName,
      event_date: item.event_date,
      event_name: item.event_name,
      item_name: item.item_name,
      quantity: parseInt(item.quantity),
      price: parseFloat(item.price),
      source: item.source,
      amount: parseFloat(item.amount),
      upload_time: item.upload_time || new Date().toISOString(),
    })));

    res.json({ message: 'Purchases data submitted successfully.' });
  } catch (err) {
    console.error('Error inserting purchase data:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
