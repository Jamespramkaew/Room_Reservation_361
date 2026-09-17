<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository for Room Reservation System.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose

## Project Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Database Services with Docker Compose

```bash
docker compose up -d
```

This will start the required database services in the background.

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Update the `.env` file with your database credentials and other configuration if needed.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

This generates the Prisma Client which is required for database operations.

### 5. Run Initial Database Migration

```bash
npx prisma migrate dev --name initial
```

This creates the database schema based on your Prisma schema file.

### 6. Seed the Database (Optional)

```bash
npm run db:seed
```

This populates the database with initial seed data.

### 7. Verify Database Setup with Prisma Studio (Optional)

```bash
npm run db:studio
```

This opens Prisma Studio in your browser where you can view and manage database records. Keep this running in a separate terminal for reference while developing.

### 8. Start the Application

```bash
npm run start
```

The application will start in development mode. You can now access the API at `http://localhost:3000` (or your configured port).

## Compile and Run the Project

```bash
# development mode
npm run start

# watch mode (auto-reload on file changes)
npm run start:dev

# production mode
npm run start:prod
```

## Run Tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Database Management

### View Database with Prisma Studio

```bash
npm run db:studio
```

### Reset Database (Warning: Destructive)

```bash
npx prisma migrate reset
```

This will drop the database and re-run all migrations and seeds.

### Create a New Migration

```bash
npx prisma migrate dev --name <migration_name>
```

## Troubleshooting

- **Database Connection Error**: Make sure Docker Compose services are running with `docker compose up -d`
- **Port Already in Use**: Check if another process is using the port or modify the port in `.env`
- **Migration Issues**: Try running `npx prisma migrate resolve --rolled-back <migration_name>` if migration fails

## Support

For more information about NestJS, visit the [official documentation](https://docs.nestjs.com/).
