from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime
import re


# Regex patterns
NAME_PATTERN = r"^[a-zA-Z\s\-\.'À-ɏ]+$"  # Letters, spaces, hyphens, dots, apostrophes, accents
COMPANY_PATTERN = r"^[a-zA-Z0-9\s\-\.,&'()]+$"  # Alphanumeric, common business symbols
CITY_PATTERN = r"^[a-zA-Z\s\-']+$"  # Letters, spaces, hyphens, apostrophes
PHONE_PATTERN = r"^[\+]?[0-9\s\-\(\)]{7,20}$"  # International phone format


class ClientBase(BaseModel):
    """Base schema for client data."""
    
    client_name: str = Field(
        ..., 
        min_length=2, 
        max_length=255, 
        description="Name of the client (letters, spaces, hyphens only)",
        examples=["John Doe", "Raj Kumar"]
    )
    company_name: Optional[str] = Field(
        None, 
        max_length=255, 
        description="Company name",
        examples=["Acme Corp", "Tech Solutions Pvt. Ltd."]
    )
    city: Optional[str] = Field(
        None, 
        max_length=100, 
        description="City name (letters only)",
        examples=["Mumbai", "New Delhi"]
    )
    contact_person: Optional[str] = Field(
        None, 
        max_length=255, 
        description="Contact person name",
        examples=["Jane Smith"]
    )
    phone: Optional[str] = Field(
        None, 
        max_length=20, 
        description="Phone number (digits, spaces, +, -, () allowed)",
        examples=["+91 98765 43210", "022-12345678"]
    )
    email: Optional[EmailStr] = Field(
        None, 
        description="Valid email address",
        examples=["contact@example.com"]
    )
    
    @field_validator('client_name')
    @classmethod
    def validate_client_name(cls, v: str) -> str:
        v = v.strip()
        if not re.match(NAME_PATTERN, v):
            raise ValueError('Client name must contain only letters, spaces, hyphens, and apostrophes')
        return v
    
    @field_validator('company_name')
    @classmethod
    def validate_company_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if v and not re.match(COMPANY_PATTERN, v):
            raise ValueError('Company name contains invalid characters')
        return v if v else None
    
    @field_validator('city')
    @classmethod
    def validate_city(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if v and not re.match(CITY_PATTERN, v):
            raise ValueError('City must contain only letters, spaces, and hyphens')
        return v if v else None
    
    @field_validator('contact_person')
    @classmethod
    def validate_contact_person(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if v and not re.match(NAME_PATTERN, v):
            raise ValueError('Contact person name must contain only letters, spaces, and hyphens')
        return v if v else None
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if v and not re.match(PHONE_PATTERN, v):
            raise ValueError('Invalid phone number format. Use digits, spaces, +, -, or parentheses')
        return v if v else None


class ClientCreate(ClientBase):
    """Schema for creating a new client."""
    pass


class ClientUpdate(BaseModel):
    """Schema for updating an existing client. All fields are optional."""
    
    client_name: Optional[str] = Field(None, min_length=2, max_length=255, description="Name of the client")
    company_name: Optional[str] = Field(None, max_length=255, description="Company name")
    city: Optional[str] = Field(None, max_length=100, description="City")
    contact_person: Optional[str] = Field(None, max_length=255, description="Contact person name")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    email: Optional[EmailStr] = Field(None, description="Email address")
    
    @field_validator('client_name')
    @classmethod
    def validate_client_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not re.match(NAME_PATTERN, v):
            raise ValueError('Client name must contain only letters, spaces, hyphens, and apostrophes')
        return v
    
    @field_validator('company_name')
    @classmethod
    def validate_company_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if v and not re.match(COMPANY_PATTERN, v):
            raise ValueError('Company name contains invalid characters')
        return v if v else None
    
    @field_validator('city')
    @classmethod
    def validate_city(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if v and not re.match(CITY_PATTERN, v):
            raise ValueError('City must contain only letters, spaces, and hyphens')
        return v if v else None
    
    @field_validator('contact_person')
    @classmethod
    def validate_contact_person(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if v and not re.match(NAME_PATTERN, v):
            raise ValueError('Contact person name must contain only letters, spaces, and hyphens')
        return v if v else None
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if v and not re.match(PHONE_PATTERN, v):
            raise ValueError('Invalid phone number format')
        return v if v else None


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
