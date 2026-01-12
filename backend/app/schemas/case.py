from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
import re


# Regex patterns
INVOICE_NUMBER_PATTERN = r"^[a-zA-Z0-9\-\/\_]+$"  # Alphanumeric with hyphens, slashes, underscores
NOTES_PATTERN = r"^[a-zA-Z0-9\s\.,;:'\"\-\!\?\(\)\n\r]+$"  # Text with common punctuation


class CaseStatus(str, Enum):
    """Enum for case status values."""
    NEW = "New"
    IN_FOLLOW_UP = "In Follow-up"
    PARTIALLY_PAID = "Partially Paid"
    CLOSED = "Closed"


class CaseBase(BaseModel):
    """Base schema for case data."""
    
    invoice_number: str = Field(
        ..., 
        min_length=1, 
        max_length=100, 
        description="Invoice number (alphanumeric, hyphens, slashes allowed)",
        examples=["INV-2026-001", "PO/2026/12345"]
    )
    invoice_amount: Decimal = Field(
        ..., 
        gt=0, 
        le=999999999999.99,
        description="Invoice amount (must be positive)",
        examples=[5000.00, 125000.50]
    )
    invoice_date: date = Field(
        ..., 
        description="Invoice date (YYYY-MM-DD)",
        examples=["2026-01-01"]
    )
    due_date: date = Field(
        ..., 
        description="Payment due date (YYYY-MM-DD)",
        examples=["2026-02-01"]
    )
    status: CaseStatus = Field(
        default=CaseStatus.NEW, 
        description="Case status"
    )
    last_follow_up_notes: Optional[str] = Field(
        None, 
        max_length=2000,
        description="Last follow-up notes (max 2000 characters)",
        examples=["Called on Jan 10, promised payment by Jan 15"]
    )
    
    @field_validator('invoice_number')
    @classmethod
    def validate_invoice_number(cls, v: str) -> str:
        v = v.strip()
        if not re.match(INVOICE_NUMBER_PATTERN, v):
            raise ValueError('Invoice number must contain only letters, numbers, hyphens, slashes, and underscores')
        return v.upper()  # Normalize to uppercase
    
    @field_validator('last_follow_up_notes')
    @classmethod
    def validate_notes(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        return v if v else None
    
    @model_validator(mode='after')
    def validate_dates(self):
        if self.due_date < self.invoice_date:
            raise ValueError('Due date cannot be before invoice date')
        return self


class CaseCreate(CaseBase):
    """Schema for creating a new case."""
    client_id: int = Field(..., gt=0, description="Client ID")


class CaseUpdate(BaseModel):
    """Schema for updating an existing case. All fields are optional."""
    
    invoice_number: Optional[str] = Field(None, min_length=1, max_length=100)
    invoice_amount: Optional[Decimal] = Field(None, gt=0, le=999999999999.99)
    invoice_date: Optional[date] = None
    due_date: Optional[date] = None
    status: Optional[CaseStatus] = None
    last_follow_up_notes: Optional[str] = Field(None, max_length=2000)
    
    @field_validator('invoice_number')
    @classmethod
    def validate_invoice_number(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not re.match(INVOICE_NUMBER_PATTERN, v):
            raise ValueError('Invoice number must contain only letters, numbers, hyphens, slashes, and underscores')
        return v.upper()
    
    @field_validator('last_follow_up_notes')
    @classmethod
    def validate_notes(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        return v if v else None


class CaseStatusUpdate(BaseModel):
    """Schema for updating only status and notes."""
    status: Optional[CaseStatus] = None
    last_follow_up_notes: Optional[str] = Field(None, max_length=2000)
    
    @field_validator('last_follow_up_notes')
    @classmethod
    def validate_notes(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        return v if v else None


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
