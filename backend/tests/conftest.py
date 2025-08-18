import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.deps import get_db
from app.db.base import Base
from app.db.models import User, UserRole, KYCStatus, Sector

# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite:///:memory:"

# Create test engine
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Create test session
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    db = TestingSessionLocal()
    
    try:
        yield db
    finally:
        db.close()
        
    # Drop tables after test
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    # Override the get_db dependency
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clear dependency override
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_user(db_session):
    # Create a test user
    user = User(
        wallet="0x1234567890123456789012345678901234567890",
        role=UserRole.USER,
        kyc_status=KYCStatus.APPROVED,
        name="Test User",
        email="test@example.com",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def test_admin(db_session):
    # Create a test admin
    admin = User(
        wallet="0x0987654321098765432109876543210987654321",
        role=UserRole.ADMIN,
        kyc_status=KYCStatus.APPROVED,
        name="Test Admin",
        email="admin@example.com",
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture(scope="function")
def test_verifier(db_session):
    # Create a test verifier
    verifier = User(
        wallet="0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        role=UserRole.VERIFIER,
        kyc_status=KYCStatus.APPROVED,
        name="Test Verifier",
        email="verifier@example.com",
    )
    db_session.add(verifier)
    db_session.commit()
    db_session.refresh(verifier)
    return verifier


@pytest.fixture(scope="function")
def test_sector(db_session):
    # Create a test sector
    sector = Sector(
        name="Test Sector",
        description="A sector for testing",
    )
    db_session.add(sector)
    db_session.commit()
    db_session.refresh(sector)
    return sector