### Project Setup


Assistant
Chats
Archived
setting up local development environment
just now
I have downloaded the source code locally, how can I set it up locally

FK

zallpyai
Assistant
just now
Based on the project structure and package.json, here are the steps to set up the project locally:

First, install the dependencies:
npm install
Ensure you have a PostgreSQL database set up, as this project uses Drizzle ORM with PostgreSQL.

Create a .env file in the root directory with your database connection URL:

.env

Add database configuration
Run the database migrations:
`npm run db:push`

Start the development server:
`npm run dev`
The application will start on port 5000. You can access it at http://0.0.0.0:5000

Note: The application uses a full-stack setup with:

Vite + React for the frontend
Express for the backend
Drizzle ORM for database operations
TailwindCSS for styling
TypeScript throughout
