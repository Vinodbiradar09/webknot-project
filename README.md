This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


Event Management app 
tech-stack i used for it is next.js with app router , typescript for typesafety , tailwind-css and shadcn-ui for ui components
and react hook form and zod validations , for authentication i used is next-auth , the backend is on node.js and mongodb for the database and mongoose for orm bcrypt for password hashing and some advance aggregation for routes to perform faster performances 

ahh you can clone this repo also git clone https://github.com/Vinodbiradar09/webknot-project.git
you can setup by npm i and some .env variables MONGODB_URI=your_mongodb_connection_string NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

i will discuss about the project how i though in my head or how i designed it first and how claude.ai helped me and i will be honest for this 

firstly i thought the design in mind and i designed it in the paper and copied you info of the project and i pasted this prompt to claude.ai 
below is my prmopt 
The Scenario
Imagine you’re part of a team building a Campus Event Management Platform.
● Admin Portal (Web): Used by college staff to create events (hackathons,
workshops, tech talks, fests, etc.).
● Student App (Mobile): Used by students to browse events, register, and check-in on
the event day.
Your mission is to design and implement a basic event reporting system for this platform.
What You Need to Do
1. Document Your Approach
● Note down your assumptions and decisions.
● Use an LLM tool (e.g., ChatGPT, Claude, Gemini) to brainstorm.
● Share your AI conversation log (screenshots or links).
● Mention where you followed or deviated from AI suggestions.
2. Design Document
Your design doc should cover:
● Data to Track → Event creation, student registration, attendance, feedback.
● Database Schema → ER diagram or table sketch.
● API Design → Endpoints for creating events, registering students, marking
attendance, generating reports.
● Workflows → Sequence diagrams for registration → attendance → reporting.
● Assumptions & Edge Cases → e.g., duplicate registrations, missing feedback,
cancelled events.
3. Prototype Implementation
A small, working prototype (any language/framework):
● Database: SQLite/Postgres/MySQL.
● Create APIs or scripts to:
○ Register students to an event.
○ Mark attendance.
○ Collect feedback (rating 1–5).
● Provide queries or endpoints for reports:
○ Total registrations per event.
○ Attendance percentage.
○ Average feedback score.
4. Reports
● Event Popularity Report → Sorted by number of registrations.
● Student Participation Report → How many events a student attended.


see this is what i need to achieve i am using the next.js and typescript and mongodb for this project and shadcn 

don't give me the directly code for all this i want you to design the architecture and flow how this app works for the students and admins 
i am using next-auth for it for creating account i use react form hook and for login next-auth using the credentails 
okay and i want you design the same features don't add the any additional features execept mentioned features and make sure that design with all the edges cases suppose if the students logins were he will land what are the previliages he have and for admins what are the features he can have 

i will tell my flow if you liked it we will stuck to it not means you correct me make sure to handle all the edges and don't add any additional features 

students flow 
create account , login account after login he is redirected to a page were all the events are browsed there will be a button below for every event to register once the user clicks the register button if successfully it will be registered  and the info we collect from the login user and send that to the backend api the details of the registered student and in the navbar there will be options for all the events that student registered  we will display the cards if the event is 
completed below we show completed if the event is yet to start we will show yet to start and there will be also mentioned that present or absent if the user was present then it will show attended or absent 

admins flow create account , login account after login /dashboard were he has one options create event and when the admin clicks the create event the /admin/events/new page will be redirected were there will be a form were he can create a new event after creating the event he is again redirected to the /dashboard page were there will be all the cards that the admin has created 
and has option to cancel the event and manage the event if the admin clicks on the manage event then he redirected to the /admins/events/details were he will see all the info of the event and registered students there will be a toggle for every students name and usn is displayed by default it will marked as absent when the admin marks the attendance for every student and when he clicks on the submit attendance the attendance will be submitted 

this is my flow

it replyed me with some improvement and redesigned my project 
// now the code begins , 
// first i setup the project in next.js and installed all the dependencies and type dependencies for typesafety and made a db connection to connect db in next.js the db connection is a liitle tricky becoz the next.js server run on the edge it is not same in the traditional backend express once we initailized the server it will be on for everytime 
// now i started to design the models for my project according to me the models design is the main and very important setup to design it first , most start the project and create a user model and write the api for the user registration and login that not how it's done we have to design the models in a such a way that it should handle all the edge cases so that we again don't come back to models and fix it this is just my thought 
// i have a little confusion were i need to design two seperate models for student and admin or i need to create a single model some people suggest to create a single model but its upon you how to design the model 
// and i started to write the code for next-auth for authentication i used credentials , 
// and also i have used resend for emails verification it applies for both admins and students , the email verification is the process were i feel that the user's are real not fake
// main code first i divided the folders into students and admins 
// for students folder i designed api route to regisster event and fetch all the event details that they are registered and the student stats on the registered events which is not that hard 
// for admins i have wrote some complex  agggregationn querys and bulk write for attendance handling 
// for the admins they can mark the attendance for the students registered to there events only 
//and the admins can access the informations of the registered students , they can only get the info of the registered students info for there event
//the admins has the previlages to create the events and update the events and cancel the events instead of deleting the event from the db's and the admins are allowed to cancel the events they have created 
// fun part is to handle the auth.js or next-auth for the admins and students as i mentioned eariler i used the auth.js and the sign-up form is custom made for both the students and the admins when it comes to the login i haven't made the two session's one for the admin and for the students i handled single session and divide it in terms of the roles 
// as i mentioned i wrote some aggregation's , some people use the populate instead of aggregation , which gives smae results for both but aggerations are little faster and great in the performance as compare to the populate
// sorry my time is up it's 2:56 i can't explain more about project
