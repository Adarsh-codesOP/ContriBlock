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
    with patch("app.api.v1.impact.ipfs_client") as mock_client:
        mock_client.add_file.return_value = "test_ipfs_hash"
        yield mock_client


@pytest.fixture
def test_approved_contribution(test_user, test_sector, db):
    """Create a test contribution with APPROVED status."""
    from app.models.contribution import Contribution
    from app.models.metadata import Metadata
    
    contribution = Contribution(
        title="Test Approved Contribution",
        description="Test description for approved contribution",
        status=ContributionStatus.APPROVED,
        user_id=test_user.id,
        sector_id=test_sector.id,
        tx_hash="0x123456789",
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


@pytest.fixture
def test_impact(test_approved_contribution, db):
    """Create a test impact record."""
    from app.models.impact import Impact
    
    impact = Impact(
        contribution_id=test_approved_contribution.id,
        description="Test impact description",
        impact_value=100,
        evidence_hash="test_evidence_hash",
        verified=False,
    )
    db.add(impact)
    db.commit()
    db.refresh(impact)
    
    return impact


def test_get_impacts(client, test_impact):
    """Test getting all impact records."""
    response = client.get("/api/v1/impact/")
    
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0
    assert response.json()[0]["id"] == test_impact.id
    assert response.json()[0]["description"] == test_impact.description


def test_get_impacts_by_contribution(client, test_impact, test_approved_contribution):
    """Test getting impact records filtered by contribution ID."""
    response = client.get(f"/api/v1/impact/?contribution_id={test_approved_contribution.id}")
    
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0
    assert response.json()[0]["contribution_id"] == test_approved_contribution.id


def test_create_impact(client, test_user, test_approved_contribution, mock_ipfs_client):
    """Test creating a new impact record."""
    headers = get_auth_header(test_user)
    
    # Create a mock file
    file_content = b"test evidence content"
    file = ("evidence.pdf", BytesIO(file_content), "application/pdf")
    
    # Create form data
    form_data = {
        "contribution_id": test_approved_contribution.id,
        "description": "New Test Impact",
        "impact_value": 150,
    }
    
    # Use TestClient to send multipart/form-data
    with patch("app.api.v1.impact.UploadFile", MagicMock()):
        response = client.post(
            "/api/v1/impact/",
            data=form_data,
            files={"evidence": file},
            headers=headers,
        )
    
    assert response.status_code == 201
    assert response.json()["contribution_id"] == int(form_data["contribution_id"])
    assert response.json()["description"] == form_data["description"]
    assert response.json()["impact_value"] == int(form_data["impact_value"])
    assert response.json()["evidence_hash"] == "test_ipfs_hash"
    assert response.json()["verified"] is False


def test_create_impact_for_non_approved_contribution(client, test_user, test_sector, db, mock_ipfs_client):
    """Test creating an impact record for a non-approved contribution (should fail)."""
    # Create a pending contribution
    from app.models.contribution import Contribution
    
    pending_contribution = Contribution(
        title="Test Pending Contribution",
        description="Test description for pending contribution",
        status=ContributionStatus.PENDING,
        user_id=test_user.id,
        sector_id=test_sector.id,
    )
    db.add(pending_contribution)
    db.commit()
    db.refresh(pending_contribution)
    
    headers = get_auth_header(test_user)
    
    # Create a mock file
    file_content = b"test evidence content"
    file = ("evidence.pdf", BytesIO(file_content), "application/pdf")
    
    # Create form data
    form_data = {
        "contribution_id": pending_contribution.id,
        "description": "New Test Impact",
        "impact_value": 150,
    }
    
    # Use TestClient to send multipart/form-data
    with patch("app.api.v1.impact.UploadFile", MagicMock()):
        response = client.post(
            "/api/v1/impact/",
            data=form_data,
            files={"evidence": file},
            headers=headers,
        )
    
    assert response.status_code == 400
    assert "must be approved" in response.json()["detail"]


def test_get_impact_by_id(client, test_impact):
    """Test getting an impact record by ID."""
    response = client.get(f"/api/v1/impact/{test_impact.id}")
    
    assert response.status_code == 200
    assert response.json()["id"] == test_impact.id
    assert response.json()["description"] == test_impact.description
    assert response.json()["impact_value"] == test_impact.impact_value


def test_get_nonexistent_impact(client):
    """Test getting a nonexistent impact record."""
    response = client.get("/api/v1/impact/9999")
    
    assert response.status_code == 404


def test_verify_impact(client, test_verifier, test_impact):
    """Test verifying an impact record as a verifier."""
    headers = get_auth_header(test_verifier)
    
    # Mock the blockchain client
    with patch("app.api.v1.impact.blockchain_client") as mock_blockchain:
        mock_blockchain.distribute_tokens.return_value = "0x987654321"
        
        response = client.post(
            f"/api/v1/impact/{test_impact.id}/verify",
            headers=headers,
        )
    
    assert response.status_code == 200
    assert response.json()["verified"] is True
    assert response.json()["tx_hash"] == "0x987654321"


def test_verify_impact_as_non_verifier(client, test_user, test_impact):
    """Test verifying an impact record as a non-verifier (should fail)."""
    headers = get_auth_header(test_user)
    
    response = client.post(
        f"/api/v1/impact/{test_impact.id}/verify",
        headers=headers,
    )
    
    assert response.status_code == 403


def test_verify_already_verified_impact(client, test_verifier, test_impact, db):
    """Test verifying an already verified impact record (should fail)."""
    # Mark the impact as verified
    test_impact.verified = True
    test_impact.tx_hash = "0xabcdef"
    db.commit()
    
    headers = get_auth_header(test_verifier)
    
    response = client.post(
        f"/api/v1/impact/{test_impact.id}/verify",
        headers=headers,
    )
    
    assert response.status_code == 400
    assert "already verified" in response.json()["detail"]