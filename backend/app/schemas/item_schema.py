from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class ItemSchema(BaseModel):
    user_uuid: str = Field(..., description="Supabase auth UUID of the user")
    name: str = Field(..., description="Name of the item")
    shelf_life_days: Optional[int] = Field(
        None, description="Shelf life in days; null for non-perishable items"
    )
    date_bought: date = Field(..., description="Date the item was bought (YYYY-MM-DD)")
    price: float = Field(0.0, description="Price of the item; defaults to 0.0")

    class Config:
        orm_mode = True  # Allows returning SQLAlchemy or Supabase rows directly
