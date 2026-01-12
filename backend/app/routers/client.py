from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse, ClientListResponse

router = APIRouter(
    prefix="/clients",
    tags=["Clients"],
    responses={404: {"description": "Client not found"}}
)


@router.post("/", response_model=ClientResponse, status_code=201, summary="Create a new client")
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    """
    Create a new client with the following information:
    
    - **client_name**: Required. Name of the client.
    - **company_name**: Optional. Name of the company.
    - **city**: Optional. City where the client is located.
    - **contact_person**: Optional. Name of the contact person.
    - **phone**: Optional. Phone number.
    - **email**: Optional. Email address.
    """
    db_client = Client(**client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client


@router.get("/", response_model=ClientListResponse, summary="List all clients")
def list_clients(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    search: str = Query(None, description="Search by client name or company name"),
    db: Session = Depends(get_db)
):
    """
    Retrieve a paginated list of clients.
    
    - **page**: Page number (default: 1)
    - **page_size**: Number of clients per page (default: 10, max: 100)
    - **search**: Optional search term to filter by client name or company name
    """
    query = db.query(Client)
    
    # Apply search filter if provided
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Client.client_name.ilike(search_term)) | 
            (Client.company_name.ilike(search_term))
        )
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    clients = query.order_by(Client.id.desc()).offset(offset).limit(page_size).all()
    
    return ClientListResponse(
        clients=clients,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{client_id}", response_model=ClientResponse, summary="Get a client by ID")
def get_client(client_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific client by their ID.
    
    - **client_id**: The unique identifier of the client
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.put("/{client_id}", response_model=ClientResponse, summary="Update a client")
def update_client(client_id: int, client_update: ClientUpdate, db: Session = Depends(get_db)):
    """
    Update an existing client's information.
    
    - **client_id**: The unique identifier of the client to update
    - Only provided fields will be updated
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Update only provided fields
    update_data = client_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)
    
    db.commit()
    db.refresh(client)
    return client


@router.delete("/{client_id}", status_code=204, summary="Delete a client")
def delete_client(client_id: int, db: Session = Depends(get_db)):
    """
    Delete a client by their ID.
    
    - **client_id**: The unique identifier of the client to delete
    
    **Warning**: This will also delete all associated cases due to CASCADE constraint.
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db.delete(client)
    db.commit()
    return None
