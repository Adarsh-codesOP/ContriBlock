import pytest
from unittest.mock import patch, MagicMock
from io import BytesIO

from app.core.security import create_access_token
from app.models.contribution import ContributionStatus


def get_auth_header(user):
    """Helper function to create authorization header."""
    token = create_access_token(subject=user.wallet)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def mock_ipfs_client():
    """Mock IPFS client for testing file uploads."""
    with patch("app.api.v1.contrib.ipfs_client") as mock_client:
        mock_client.add_file.return_value = "test_ipfs_hash"
        yield mock_client


@pytest.fixture
def test_contribution(test_user, test_sector, db):
    """Create a test contribution."""
    from app.models.contribution import Contribution
    from app.models.metadata import Metadata
    
    contribution = Contribution(
        title="Test Contribution",
        description="Test description",
        status=ContributionStatus.PENDING,
        user_id=test_user.id,
        sector_id=test_sector.id,
    )
    db.add(contribution)
    db.commit()
    db.refresh(contribution)
    
    metadata = Metadata(
        contribution_id=contribution.id,
        ipfs_hash="test_ipfs_hash",
        file_name="test_file.pdf",
        file_size=1024,
        file_type="application/pdf",
    )
    db.add(metadata)
    db.commit()
    
    return contribution


def test_get_contributions(client, test_contribution):
    """Test getting all contributions."""
    response = client.get("/api/v1/contributions/")
    
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0
    assert response.json()[0]["id"] == test_contribution.id
    assert response.json()[0]["title"] == test_contribution.title


def test_get_contributions_with_filters(client, test_contribution):
    """Test getting contributions with filters."""
    # Filter by status
    response = client.get(f"/api/v1/contributions/?status={test_contribution.status.value}")
    assert response.status_code == 200
    assert len(response.json()) > 0
    
    # Filter by sector
    response = client.get(f"/api/v1/contributions/?sector_id={test_contribution.sector_id}")
    assert response.status_code == 200
    assert len(response.json()) > 0
    
    # Filter by user
    response = client.get(f"/api/v1/contributions/?user_id={test_contribution.user_id}")
    assert response.status_code == 200
    assert len(response.json()) > 0


def test_create_contribution(client, test_user, test_sector, mock_ipfs_client):
    """Test creating a new contribution."""
    headers = get_auth_header(test_user)
    
    # Create a mock file
    file_content = b"test file content"
    file = ("test_file.pdf", BytesIO(file_content), "application/pdf")
    
    # Create form data
    form_data = {
        "title": "New Test Contribution",
        "description": "A new contribution for testing",
        "sector_id": test_sector.id,
    }
    
    # Use TestClient to send multipart/form-data
    with patch("app.api.v1.contrib.UploadFile", MagicMock()):
        response = client.post(
            "/api/v1/contributions/",
            data=form_data,
            files={"file": file},
            headers=headers,
        )
    
    assert response.status_code == 201
    assert response.json()["title"] == form_data["title"]
    assert response.json()["description"] == form_data["description"]
    assert response.json()["sector_id"] == form_data["sector_id"]
    assert response.json()["status"] == ContributionStatus.PENDING.value


def test_get_contribution_by_id(client, test_contribution):
    """Test getting a contribution by ID."""
    response = client.get(f"/api/v1/contributions/{test_contribution.id}")
    
    assert response.status_code == 200
    assert response.json()["id"] == test_contribution.id
    assert response.json()["title"] == test_contribution.title
    assert "metadata" in response.json()
    assert response.json()["metadata"]["ipfs_hash"] == "test_ipfs_hash"


def test_get_nonexistent_contribution(client):
    """Test getting a nonexistent contribution."""
    response = client.get("/api/v1/contributions/9999")
    
    assert response.status_code == 404


def test_update_contribution(client, test_user, test_contribution):
    """Test updating a contribution as the owner."""
    headers = get_auth_header(test_user)
    
    update_data = {
        "title": "Updated Contribution Title",
        "description": "Updated contribution description",
    }
    
    response = client.put(
        f"/api/v1/contributions/{test_contribution.id}",
        json=update_data,
        headers=headers,
    )
    
    assert response.status_code == 200
    assert response.json()["title"] == update_data["title"]
    assert response.json()["description"] == update_data["description"]


def test_update_contribution_as_non_owner(client, test_verifier, test_contribution):
    """Test updating a contribution as non-owner (should fail)."""
    headers = get_auth_header(test_verifier)  # Not the owner
    
    update_data = {
        "title": "Updated Contribution Title",
        "description": "Updated contribution description",
    }
    
    response = client.put(
        f"/api/v1/contributions/{test_contribution.id}",
        json=update_data,
        headers=headers,
    )
    
    assert response.status_code == 403


def test_delete_contribution(client, test_user, test_contribution):
    """Test deleting a contribution as the owner."""
    headers = get_auth_header(test_user)
    
    response = client.delete(
        f"/api/v1/contributions/{test_contribution.id}",
        headers=headers,
    )
    
    assert response.status_code == 204
    
    # Verify contribution is deleted
    get_response = client.get(f"/api/v1/contributions/{test_contribution.id}")
    assert get_response.status_code == 404


def test_delete_contribution_as_non_owner(client, test_verifier, test_contribution):
    """Test deleting a contribution as non-owner (should fail)."""
    headers = get_auth_header(test_verifier)  # Not the owner
    
    response = client.delete(
        f"/api/v1/contributions/{test_contribution.id}",
        headers=headers,
    )
    
    assert response.status_code == 403