import pytest
from unittest.mock import patch

from app.core.security import create_access_token


def get_auth_header(user):
    """Helper function to create authorization header."""
    token = create_access_token(subject=user.wallet)
    return {"Authorization": f"Bearer {token}"}


def test_get_sectors(client, test_sector):
    """Test getting all sectors."""
    response = client.get("/api/v1/sectors/")
    
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0
    assert response.json()[0]["id"] == test_sector.id
    assert response.json()[0]["name"] == test_sector.name


def test_create_sector(client, test_admin):
    """Test creating a new sector as admin."""
    headers = get_auth_header(test_admin)
    
    sector_data = {
        "name": "New Test Sector",
        "description": "A new sector for testing",
    }
    
    response = client.post(
        "/api/v1/sectors/",
        json=sector_data,
        headers=headers,
    )
    
    assert response.status_code == 201
    assert response.json()["name"] == sector_data["name"]
    assert response.json()["description"] == sector_data["description"]


def test_create_sector_as_non_admin(client, test_user):
    """Test creating a new sector as non-admin (should fail)."""
    headers = get_auth_header(test_user)
    
    sector_data = {
        "name": "New Test Sector",
        "description": "A new sector for testing",
    }
    
    response = client.post(
        "/api/v1/sectors/",
        json=sector_data,
        headers=headers,
    )
    
    assert response.status_code == 403


def test_create_duplicate_sector(client, test_admin, test_sector):
    """Test creating a sector with a duplicate name (should fail)."""
    headers = get_auth_header(test_admin)
    
    sector_data = {
        "name": test_sector.name,  # Same name as existing sector
        "description": "Another description",
    }
    
    response = client.post(
        "/api/v1/sectors/",
        json=sector_data,
        headers=headers,
    )
    
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_get_sector_by_id(client, test_sector):
    """Test getting a sector by ID."""
    response = client.get(f"/api/v1/sectors/{test_sector.id}")
    
    assert response.status_code == 200
    assert response.json()["id"] == test_sector.id
    assert response.json()["name"] == test_sector.name


def test_get_nonexistent_sector(client):
    """Test getting a nonexistent sector."""
    response = client.get("/api/v1/sectors/9999")
    
    assert response.status_code == 404


def test_update_sector(client, test_admin, test_sector):
    """Test updating a sector as admin."""
    headers = get_auth_header(test_admin)
    
    update_data = {
        "name": "Updated Sector Name",
        "description": "Updated sector description",
    }
    
    response = client.put(
        f"/api/v1/sectors/{test_sector.id}",
        json=update_data,
        headers=headers,
    )
    
    assert response.status_code == 200
    assert response.json()["name"] == update_data["name"]
    assert response.json()["description"] == update_data["description"]


def test_update_sector_as_non_admin(client, test_user, test_sector):
    """Test updating a sector as non-admin (should fail)."""
    headers = get_auth_header(test_user)
    
    update_data = {
        "name": "Updated Sector Name",
        "description": "Updated sector description",
    }
    
    response = client.put(
        f"/api/v1/sectors/{test_sector.id}",
        json=update_data,
        headers=headers,
    )
    
    assert response.status_code == 403


def test_delete_sector(client, test_admin, test_sector):
    """Test deleting a sector as admin."""
    headers = get_auth_header(test_admin)
    
    response = client.delete(
        f"/api/v1/sectors/{test_sector.id}",
        headers=headers,
    )
    
    assert response.status_code == 204
    
    # Verify sector is deleted
    get_response = client.get(f"/api/v1/sectors/{test_sector.id}")
    assert get_response.status_code == 404


def test_delete_sector_as_non_admin(client, test_user, test_sector):
    """Test deleting a sector as non-admin (should fail)."""
    headers = get_auth_header(test_user)
    
    response = client.delete(
        f"/api/v1/sectors/{test_sector.id}",
        headers=headers,
    )
    
    assert response.status_code == 403