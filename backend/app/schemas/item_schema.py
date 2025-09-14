from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class ItemSchema(BaseModel):
    user_uuid: str = Field(..., description="Supabase auth UUID of the user")
    name: str = Field(..., description="Name of the item")
    date_bought: date = Field(..., description="Date the item was bought (YYYY-MM-DD)")
    price: float = Field(0.0, description="Price of the item; defaults to 0.0")
    estimated_expiration: Optional[date] = Field(
        None, description="Estimated expiration date, if available"
    )
    storage_location: Optional[str] = Field(None, description="Storage location: 'F', 'R', or 'S'")

