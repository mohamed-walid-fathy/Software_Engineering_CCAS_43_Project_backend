# Test Document

| Test Case ID | Description | Pre-conditions | Test Data | Steps | Expected Results | Test Type |
|--------------|-------------|----------------|-----------|-------|------------------|-----------|
| WD-001 | Donor Registration | Backend running | Email: test@donor.com, Pass: 123456 | "1. Register donor via API" | Account created; password hashed in DB | System Testing (Auto) |
| WD-002 | Duplicate Email Check | One user already exists | Email: test@donor.com | "1. Attempt registration with duplicate email" | Error: "Email already registered" | System Testing (Auto) |
| WD-003 | Login Hashed Verification | Account exists with hashed pass | Email: test@donor.com, Pass: 123456 | "1. Login with correct credentials" | Login successful; returns user profile | Integration Testing (Auto) |
| WD-004 | Login Incorrect Password | Account exists | Email: test@donor.com, Pass: wrong | "1. Login with wrong password" | Error: "Invalid email or password" | Integration Testing (Auto) |
| WD-005 | Create Campaign | Charity logged in | Title: Help Kids, Goal: 5000 | "1. Submit new campaign" | Campaign created with "pending" status | Functional Testing (Auto) |
| WD-006 | Fetch Campaigns List | Campaigns exist | N/A | "1. Fetch all campaigns" | Returns list of active/pending campaigns | Functional Testing (Auto) |
| WD-007 | Create Donation | Campaign active, Donor exists | Amount: 100 | "1. Submit donation to campaign" | Donation record created; campaign progress updated | Functional Testing (Auto) |
| WD-008 | Admin Approve Campaign | Campaign is "pending" | N/A | "1. Admin approves campaign" | Status changes to "active" | Functional Testing (Auto) |
| WD-009 | Admin Reject with Reason | Campaign is "pending" | Reason: "Invalid proof" | "1. Admin rejects campaign" | Status: "rejected"; reason saved | Functional Testing (Auto) |
| WD-010 | Change Password Hashing | User logged in | Old: 123, New: 456 | "1. Change password; 2. Login with new" | Password updated; hashing verified on next login | Security Testing (Auto) |
| WD-011 | Submit Campaign Missing Fields | Charity logged in | Title empty | "1. Try to create campaign without title" | UI error or API block | Manual Testing |
| WD-012 | Verify Resubmission Clears Reason | Campaign rejected | Updated desc | "1. Edit rejected campaign; 2. Resubmit" | Status becomes "pending"; reason is null | Manual Testing |
| WD-013 | Donor views history | Donor made donations | N/A | "1. Navigate to donor dashboard history" | List of previous donations displayed | Manual Testing |
| WD-014 | Admin Dashboard Stats | Multiple entries exist | N/A | "1. Admin views stats" | Correct counts for pending/active shown | Manual Testing |
| WD-015 | Logout Security | User logged in | N/A | "1. Click Logout; 2. Try to access dashboard" | Redirect to login; session cleared | Manual Testing |
| WD-016 | Generate Charity Report | Charity verified | Dates: Jan 1 - Jan 30 | "1. Request report generation" | Report PDF or summary stats generated | Manual Testing |
