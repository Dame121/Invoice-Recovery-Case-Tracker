from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from enum import Enum


class CaseStatus(str, Enum):
    """Enum for case status values."""
    NEW = "New"
    IN_FOLLOW_UP = "In Follow-up"
    PARTIALLY_PAID = "Partially Paid"
    CLOSED = "Closed"


class CaseBase(BaseModel):
    """Base schema for case data."""
    
    invoice_number: str = Field(..., min_length=1, max_length=100, description="Invoice number")
    invoice_amount: Decimal = Field(..., gt=0, description="Invoice amount")
    invoice_date: date = Field(..., description="Invoice date")
    due_date: date = Field(..., description="Due date")
    status: CaseStatus = Field(default=CaseStatus.NEW, description="Case status")
    last_follow_up_notes: Optional[str] = Field(None, description="Last follow-up notes")


class CaseCreate(CaseBase):
    """Schema for creating a new case."""
    client_id: int = Field(..., gt=0, description="Client ID")


class CaseUpdate(BaseModel):
    """Schema for updating an existing case. All fields are optional."""
    
    invoice_number: Optional[str] = Field(None, min_length=1, max_length=100)
    invoice_amount: Optional[Decimal] = Field(None, gt=0)
    invoice_date: Optional[date] = None
    due_date: Optional[date] = None
    status: Optional[CaseStatus] = None
    last_follow_up_notes: Optional[str] = None


class CaseStatusUpdate(BaseModel):
    """Schema for updating only status and notes."""
    status: Optional[CaseStatus] = None
    last_follow_up_notes: Optional[str] = None


class ClientInfo(BaseModel):
    """Minimal client info for case response."""
    id: int
    client_name: str
    company_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class CaseResponse(CaseBase):
    """Schema for case response including database fields."""
    
    id: int
    client_id: int
    client: ClientInfo
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CaseListResponse(BaseModel):
    """Schema for paginated list of cases."""
    
    cases: List[CaseResponse]
    total: int
    page: int
    page_size: int
