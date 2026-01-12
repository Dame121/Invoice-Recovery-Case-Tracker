from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.database import get_db
from app.models.case import Case
from app.models.client import Client
from app.schemas.case import (
    CaseCreate, CaseUpdate, CaseStatusUpdate,
    CaseResponse, CaseListResponse, CaseStatus
)

router = APIRouter(
    prefix="/cases",
    tags=["Cases"],
    responses={404: {"description": "Case not found"}}
)


@router.post("/", response_model=CaseResponse, status_code=201, summary="Create a new case")
def create_case(case: CaseCreate, db: Session = Depends(get_db)):
    """
    Create a new invoice recovery case linked to an existing client.
    
    - **client_id**: Required. Must reference an existing client.
    - **invoice_number**: Required. Invoice number.
    - **invoice_amount**: Required. Amount of the invoice.
    - **invoice_date**: Required. Date of the invoice.
    - **due_date**: Required. Due date for payment.
    - **status**: Optional. Default is "New".
    - **last_follow_up_notes**: Optional. Notes from last follow-up.
    """
    # Verify client exists
    client = db.query(Client).filter(Client.id == case.client_id).first()
    if not client:
        raise HTTPException(status_code=400, detail="Client not found. Please select a valid client.")
    
    db_case = Case(**case.model_dump())
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    
    # Load the client relationship
    db.refresh(db_case, ["client"])
    return db_case


@router.get("/", response_model=CaseListResponse, summary="List all cases")
def list_cases(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    status: Optional[CaseStatus] = Query(None, description="Filter by status"),
    client_id: Optional[int] = Query(None, description="Filter by client ID"),
    sort_by: str = Query("due_date", description="Sort by field (due_date, invoice_amount, created_at)"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    search: Optional[str] = Query(None, description="Search by invoice number"),
    db: Session = Depends(get_db)
):
    """
    Retrieve a paginated list of cases with filtering and sorting.
    
    - **page**: Page number (default: 1)
    - **page_size**: Number of cases per page (default: 10, max: 100)
    - **status**: Filter by case status
    - **client_id**: Filter by client ID
    - **sort_by**: Sort field (due_date, invoice_amount, created_at)
    - **sort_order**: Sort order (asc or desc)
    - **search**: Search by invoice number
    """
    query = db.query(Case).options(joinedload(Case.client))
    
    # Apply filters
    if status:
        query = query.filter(Case.status == status.value)
    
    if client_id:
        query = query.filter(Case.client_id == client_id)
    
    if search:
        query = query.filter(Case.invoice_number.ilike(f"%{search}%"))
    
    # Get total count before pagination
    total = query.count()
    
    # Apply sorting
    sort_column = getattr(Case, sort_by, Case.due_date)
    if sort_order.lower() == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
    
    # Apply pagination
    offset = (page - 1) * page_size
    cases = query.offset(offset).limit(page_size).all()
    
    return CaseListResponse(
        cases=cases,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{case_id}", response_model=CaseResponse, summary="Get a case by ID")
def get_case(case_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific case by its ID including all details.
    
    - **case_id**: The unique identifier of the case
    """
    case = db.query(Case).options(joinedload(Case.client)).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.put("/{case_id}", response_model=CaseResponse, summary="Update a case")
def update_case(case_id: int, case_update: CaseUpdate, db: Session = Depends(get_db)):
    """
    Update an existing case's information.
    
    - **case_id**: The unique identifier of the case to update
    - Only provided fields will be updated
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Update only provided fields
    update_data = case_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(case, field, value)
    
    db.commit()
    db.refresh(case, ["client"])
    return case


@router.patch("/{case_id}/status", response_model=CaseResponse, summary="Update case status and notes")
def update_case_status(case_id: int, status_update: CaseStatusUpdate, db: Session = Depends(get_db)):
    """
    Update only the status and/or last follow-up notes of a case.
    
    - **case_id**: The unique identifier of the case
    - **status**: New status value
    - **last_follow_up_notes**: Updated follow-up notes
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    update_data = status_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(case, field, value)
    
    db.commit()
    db.refresh(case, ["client"])
    return case


@router.delete("/{case_id}", status_code=204, summary="Delete a case")
def delete_case(case_id: int, db: Session = Depends(get_db)):
    """
    Delete a case by its ID.
    
    - **case_id**: The unique identifier of the case to delete
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    db.delete(case)
    db.commit()
    return None


@router.get("/stats/summary", summary="Get case statistics")
def get_case_stats(db: Session = Depends(get_db)):
    """
    Get summary statistics for all cases.
    """
    from sqlalchemy import func
    
    total_cases = db.query(Case).count()
    
    status_counts = db.query(
        Case.status, func.count(Case.id)
    ).group_by(Case.status).all()
    
    total_amount = db.query(func.sum(Case.invoice_amount)).scalar() or 0
    
    return {
        "total_cases": total_cases,
        "total_amount": float(total_amount),
        "by_status": {status: count for status, count in status_counts}
    }
