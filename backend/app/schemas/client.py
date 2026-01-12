from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class ClientBase(BaseModel):
    """Base schema for client data."""
    
    client_name: str = Field(..., min_length=1, max_length=255, description="Name of the client")
    company_name: Optional[str] = Field(None, max_length=255, description="Company name")
    city: Optional[str] = Field(None, max_length=100, description="City")
    contact_person: Optional[str] = Field(None, max_length=255, description="Contact person name")
    phone: Optional[str] = Field(None, max_length=50, description="Phone number")
    email: Optional[EmailStr] = Field(None, description="Email address")


class ClientCreate(ClientBase):
    """Schema for creating a new client."""
    pass


class ClientUpdate(BaseModel):
    """Schema for updating an existing client. All fields are optional."""
    
    client_name: Optional[str] = Field(None, min_length=1, max_length=255, description="Name of the client")
    company_name: Optional[str] = Field(None, max_length=255, description="Company name")
    city: Optional[str] = Field(None, max_length=100, description="City")
    contact_person: Optional[str] = Field(None, max_length=255, description="Contact person name")
    phone: Optional[str] = Field(None, max_length=50, description="Phone number")
    email: Optional[EmailStr] = Field(None, description="Email address")


class ClientResponse(ClientBase):
    """Schema for client response including database fields."""
    
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ClientListResponse(BaseModel):
    """Schema for paginated list of clients."""
    
    clients: List[ClientResponse]
    total: int
    page: int
    page_size: int
