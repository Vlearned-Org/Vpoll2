# Backend Scripts

This directory contains utility scripts for database migrations, data fixes, and maintenance tasks.

## Available Scripts

### fix-legacy-user-passwords.ts

**Purpose**: Fixes legacy users who have plain text passwords by hashing them using the same bcrypt algorithm as normal users.

**Usage**:
```bash
npm run migrate:fix-legacy-passwords
```

**What it does**:
- Finds all users marked as `isLegacyUser: true`
- Checks if their passwords are already hashed (bcrypt format)
- Hashes plain text passwords using `PasswordUtils.hash()` with system flag
- Updates the database with properly hashed passwords
- Provides detailed progress and summary reporting

**Safety Features**:
- Skips users with already hashed passwords
- Skips users with empty/null passwords
- Provides detailed logging of all operations
- Error handling for individual user processing failures

**When to run**:
- After creating legacy users through the admin interface
- When migrating from systems with plain text passwords
- As part of security audits to ensure all passwords are properly hashed

## Running Scripts

All scripts can be run using npm scripts defined in `package.json`:

```bash
# Run the legacy password fix
npm run migrate:fix-legacy-passwords
```

## Development

Scripts are written in TypeScript and use the NestJS application context to access services and repositories. They follow these patterns:

1. Create NestJS application context
2. Get required services/repositories
3. Perform operations with proper error handling
4. Provide detailed logging and progress reports
5. Clean up resources and exit gracefully