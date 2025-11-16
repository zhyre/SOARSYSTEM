from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from .models import Organization, OrganizationMember, ROLE_MEMBER, ROLE_LEADER, ROLE_ADVISER
import json

User = get_user_model()


class LeaveOrganizationTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.organization = Organization.objects.create(
            name='Test Organization',
            description='A test organization',
            is_public=True
        )

    def test_leave_organization_success(self):
        """Test successful leaving of organization by a member"""
        # Create membership
        member = OrganizationMember.objects.create(
            organization=self.organization,
            student=self.user,
            role=ROLE_MEMBER
        )

        self.client.login(username='testuser', password='testpass123')

        url = reverse('leave_organization', kwargs={'org_id': self.organization.id})
        response = self.client.post(url)

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['message'], 'You have left the organization.')

        # Check that membership was deleted
        self.assertFalse(OrganizationMember.objects.filter(
            organization=self.organization,
            student=self.user
        ).exists())

    def test_leave_organization_not_member(self):
        """Test attempting to leave organization when not a member"""
        self.client.login(username='testuser', password='testpass123')

        url = reverse('leave_organization', kwargs={'org_id': self.organization.id})
        response = self.client.post(url)

        self.assertEqual(response.status_code, 404)
        data = json.loads(response.content)
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'You are not a member of this organization.')

    def test_leave_organization_adviser_cannot_leave(self):
        """Test that advisers cannot leave organization"""
        # Create adviser membership
        member = OrganizationMember.objects.create(
            organization=self.organization,
            student=self.user,
            role=ROLE_ADVISER
        )

        self.client.login(username='testuser', password='testpass123')

        url = reverse('leave_organization', kwargs={'org_id': self.organization.id})
        response = self.client.post(url)

        self.assertEqual(response.status_code, 403)
        data = json.loads(response.content)
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Advisers cannot leave an organization via this action.')

        # Check that membership still exists
        self.assertTrue(OrganizationMember.objects.filter(
            organization=self.organization,
            student=self.user
        ).exists())

    def test_leave_organization_last_leader_cannot_leave(self):
        """Test that the last leader cannot leave without assigning another leader"""
        # Create leader membership
        member = OrganizationMember.objects.create(
            organization=self.organization,
            student=self.user,
            role=ROLE_LEADER
        )

        self.client.login(username='testuser', password='testpass123')

        url = reverse('leave_organization', kwargs={'org_id': self.organization.id})
        response = self.client.post(url)

        self.assertEqual(response.status_code, 400)
        data = json.loads(response.content)
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Cannot leave as the only leader. Assign another leader first.')

        # Check that membership still exists
        self.assertTrue(OrganizationMember.objects.filter(
            organization=self.organization,
            student=self.user
        ).exists())

    def test_leave_organization_multiple_leaders(self):
        """Test that a leader can leave if there are other leaders"""
        # Create two leaders
        leader1 = OrganizationMember.objects.create(
            organization=self.organization,
            student=self.user,
            role=ROLE_LEADER
        )

        leader2 = OrganizationMember.objects.create(
            organization=self.organization,
            student=User.objects.create_user(
                username='leader2',
                email='leader2@example.com',
                password='testpass123'
            ),
            role=ROLE_LEADER
        )

        self.client.login(username='testuser', password='testpass123')

        url = reverse('leave_organization', kwargs={'org_id': self.organization.id})
        response = self.client.post(url)

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'success')

        # Check that leader1 left but leader2 remains
        self.assertFalse(OrganizationMember.objects.filter(
            organization=self.organization,
            student=self.user
        ).exists())
        self.assertTrue(OrganizationMember.objects.filter(
            organization=self.organization,
            student=leader2.student
        ).exists())

    def test_leave_organization_get_method_not_allowed(self):
        """Test that GET method is not allowed"""
        self.client.login(username='testuser', password='testpass123')

        url = reverse('leave_organization', kwargs={'org_id': self.organization.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 405)
        data = json.loads(response.content)
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Invalid request method')

    def test_leave_organization_unauthenticated(self):
        """Test that unauthenticated users cannot leave organizations"""
        url = reverse('leave_organization', kwargs={'org_id': self.organization.id})
        response = self.client.post(url)

        # Should redirect to login
        self.assertEqual(response.status_code, 302)

    def test_leave_organization_invalid_org_id(self):
        """Test leaving with invalid organization ID"""
        from uuid import uuid4
        invalid_id = uuid4()

        self.client.login(username='testuser', password='testpass123')

        url = reverse('leave_organization', kwargs={'org_id': invalid_id})
        response = self.client.post(url)

        self.assertEqual(response.status_code, 404)
