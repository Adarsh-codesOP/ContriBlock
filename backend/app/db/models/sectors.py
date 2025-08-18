from sqlalchemy import Column, Integer, String, JSON

from app.db.base import Base


class Sector(Base):
    __tablename__ = "sectors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    metadata_schema = Column(JSON, nullable=False)  # JSON schema for contribution metadata
    verification_policy = Column(JSON, nullable=False)  # Verification requirements