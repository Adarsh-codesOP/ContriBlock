import pytest
from unittest.mock import patch, MagicMock

from app.core.security import create_access_token


def get_auth_header(user):
    """Helper function to create authorization header."""
    token = create_access_token(subject=user.wallet)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_marketplace_item(db):
    """Create a test marketplace item."""
    from app.models.marketplace import MarketplaceItem
    
    item = MarketplaceItem(
        name="Test Item",
        description="Test marketplace item description",
        price=100,
        active=True,
        image_url="https://example.com/test-item.jpg",
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return item


@pytest.fixture
def test_purchase(test_user, test_marketplace_item, db):
    """Create a test purchase record."""
    from app.models.marketplace import Purchase
    
    purchase = Purchase(
        user_id=test_user.id,
        item_id=test_marketplace_item.id,
        price=test_marketplace_item.price,
        tx_hash="0xabcdef123456",
    )
    db.add(purchase)
    db.commit()
    db.refresh(purchase)
    
    return purchase


def test_get_marketplace_items(client, test_marketplace_item):
    """Test getting all marketplace items."""
    response = client.get("/api/v1/market/items")
    
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0
    assert response.json()[0]["id"] == test_marketplace_item.id
    assert response.json()[0]["name"] == test_marketplace_item.name


def test_get_active_marketplace_items(client, test_marketplace_item, db):
    """Test getting only active marketplace items."""
    # Create an inactive item
    from app.models.marketplace import MarketplaceItem
    
    inactive_item = MarketplaceItem(
        name="Inactive Item",
        description="Inactive marketplace item description",
        price=200,
        active=False,
        image_url="https://example.com/inactive-item.jpg",
    )
    db.add(inactive_item)
    db.commit()
    
    response = client.get("/api/v1/market/items?active=true")
    
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0
    
    # Check that all returned items are active
    for item in response.json():
        assert item["active"] is True
    
    # Check that the inactive item is not in the response
    item_ids = [item["id"] for item in response.json()]
    assert inactive_item.id not in item_ids


def test_create_marketplace_item(client, test_admin):
    """Test creating a new marketplace item as admin."""
    headers = get_auth_header(test_admin)
    
    item_data = {
        "name": "New Test Item",
        "description": "A new marketplace item for testing",
        "price": 150,
        "active": True,
        "image_url": "https://example.com/new-item.jpg",
    }
    
    response = client.post(
        "/api/v1/market/items",
        json=item_data,
        headers=headers,
    )
    
    assert response.status_code == 201
    assert response.json()["name"] == item_data["name"]
    assert response.json()["description"] == item_data["description"]
    assert response.json()["price"] == item_data["price"]
    assert response.json()["active"] == item_data["active"]
    assert response.json()["image_url"] == item_data["image_url"]


def test_create_marketplace_item_as_non_admin(client, test_user):
    """Test creating a marketplace item as non-admin (should fail)."""
    headers = get_auth_header(test_user)
    
    item_data = {
        "name": "New Test Item",
        "description": "A new marketplace item for testing",
        "price": 150,
        "active": True,
        "image_url": "https://example.com/new-item.jpg",
    }
    
    response = client.post(
        "/api/v1/market/items",
        json=item_data,
        headers=headers,
    )
    
    assert response.status_code == 403


def test_get_marketplace_item_by_id(client, test_marketplace_item):
    """Test getting a marketplace item by ID."""
    response = client.get(f"/api/v1/market/items/{test_marketplace_item.id}")
    
    assert response.status_code == 200
    assert response.json()["id"] == test_marketplace_item.id
    assert response.json()["name"] == test_marketplace_item.name
    assert response.json()["price"] == test_marketplace_item.price


def test_get_nonexistent_marketplace_item(client):
    """Test getting a nonexistent marketplace item."""
    response = client.get("/api/v1/market/items/9999")
    
    assert response.status_code == 404


def test_update_marketplace_item(client, test_admin, test_marketplace_item):
    """Test updating a marketplace item as admin."""
    headers = get_auth_header(test_admin)
    
    update_data = {
        "name": "Updated Item Name",
        "description": "Updated item description",
        "price": 200,
        "active": False,
        "image_url": "https://example.com/updated-item.jpg",
    }
    
    response = client.put(
        f"/api/v1/market/items/{test_marketplace_item.id}",
        json=update_data,
        headers=headers,
    )
    
    assert response.status_code == 200
    assert response.json()["name"] == update_data["name"]
    assert response.json()["description"] == update_data["description"]
    assert response.json()["price"] == update_data["price"]
    assert response.json()["active"] == update_data["active"]
    assert response.json()["image_url"] == update_data["image_url"]


def test_update_marketplace_item_as_non_admin(client, test_user, test_marketplace_item):
    """Test updating a marketplace item as non-admin (should fail)."""
    headers = get_auth_header(test_user)
    
    update_data = {
        "name": "Updated Item Name",
        "description": "Updated item description",
        "price": 200,
        "active": False,
        "image_url": "https://example.com/updated-item.jpg",
    }
    
    response = client.put(
        f"/api/v1/market/items/{test_marketplace_item.id}",
        json=update_data,
        headers=headers,
    )
    
    assert response.status_code == 403


def test_delete_marketplace_item(client, test_admin, test_marketplace_item):
    """Test deleting a marketplace item as admin."""
    headers = get_auth_header(test_admin)
    
    response = client.delete(
        f"/api/v1/market/items/{test_marketplace_item.id}",
        headers=headers,
    )
    
    assert response.status_code == 204
    
    # Verify item is deleted
    get_response = client.get(f"/api/v1/market/items/{test_marketplace_item.id}")
    assert get_response.status_code == 404


def test_delete_marketplace_item_as_non_admin(client, test_user, test_marketplace_item):
    """Test deleting a marketplace item as non-admin (should fail)."""
    headers = get_auth_header(test_user)
    
    response = client.delete(
        f"/api/v1/market/items/{test_marketplace_item.id}",
        headers=headers,
    )
    
    assert response.status_code == 403


def test_delete_marketplace_item_with_purchases(client, test_admin, test_purchase):
    """Test deleting a marketplace item that has associated purchases (should fail)."""
    headers = get_auth_header(test_admin)
    
    response = client.delete(
        f"/api/v1/market/items/{test_purchase.item_id}",
        headers=headers,
    )
    
    assert response.status_code == 400
    assert "has associated purchases" in response.json()["detail"]


def test_purchase_item(client, test_user, test_marketplace_item):
    """Test purchasing a marketplace item."""
    headers = get_auth_header(test_user)
    
    # Mock the blockchain client
    with patch("app.api.v1.market.blockchain_client") as mock_blockchain:
        # Mock token balance check
        mock_blockchain.get_token_balance.return_value = 1000  # More than item price
        # Mock payment transaction
        mock_blockchain.process_payment.return_value = "0x123456789"
        
        purchase_data = {
            "item_id": test_marketplace_item.id
        }
        
        response = client.post(
            "/api/v1/market/purchase",
            json=purchase_data,
            headers=headers,
        )
    
    assert response.status_code == 201
    assert response.json()["item_id"] == test_marketplace_item.id
    assert response.json()["user_id"] == test_user.id
    assert response.json()["price"] == test_marketplace_item.price
    assert response.json()["tx_hash"] == "0x123456789"


def test_purchase_inactive_item(client, test_user, test_marketplace_item, db):
    """Test purchasing an inactive marketplace item (should fail)."""
    # Make the item inactive
    test_marketplace_item.active = False
    db.commit()
    
    headers = get_auth_header(test_user)
    
    purchase_data = {
        "item_id": test_marketplace_item.id
    }
    
    response = client.post(
        "/api/v1/market/purchase",
        json=purchase_data,
        headers=headers,
    )
    
    assert response.status_code == 400
    assert "not active" in response.json()["detail"]


def test_purchase_item_insufficient_balance(client, test_user, test_marketplace_item):
    """Test purchasing an item with insufficient token balance (should fail)."""
    headers = get_auth_header(test_user)
    
    # Mock the blockchain client
    with patch("app.api.v1.market.blockchain_client") as mock_blockchain:
        # Mock token balance check - less than item price
        mock_blockchain.get_token_balance.return_value = 10  # Less than item price
        
        purchase_data = {
            "item_id": test_marketplace_item.id
        }
        
        response = client.post(
            "/api/v1/market/purchase",
            json=purchase_data,
            headers=headers,
        )
    
    assert response.status_code == 400
    assert "insufficient token balance" in response.json()["detail"]


def test_get_user_purchases(client, test_user, test_purchase):
    """Test getting all purchases for the current user."""
    headers = get_auth_header(test_user)
    
    response = client.get("/api/v1/market/purchases", headers=headers)
    
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0
    assert response.json()[0]["id"] == test_purchase.id
    assert response.json()[0]["user_id"] == test_user.id
    assert response.json()[0]["item_id"] == test_purchase.item_id


def test_get_purchase_by_id(client, test_user, test_purchase):
    """Test getting a specific purchase by ID."""
    headers = get_auth_header(test_user)
    
    response = client.get(f"/api/v1/market/purchases/{test_purchase.id}", headers=headers)
    
    assert response.status_code == 200
    assert response.json()["id"] == test_purchase.id
    assert response.json()["user_id"] == test_user.id
    assert response.json()["item_id"] == test_purchase.item_id


def test_get_purchase_by_id_as_non_owner(client, test_verifier, test_purchase):
    """Test getting a purchase by ID as non-owner (should fail)."""
    headers = get_auth_header(test_verifier)  # Not the owner
    
    response = client.get(f"/api/v1/market/purchases/{test_purchase.id}", headers=headers)
    
    assert response.status_code == 403


def test_get_purchase_by_id_as_admin(client, test_admin, test_purchase):
    """Test getting a purchase by ID as admin (should succeed)."""
    headers = get_auth_header(test_admin)
    
    response = client.get(f"/api/v1/market/purchases/{test_purchase.id}", headers=headers)
    
    assert response.status_code == 200
    assert response.json()["id"] == test_purchase.id