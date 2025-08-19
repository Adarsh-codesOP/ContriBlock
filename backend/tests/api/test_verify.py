import pytest
from unittest.mock import patch, MagicMock

from app.core.security import create_access_token
from app.models.contribution import ContributionStatus


def get_auth_header(user):
    """Helper function to create authorization header."""
    token = create_access_token(subject=user.wallet)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_pending_contribution(test_user, test_sector, db):
    """Create a test contribution with PENDING status."""
    from app.models.contribution import Contribution
    from app.models.metadata import Metadata
    
    contribution = Contribution(
        title="Test Pending Contribution",
        description="Test description for pending contribution",
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


def test_get_pending_contributions(client, test_verifier, test_pending_contribution):
    """Test getting pending contributions as a verifier."""
    headers = get_auth_header(test_verifier)
    
    response = client.get("/api/v1/verify/pending", headers=headers)
    
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0
    assert response.json()[0]["id"] == test_pending_contribution.id
    assert response.json()[0]["status"] == ContributionStatus.PENDING.value


def test_get_pending_contributions_as_non_verifier(client, test_user, test_pending_contribution):
    """Test getting pending contributions as a non-verifier (should fail)."""
    headers = get_auth_header(test_user)
    
    response = client.get("/api/v1/verify/pending", headers=headers)
    
    assert response.status_code == 403


def test_approve_contribution(client, test_verifier, test_pending_contribution):
    """Test approving a pending contribution as a verifier."""
    headers = get_auth_header(test_verifier)
    
    # Mock the blockchain client
    with patch("app.api.v1.verify.blockchain_client") as mock_blockchain:
        mock_blockchain.register_contribution.return_value = "0x123456789"
        
        response = client.post(
            f"/api/v1/verify/{test_pending_contribution.id}/approve",
            headers=headers,
        )
    
    assert response.status_code == 200
    assert response.json()["status"] == ContributionStatus.APPROVED.value
    assert response.json()["tx_hash"] == "0x123456789"


def test_approve_contribution_as_non_verifier(client, test_user, test_pending_contribution):
    """Test approving a contribution as a non-verifier (should fail)."""
    headers = get_auth_header(test_user)
    
    response = client.post(
        f"/api/v1/verify/{test_pending_contribution.id}/approve",
        headers=headers,
    )
    
    assert response.status_code == 403


def test_approve_non_pending_contribution(client, test_verifier, test_pending_contribution, db):
    """Test approving a non-pending contribution (should fail)."""
    # Change the contribution status to APPROVED
    test_pending_contribution.status = ContributionStatus.APPROVED
    db.commit()
    
    headers = get_auth_header(test_verifier)
    
    response = client.post(
        f"/api/v1/verify/{test_pending_contribution.id}/approve",
        headers=headers,
    )
    
    assert response.status_code == 400
    assert "not in PENDING status" in response.json()["detail"]


def test_reject_contribution(client, test_verifier, test_pending_contribution):
    """Test rejecting a pending contribution as a verifier."""
    headers = get_auth_header(test_verifier)
    
    rejection_data = {
        "reason": "Test rejection reason"
    }
    
    response = client.post(
        f"/api/v1/verify/{test_pending_contribution.id}/reject",
        json=rejection_data,
        headers=headers,
    )
    
    assert response.status_code == 200
    assert response.json()["status"] == ContributionStatus.REJECTED.value
    assert response.json()["rejection_reason"] == rejection_data["reason"]


def test_reject_contribution_as_non_verifier(client, test_user, test_pending_contribution):
    """Test rejecting a contribution as a non-verifier (should fail)."""
    headers = get_auth_header(test_user)
    
    rejection_data = {
        "reason": "Test rejection reason"
    }
    
    response = client.post(
        f"/api/v1/verify/{test_pending_contribution.id}/reject",
        json=rejection_data,
        headers=headers,
    )
    
    assert response.status_code == 403


def test_reject_non_pending_contribution(client, test_verifier, test_pending_contribution, db):
    """Test rejecting a non-pending contribution (should fail)."""
    # Change the contribution status to APPROVED
    test_pending_contribution.status = ContributionStatus.APPROVED
    db.commit()
    
    headers = get_auth_header(test_verifier)
    
    rejection_data = {
        "reason": "Test rejection reason"
    }
    
    response = client.post(
        f"/api/v1/verify/{test_pending_contribution.id}/reject",
        json=rejection_data,
        headers=headers,
    )
    
    assert response.status_code == 400
    assert "not in PENDING status" in response.json()["detail"]