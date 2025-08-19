import pytest
from unittest.mock import patch

from app.core.security import create_access_token


def get_auth_header(user):
    """Helper function to create authorization header."""
    token = create_access_token(subject=user.wallet)
    return {"Authorization": f"Bearer {token}"}


def test_get_current_user_info(client, test_user):
    """Test getting current user information."""
    headers = get_auth_header(test_user)
    response = client.get("/api/v1/users/me", headers=headers)
    
    assert response.status_code == 200
    assert response.json()["id"] == test_user.id
    assert response.json()["wallet"] == test_user.wallet
    assert response.json()["role"] == test_user.role.value


def test_update_user_info(client, test_user):
    """Test updating user information."""
    headers = get_auth_header(test_user)
    
    # Update user info
    new_name = "Updated Name"
    new_email = "updated@example.com"
    
    response = client.put(
        "/api/v1/users/me",
        json={"name": new_name, "email": new_email},
        headers=headers,
    )
    
    assert response.status_code == 200
    assert response.json()["name"] == new_name
    assert response.json()["email"] == new_email


def test_get_users_as_admin(client, test_admin):
    """Test getting all users as admin."""
    headers = get_auth_header(test_admin)
    response = client.get("/api/v1/users/", headers=headers)
    
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_users_as_non_admin(client, test_user):
    """Test getting all users as non-admin (should fail)."""
    headers = get_auth_header(test_user)
    response = client.get("/api/v1/users/", headers=headers)
    
    assert response.status_code == 403


def test_get_user_by_id(client, test_user, test_admin):
    """Test getting a user by ID."""
    headers = get_auth_header(test_admin)
    response = client.get(f"/api/v1/users/{test_user.id}", headers=headers)
    
    assert response.status_code == 200
    assert response.json()["id"] == test_user.id
    assert response.json()["wallet"] == test_user.wallet


def test_get_nonexistent_user(client, test_admin):
    """Test getting a nonexistent user."""
    headers = get_auth_header(test_admin)
    response = client.get("/api/v1/users/9999", headers=headers)
    
    assert response.status_code == 404


def test_update_user_role(client, test_user, test_admin):
    """Test updating a user's role as admin."""
    headers = get_auth_header(test_admin)
    
    response = client.put(
        f"/api/v1/users/{test_user.id}/role",
        json={"role": "VERIFIER"},
        headers=headers,
    )
    
    assert response.status_code == 200
    assert response.json()["role"] == "VERIFIER"


def test_update_user_role_as_non_admin(client, test_user):
    """Test updating a user's role as non-admin (should fail)."""
    headers = get_auth_header(test_user)
    
    response = client.put(
        f"/api/v1/users/{test_user.id}/role",
        json={"role": "VERIFIER"},
        headers=headers,
    )
    
    assert response.status_code == 403


def test_update_user_kyc_status(client, test_user, test_admin):
    """Test updating a user's KYC status as admin."""
    headers = get_auth_header(test_admin)
    
    response = client.put(
        f"/api/v1/users/{test_user.id}/kyc",
        json={"kyc_status": "APPROVED"},
        headers=headers,
    )
    
    assert response.status_code == 200
    assert response.json()["kyc_status"] == "APPROVED"


def test_update_user_kyc_status_as_non_admin(client, test_user):
    """Test updating a user's KYC status as non-admin (should fail)."""
    headers = get_auth_header(test_user)
    
    response = client.put(
        f"/api/v1/users/{test_user.id}/kyc",
        json={"kyc_status": "APPROVED"},
        headers=headers,
    )
    
    assert response.status_code == 403