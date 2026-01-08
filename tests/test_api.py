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
        """WD-001: Donor Registration (Positive)"""
        payload = {
            "email": self.donor_email,
            "password": self.password,
            "userType": "donor",
            "name": "Auto Test Donor"
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        self.assertEqual(response.status_code, 201)

    def test_02_duplicate_email(self):
        """WD-002: Duplicate Email Check (Negative)"""
        payload = {
            "email": self.donor_email,
            "password": self.password,
            "userType": "donor"
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Email already registered", response.json().get("message", ""))

    def test_03_login_success(self):
        """WD-003: Login Success (Positive)"""
        payload = {
            "email": self.donor_email,
            "password": self.password
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("data").get("user").get("role"), "donor")

    def test_04_login_failure(self):
        """WD-004: Login with incorrect password (Negative)"""
        payload = {
            "email": self.donor_email,
            "password": "wrongpassword"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=payload)
        self.assertEqual(response.status_code, 401)
        self.assertIn("Invalid email or password", response.json().get("message", ""))

    def test_05_get_campaigns(self):
        """WD-006: Fetch Campaigns List (Positive)"""
        response = requests.get(f"{BASE_URL}/campaigns")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json().get("data"), list)

    def test_06_create_campaign_unauthorized(self):
        """WD-005 Error: Create campaign without auth (Negative)"""
        payload = {
            "title": "Unauthorized Campaign",
            "target_amount": 1000
        }
        response = requests.post(f"{BASE_URL}/campaigns", json=payload)
        self.assertNotEqual(response.status_code, 201)

    def test_07_donation_anonymous(self):
        """WD-007: Anonymous Donation Flow (Positive)"""
        camp_res = requests.get(f"{BASE_URL}/campaigns")
        campaigns = camp_res.json().get("data", [])
        if campaigns:
            camp_id = campaigns[0].get("campaign_id")
            payload = {
                "campaign_id": camp_id,
                "donor_id": 1,
                "amount": 10,
                "payment_method": "credit_card"
            }
            response = requests.post(f"{BASE_URL}/donations", json=payload)
            self.assertEqual(response.status_code, 201)

    def test_08_donation_invalid_amount(self):
        """WD-007 Error: Donation with negative amount (Negative)"""
        payload = {
            "campaign_id": "any-id",
            "donor_id": 1,
            "amount": -50,
            "payment_method": "credit_card"
        }
        response = requests.post(f"{BASE_URL}/donations", json=payload)
        self.assertIn(response.status_code, [400, 422, 500]) # Depends on validation layer

    def test_09_change_password(self):
        """WD-010: Change Password (Positive)"""
        new_password = "newpassword123"
        change_payload = {
            "email": self.donor_email,
            "oldPassword": self.password,
            "newPassword": new_password
        }
        response = requests.put(f"{BASE_URL}/auth/change-password", json=change_payload)
        self.assertEqual(response.status_code, 200)
        # Revert or update for next test
        self.password = new_password

    def test_10_change_password_wrong_old(self):
        """WD-010 Error: Change password with wrong old password (Negative)"""
        change_payload = {
            "email": self.donor_email,
            "oldPassword": "not-the-old-pass",
            "newPassword": "evennewer123"
        }
        response = requests.put(f"{BASE_URL}/auth/change-password", json=change_payload)
        self.assertNotEqual(response.status_code, 200)

if __name__ == "__main__":
    unittest.main()
