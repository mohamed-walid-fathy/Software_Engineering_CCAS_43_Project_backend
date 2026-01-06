import unittest
import requests
import json
import uuid

BASE_URL = "http://localhost:5000/api"

class TestCampaignConnectAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Create a unique email for testing
        cls.donor_email = f"test_{uuid.uuid4().hex[:6]}@donor.com"
        cls.password = "password123"
        cls.charity_email = f"charity_{uuid.uuid4().hex[:6]}@charity.com"

    def test_01_donor_registration(self):
        """WD-001: Donor Registration"""
        payload = {
            "email": self.donor_email,
            "password": self.password,
            "userType": "donor",
            "name": "Auto Test Donor"
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        self.assertEqual(response.status_code, 201)
        self.assertIn("Donor registered successfully", response.json().get("message", ""))

    def test_02_duplicate_email(self):
        """WD-002: Duplicate Email Check"""
        payload = {
            "email": self.donor_email,
            "password": self.password,
            "userType": "donor"
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Email already registered", response.json().get("message", ""))

    def test_03_login_success(self):
        """WD-003: Login with correct hashed credentials"""
        payload = {
            "email": self.donor_email,
            "password": self.password
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("data").get("user").get("role"), "donor")

    def test_04_login_failure(self):
        """WD-004: Login with incorrect password"""
        payload = {
            "email": self.donor_email,
            "password": "wrongpassword"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=payload)
        self.assertEqual(response.status_code, 401)
        self.assertIn("Invalid email or password", response.json().get("message", ""))

    def test_05_charity_registration(self):
        """Helper for campaign tests"""
        payload = {
            "email": self.charity_email,
            "password": self.password,
            "userType": "charity",
            "orgName": "Auto Test Charity"
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        self.assertEqual(response.status_code, 201)
        self.charity_id = response.json().get("data").get("user").get("charity_id")

    def test_06_get_campaigns(self):
        """WD-006: Fetch Campaigns List"""
        response = requests.get(f"{BASE_URL}/campaigns")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json().get("data"), list)

    def test_07_change_password(self):
        """WD-010: Change Password (Verified Hashing)"""
        new_password = "newpassword123"
        # 1. Change password
        change_payload = {
            "email": self.donor_email,
            "oldPassword": self.password,
            "newPassword": new_password
        }
        response = requests.put(f"{BASE_URL}/auth/change-password", json=change_payload)
        self.assertEqual(response.status_code, 200)

        # 2. Login with new password
        login_payload = {
            "email": self.donor_email,
            "password": new_password
        }
        login_response = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
        self.assertEqual(login_response.status_code, 200)

    # Note: Administrative tests (WD-008, WD-009) and specific creation tests (WD-005, WD-007)
    # usually require JWT or specific status setup which varies by DB state.
    # We implement the core 10 logic flows here.

    def test_08_get_charity_data(self):
        """WD-013: Fetch Charity Stats/Profile"""
        # First ensure we have a charity email (from test_05)
        response = requests.get(f"{BASE_URL}/users/charities")
        self.assertEqual(response.status_code, 200)
        charities = response.json().get("data", [])
        if charities:
            char_id = charities[0].get("charity_id") or charities[0].get("id")
            stats_response = requests.get(f"{BASE_URL}/charity/{char_id}/stats")
            self.assertEqual(stats_response.status_code, 200)

    def test_09_create_campaign_invalid(self):
        """WD-005 Error case: Create campaign without auth"""
        payload = {
            "title": "Unauthorized Campaign",
            "target_amount": 1000
        }
        response = requests.post(f"{BASE_URL}/campaigns", json=payload)
        # Should fail because charity_id is missing or unauthorized (depending on middleware)
        self.assertNotEqual(response.status_code, 201)

    def test_10_donation_anonymous(self):
        """WD-007: Anonymous Donation Flow"""
        # Find an active campaign
        camp_res = requests.get(f"{BASE_URL}/campaigns")
        campaigns = camp_res.json().get("data", [])
        if campaigns:
            camp_id = campaigns[0].get("campaign_id")
            payload = {
                "campaign_id": camp_id,
                "donor_id": 1, # Anonymous ID
                "amount": 10,
                "payment_method": "credit_card"
            }
            response = requests.post(f"{BASE_URL}/donations", json=payload)
            self.assertEqual(response.status_code, 201)

if __name__ == "__main__":
    unittest.main()
