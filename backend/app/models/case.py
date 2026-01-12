from sqlalchemy import Column, Integer, String, DateTime, Date, Numeric, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Case(Base):
    """
    SQLAlchemy model for cases table.
    Represents an invoice recovery case linked to a client.
    """
    
    __tablename__ = "cases"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    invoice_number = Column(String(100), nullable=False, index=True)
    invoice_amount = Column(Numeric(15, 2), nullable=False)
    invoice_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False, index=True)
    status = Column(String(50), default="New", nullable=False, index=True)
    last_follow_up_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationship to Client
    client = relationship("Client", back_populates="cases")
    
    def __repr__(self):
        return f"<Case(id={self.id}, invoice_number='{self.invoice_number}', status='{self.status}')>"
