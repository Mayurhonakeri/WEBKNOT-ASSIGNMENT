My Understanding On Campus Event Management Platform ( Webknot Assignment)

Hey! So this is my campus event management system that I built for the Webknot Technologies assignment. I'm gonna try to explain everything I figured out while building this thing.

What This Project Actually Does

Basically, I needed to create a system where college staff can create events and students can sign up for them. Think of it like Eventbrite but specifically for campus events. The assignment wanted me to handle multiple colleges, so I had to think about how to keep data separate but still make it work efficiently.

 Why I Built It This Way

When I first read the requirements, I was honestly a bit overwhelmed. They wanted:
- 50 colleges support (that's a lot!)
- Around 500 students per college
- 20 events per semester per college
- Students registering for events
- Attendance tracking
- Feedback with ratings (1-5 scale)
- A bunch of reports

I decided to go with Node.js because I'm comfortable with JavaScript, and MongoDB seemed like a good choice since I needed flexibility with the data structure. Plus, I've used it before in other projects.

 The Database Stuff (This Took Me Forever to Figure Out)

I spent way too much time thinking about the database design. Here's what I ended up with:

 Main Collections:
1. Colleges - Pretty straightforward, just college info
2. Users - Both admins and students (I used a role field to differentiate)
3. Events - All the event details like name, date, capacity, etc.
4. Registrations - Links students to events (many-to-many relationship)
5. Attendance - Tracks who actually showed up
6. Feedback - Student ratings and comments

The tricky part was making sure event IDs are unique across ALL colleges. I initially thought about making them unique only within each college, but then realized that would make reporting a nightmare later.

 Setting This Thing Up

to run this, here's what I needed:

 What I Needed First:
- Node.js (I used v16, but v14+ should work)
- MongoDB running somewhere
- A decent code editor (I use VS Code)

 Reports I Had to Build

The assignment required specific reports:
1. Event Popularity - Which events get the most registrations
2. Student Participation - How many events each student attends
3. Top 3 Active Students - The most engaged students
4. Events by Type - Filter by workshop, fest, seminar, etc.

These were actually fun to build once I figured out the MongoDB aggregation pipeline.

 Challenges I Ran Into Doing This

1. Authentication Middleware - Took me hours to debug why tokens weren't parsing correctly
2. Date Handling - JavaScript dates are weird, especially with time zones
3. MongoDB Relationships - Had to learn about population and references
4. Validation - Making sure users can't register for the same event twice
5. Error Handling - Creating consistent error responses across all endpoints

 My Learning Experience

This project taught me a lot about:
- Designing scalable APIs
- Database relationships and data modeling
- Authentication and authorization
- Error handling and validation
- Reading documentation (MongoDB docs are actually pretty good)

I'm pretty proud of how this turned out, especially considering I had to figure out a lot of this stuff on my own. The hardest part was probably wrapping my head around how to structure everything to handle multiple colleges efficiently.

 Final Thoughts

This was a really good learning project. I got to work with a realistic scenario that actually makes sense - colleges do need systems like this! The scale requirements (50 colleges, 500 students each) made me think about performance and data organization in ways I hadn't before. The code isn't perfect, but it works and handles all the requirements. I tried to write it in a way that I could come back to in 6 months and still understand what I was thinking.
