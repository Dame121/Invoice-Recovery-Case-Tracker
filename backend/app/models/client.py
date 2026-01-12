from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Client(Base):
    """
    SQLAlchemy model for clients table.
    Represents a client in the Invoice Recovery Tracker system.
    """
    
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String(255), nullable=False, index=True)
    company_name = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    contact_person = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationship to Cases
    cases = relationship("Case", back_populates="client", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Client(id={self.id}, client_name='{self.client_name}', company_name='{self.company_name}')>"
