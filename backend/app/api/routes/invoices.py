from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.invoice import Invoice
from app.models.user import User
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceResponse
from app.api.deps import get_db, get_current_user, get_current_active_admin

router = APIRouter()

@router.post("/", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
def create_invoice(
    *,
    db: Session = Depends(get_db),
    invoice_in: InvoiceCreate,
    current_user: User = Depends(get_current_active_admin)
):
    """Create a new invoice (Admin only)."""
    invoice = Invoice(**invoice_in.model_dump())
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice

@router.get("/", response_model=List[InvoiceResponse])
def read_invoices(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    invoice_status: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Retrieve invoices. (Admin and Staff). Optionally filter by patient or status."""
    query = db.query(Invoice)
    if patient_id:
        query = query.filter(Invoice.patient_id == patient_id)
    if invoice_status:
        query = query.filter(Invoice.status == invoice_status)
        
    invoices = query.offset(skip).limit(limit).all()
    return invoices

@router.get("/{invoice_id}", response_model=InvoiceResponse)
def read_invoice(
    *,
    db: Session = Depends(get_db),
    invoice_id: int,
    current_user: User = Depends(get_current_user)
):
    """Get invoice by ID (Admin and Staff)."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@router.put("/{invoice_id}", response_model=InvoiceResponse)
def update_invoice(
    *,
    db: Session = Depends(get_db),
    invoice_id: int,
    invoice_in: InvoiceUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update an invoice (Admin and Staff). Allows Staff to mark Due as Paid."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    update_data = invoice_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(invoice, field, value)
        
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice

@router.delete("/{invoice_id}")
def delete_invoice(
    *,
    db: Session = Depends(get_db),
    invoice_id: int,
    current_user: User = Depends(get_current_active_admin)
):
    """Delete an invoice (Admin only)."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    db.delete(invoice)
    db.commit()
    return {"ok": True}
