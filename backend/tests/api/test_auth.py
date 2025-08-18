import pytest
from unittest.mock import patch, MagicMock

from app.core.security import create_access_token


def test_get_nonce(client):
    """Test getting a nonce for authentication."""
    response = client.post("/api/v1/auth/nonce", json={"wallet": "0x1234567890123456789012345678901234567890"})
    
    assert response.status_code == 200
    assert "nonce" in response.json()
    assert isinstance(response.json()["nonce"], str)


def test_get_nonce_invalid_wallet(client):
    """Test getting a nonce with invalid wallet address."""
    response = client.post("/api/v1/auth/nonce", json={"wallet": "invalid"})
    
    assert response.status_code == 400
    assert "detail" in response.json()
    assert "Invalid wallet address" in response.json()["detail"]


@patch("app.api.v1.auth.web3_client")
def test_verify_signature_new_user(mock_web3_client, client, db_session):
    """Test verifying signature for a new user."""
    # Mock the verify_siwe_message method
    mock_web3_client.verify_siwe_message.return_value = True
    
    # Set up a nonce
    wallet = "0x1234567890123456789012345678901234567890"
    nonce = "test-nonce"
    client.post("/api/v1/auth/nonce", json={"wallet": wallet})
    
    # Verify the signature
    response = client.post(
        "/api/v1/auth/verify",
        json={
            "wallet": wallet,
            "message": f"Sign in with Ethereum to ContriBlock\nNonce: {nonce}",
            "signature": "0xsignature",
        },
    )
    
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["wallet"] == wallet.lower()
    assert response.json()["role"] == "USER"


@patch("app.api.v1.auth.web3_client")
def test_verify_signature_existing_user(mock_web3_client, client, db_session, test_user):
    """Test verifying signature for an existing user."""
    # Mock the verify_siwe_message method
    mock_web3_client.verify_siwe_message.return_value = True
    
    # Set up a nonce
    wallet = test_user.wallet
    nonce = "test-nonce"
    client.post("/api/v1/auth/nonce", json={"wallet": wallet})
    
    # Verify the signature
    response = client.post(
        "/api/v1/auth/verify",
        json={
            "wallet": wallet,
            "message": f"Sign in with Ethereum to ContriBlock\nNonce: {nonce}",
            "signature": "0xsignature",
        },
    )
    
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["wallet"] == wallet.lower()
    assert response.json()["role"] == test_user.role.value


@patch("app.api.v1.auth.web3_client")
def test_verify_signature_invalid_signature(mock_web3_client, client):
    """Test verifying an invalid signature."""
    # Mock the verify_siwe_message method to return False
    mock_web3_client.verify_siwe_message.return_value = False
    
    # Set up a nonce
    wallet = "0x1234567890123456789012345678901234567890"
    nonce = "test-nonce"
    client.post("/api/v1/auth/nonce", json={"wallet": wallet})
    
    # Verify the signature
    response = client.post(
        "/api/v1/auth/verify",
        json={
            "wallet": wallet,
            "message": f"Sign in with Ethereum to ContriBlock\nNonce: {nonce}",
            "signature": "0xinvalid",
        },
    )
    
    assert response.status_code == 401
    assert "detail" in response.json()
    assert "Invalid signature" in response.json()["detail"]


@patch("app.api.v1.auth.web3_client")
def test_verify_signature_invalid_nonce(mock_web3_client, client):
    """Test verifying a signature with an invalid nonce."""
    # Mock the verify_siwe_message method
    mock_web3_client.verify_siwe_message.return_value = True
    
    # Set up a nonce
    wallet = "0x1234567890123456789012345678901234567890"
    client.post("/api/v1/auth/nonce", json={"wallet": wallet})
    
    # Verify the signature with an invalid nonce
    response = client.post(
        "/api/v1/auth/verify",
        json={
            "wallet": wallet,
            "message": "Sign in with Ethereum to ContriBlock\nNonce: invalid-nonce",
            "signature": "0xsignature",
        },
    )
    
    assert response.status_code == 401
    assert "detail" in response.json()
    assert "Invalid nonce" in response.json()["detail"]