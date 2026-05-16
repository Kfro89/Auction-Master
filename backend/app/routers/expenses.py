from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from ..database import get_db
from .. import models
from ..auth import get_current_user

router = APIRouter()

class ExpenseBase(BaseModel):
    date: datetime = datetime.utcnow()
    amount: float
    payee: str
    category: str
    description: Optional[str] = None
    receipt_url: Optional[str] = None
    is_recurring: bool = False
    recurring_frequency: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ExpenseResponse])
def list_expenses(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    return db.query(models.BusinessExpense).order_by(models.BusinessExpense.date.desc()).all()

@router.post("/", response_model=ExpenseResponse)
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_expense = models.BusinessExpense(**expense.model_dump())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.delete("/{id}")
def delete_expense(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_expense = db.query(models.BusinessExpense).filter(models.BusinessExpense.id == id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    db.delete(db_expense)
    db.commit()
    return {"status": "success"}

@router.get("/stats")
def get_expense_stats(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    expenses = db.query(models.BusinessExpense).all()
    total = sum(e.amount for e in expenses)
    
    by_category = {}
    for e in expenses:
        by_category[e.category] = by_category.get(e.category, 0.0) + e.amount
        
    return {
        "totalExpenses": total,
        "byCategory": by_category,
        "count": len(expenses)
    }
