# Walk-in User System Documentation

## Overview

The Walk-in User System allows admin staff to create accounts for users who visit the office in person, particularly those without email addresses or who need assistance with technology. This system complements the existing legacy user request system by providing immediate account creation for on-site visitors.

## System Architecture

### Backend Components

#### 1. Data Model Updates (`legacy-user-request.model.ts`)
- Added `IN_PERSON` contact method
- Added `WALK_IN_ACCOUNT` request type
- New fields for walk-in functionality:
  - `visitLocation`: Office location for the visit
  - `visitDate`: Preferred visit date
  - `assistedBy`: Person accompanying the user
  - `isWalkIn`: Boolean flag for walk-in requests

#### 2. API Endpoints

##### Walk-in Account Creation
```
POST /api/users/walk-in/create
```
**Purpose**: Create user accounts immediately for walk-in visitors

**Payload**:
```json
{
  "name": "string (required)",
  "nric": "string (required)",
  "visitLocation": "string (required)",
  "assistedBy": "string (optional)",
  "adminNotes": "string (optional)",
  "email": "string (optional)",
  "mobile": "string (optional)"
}
```

**Response**:
```json
{
  "user": { /* User object */ },
  "temporaryPassword": "string",
  "message": "string"
}
```

##### Walk-in Statistics
```
GET /api/users/walk-in/stats
```
**Purpose**: Get statistics about walk-in user accounts

**Response**:
```json
{
  "totalWalkInUsers": number,
  "monthlyWalkIns": number,
  "recentWalkIns": [/* Array of recent walk-in users */]
}
```

#### 3. Legacy User Request Updates
- Enhanced approval process to handle walk-in requests
- Special instructions generation for walk-in users
- Notification handling for in-person visits

### Frontend Components

#### 1. Legacy User Request Form Updates
- Added "In-Person Visit" contact method option
- Added "Walk-in Account Creation" request type
- New form fields:
  - Visit location selection
  - Preferred visit date with validation
  - Accompanied by field
  - Special instructions for walk-in requests

#### 2. Walk-in User Creation Component (`/admin/walk-in-users`)
- Dedicated admin interface for immediate account creation
- Real-time statistics dashboard
- Credential printing functionality
- Form validation and error handling

## User Flows

### 1. Pre-Visit Request Flow
1. User (or helper) visits legacy user request form
2. Selects "In-Person Visit" as contact method
3. Chooses "Walk-in Account Creation" as request type
4. Provides visit details (location, date, accompanying person)
5. Submits request
6. Admin team receives notification and prepares for visit
7. User visits office at scheduled time
8. Account created during visit using admin interface

### 2. Direct Walk-in Flow
1. User walks into office without prior request
2. Admin staff verifies identity with official documents
3. Uses walk-in creation interface to create account immediately
4. Provides temporary password to user
5. User can immediately participate in events

### 3. Assisted Walk-in Flow
1. User visits with family member/caregiver
2. Admin verifies both identities
3. Records accompanying person details
4. Creates account with assisted access flag
5. Provides credentials to both user and helper

## Security Features

### 1. Identity Verification
- Requires physical presence at office
- Admin staff must verify official identification
- Documentation requirements clearly stated

### 2. Password Security
- Temporary passwords generated using secure random algorithm
- Passwords follow complexity requirements
- Users encouraged to change password after first login

### 3. Access Controls
- Walk-in creation restricted to admin users only
- Role-based access controls enforced
- Audit trail maintained for all walk-in accounts

### 4. Data Protection
- Minimal data collection for privacy
- Optional email/phone fields
- Secure password hashing using bcrypt

## Admin Interface Features

### 1. Statistics Dashboard
- Total walk-in users created
- Monthly creation statistics
- Recent activity tracking
- Quick access to related functions

### 2. Account Creation Form
- Streamlined interface for rapid account creation
- Real-time validation
- Location tracking for visits
- Notes field for special circumstances

