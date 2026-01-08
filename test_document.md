# Project Testing Documentation

| Test Case ID | Description | Pre-conditions | Test Data | Steps | Expected Results | Test Type |
|--------------|-------------|----------------|-----------|-------|------------------|-----------|
| WD-001 | Donor Registration | Backend service running | Email: test@donor.com, Pass: password123 | "1. Submit registration via API/UI" | User account created successfully | System Testing (Pos) |
| WD-002 | Duplicate Email Registration | User test@donor.com already exists | Email: test@donor.com | "1. Attempt to register again with same email" | Error: "Email already registered" | System Testing (Neg) |
| WD-003 | Login with Correct Credentials | Registered account exists | Email: test@donor.com, Pass: password123 | "1. Enter credentials in login form; 2. Submit" | Login successful; redirected to dashboard | Integration Testing (Pos) |
| WD-004 | Login with Incorrect Password | Registered account exists | Email: test@donor.com, Pass: wrongpass | "1. Enter email and wrong password; 2. Submit" | Error: "Invalid email or password" | Integration Testing (Neg) |
| WD-005 | Campaign List Access | Public or Registered user | N/A | "1. Navigate to campaigns page" | Returns a list of all active campaigns | Functional Testing (Pos) |
| WD-006 | Create Campaign Unauthorized | User not logged in as Charity | Title: Help Kids | "1. Attempt to POST a new campaign without auth" | Error: 401 Unauthorized or redirected to login | Functional Testing (Neg) |
| WD-007 | Anonymous Donation | Campaign exists | Amount: 10, Method: Card | "1. Choose campaign; 2. Submit anonymous donation" | Donation recorded; total amount updated | Functional Testing (Pos) |
| WD-008 | Donation with Invalid Amount | Campaign exists | Amount: -50 | "1. Enter negative amount; 2. Try to pay" | System blocks transaction; Error: "Invalid amount" | Functional Testing (Neg) |
| WD-009 | Change Password | User logged in | Old: password123, New: newpass123 | "1. Enter old and new password; 2. Save" | Password updated successfully | Security Testing (Pos) |
| WD-010 | Change Password Wrong Old | User logged in | Old: incorrectpass, New: newpass123 | "1. Enter wrong current password; 2. Save" | Error: "Current password incorrect" | Security Testing (Neg) |
| WD-011 | Submit Campaign Missing Fields | Charity logged in | Title: "", Goal: 5000 | "1. Try to create campaign without title" | UI displays validation error | Manual Testing |
| WD-012 | Resubmission Clear Reason | Rejected campaign exists | Updated description | "1. Edit rejected campaign; 2. Resubmit" | Status reset to "pending"; rejection reason cleared | Manual Testing |
| WD-013 | Donor History View | Donor has previous donations | N/A | "1. Access 'Donation History' tab" | Table displays date, amount, and campaign name | Manual Testing |
| WD-014 | Admin Stats Validation | Multiple campaigns exist | N/A | "1. Open Admin Dashboard" | Overview shows correct counts for Pending/Active | Manual Testing |
| WD-015 | Post-Logout Security Check | User was logged in | N/A | "1. Logout; 2. Use 'Back' button or direct URL" | Redirected to Login; no private data visible | Manual Testing |
| WD-016 | Generate Charity Report | Charity verified | Range: Jan 1 - Jan 31 | "1. Click 'Generate Monthly Report'" | Report exports or displays correct summary data | Manual Testing |