### 3. Credential Management
- Secure password display with toggle visibility
- Copy-to-clipboard functionality
- Print credential sheet for users
- Multiple export options

### 4. Integration with Legacy System
- Links to legacy user management
- Access to pending requests
- Unified admin experience

## Technical Implementation

### 1. Form Validation
- NRIC format validation (8-12 alphanumeric characters)
- Name formatting (automatic uppercase conversion)
- Email validation when provided
- Phone number format validation
- Required field enforcement

### 2. Password Generation
- 12-character passwords
- Mixed case letters, numbers, and special characters
- Cryptographically secure random generation
- Compliance with system password policies

### 3. Database Schema
- Walk-in users marked with `isLegacyUser: true`
- `requiresAssistedAccess: true` for tracking
- Special instructions field for walk-in context
- Audit fields for creation tracking

### 4. Error Handling
- Graceful error handling for all operations
- User-friendly error messages
- Logging for debugging and audit purposes
- Rollback capabilities for failed operations

## Configuration Options

### 1. Office Locations
Configurable list of office locations:
- Main Office
- Regional Office - North
- Regional Office - South
- Service Center
- Other (with custom input)

### 2. Visit Requirements
Documented requirements for walk-in visits:
- Original NRIC or identification document
- Shareholding documents (if applicable)
- Contact details of family member/friend
- Reference number from request (if pre-scheduled)

### 3. Business Rules
- Minimum visit date: Next business day
- Maximum assisted access duration: Configurable
- Password complexity requirements: System-defined
- Account activation: Immediate for walk-ins

## Troubleshooting

### Common Issues

#### 1. NRIC Validation Errors
- Ensure NRIC format is correct (no spaces/dashes)
- Check for valid alphanumeric characters only
- Verify length is between 8-12 characters

#### 2. Password Display Issues
- Use toggle visibility button if password appears masked
- Copy function provides backup access method
- Print function creates permanent record

#### 3. Form Submission Failures
- Check all required fields are completed
- Verify admin authentication is valid
- Ensure network connectivity

### Error Messages

#### Validation Errors
- "NRIC should be 8-12 alphanumeric characters"
- "Name is required"
- "Visit location is required"
- "Please enter a valid email address"

#### System Errors
- "Failed to create account. Please try again."
- "Authentication required"
- "Network connection error"

## Best Practices

### 1. Document Verification
- Always verify original identification documents
- Cross-check NRIC with official documents
- Record any discrepancies in admin notes

### 2. Password Handling
- Never share passwords via unsecured channels
- Print credentials when possible
- Instruct users to change password after first login

### 3. Data Entry
- Use uppercase for names to maintain consistency
- Record accompanying persons for future reference
- Add detailed admin notes for complex cases

### 4. Follow-up Actions
- Provide clear login instructions
- Test account access before user leaves
- Schedule follow-up contact if needed

## Future Enhancements

### Planned Features
1. QR code generation for quick credential sharing
2. SMS integration for password delivery
3. Appointment scheduling system
4. Multi-language support for forms
5. Digital signature capture
6. Photo ID integration
7. Bulk account creation for events

### Integration Opportunities
1. Integration with national ID verification systems
2. Connection to event management systems
3. Automated follow-up communication
4. Analytics and reporting dashboard
5. Mobile app for admin staff
6. Kiosk mode for self-service areas

## Support and Maintenance

### Regular Tasks
- Monitor walk-in statistics monthly
- Review and update office locations list
- Update password complexity requirements as needed
- Audit walk-in account usage patterns

### System Health Checks
- Verify form validation is working correctly
- Test password generation functionality
- Check printing capabilities
- Validate admin access controls

### User Training
- Train admin staff on walk-in procedures
- Provide documentation verification guidelines
- Update staff on system changes
- Conduct regular security awareness sessions

This walk-in user system provides a comprehensive solution for creating accounts for users who prefer or require in-person assistance, ensuring accessibility while maintaining security and compliance requirements.