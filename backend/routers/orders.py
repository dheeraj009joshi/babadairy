from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
import models, schemas
from services.notification import send_email_notification, send_whatsapp_notification
from uuid import uuid4
import datetime

router = APIRouter(
    prefix="/orders",
    tags=["orders"],
    responses={404: {"description": "Not found"}},
)

async def update_product_stock(items: list, decrease: bool = True):
    """
    Update product stock based on order items.
    decrease=True: Decrease stock (when order is placed)
    decrease=False: Increase stock (when order is cancelled)
    """
    for item in items:
        product_id = item.get("productId") or item.get("product_id")
        quantity = item.get("quantity", 1)
        
        if product_id:
            product = await models.Product.find_one(models.Product.id == product_id)
            if product:
                if decrease:
                    # Decrease stock
                    new_stock = max(0, product.stock - quantity)
                else:
                    # Increase stock (restore on cancellation)
                    new_stock = product.stock + quantity
                
                product.stock = new_stock
                await product.save()
                print(f"Stock updated for {product.name}: {product.stock + quantity if decrease else product.stock - quantity} -> {new_stock}")

@router.get("/", response_model=List[schemas.Order])
async def read_orders(skip: int = 0, limit: int = 100, user_id: str = None):
    query = models.Order.find_all()
    if user_id:
        query = models.Order.find(models.Order.user_id == user_id)
    
    orders = await query.sort("-created_at").skip(skip).limit(limit).to_list()
    return orders

@router.get("/{order_id}", response_model=schemas.Order)
async def read_order(order_id: str):
    order = await models.Order.find_one(models.Order.id == order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/", response_model=schemas.Order)
async def create_order(order: schemas.OrderCreate, background_tasks: BackgroundTasks):
    if not order.id:
        order.id = str(uuid4())
    
    new_order = models.Order(**order.dict())
    await new_order.insert()

    # Update stock - decrease for new orders
    if order.items:
        await update_product_stock(order.items, decrease=True)

    # Send Notifications
    user_email = order.customer.get("email")
    if user_email:
        background_tasks.add_task(
            send_email_notification, 
            to_email=user_email, 
            subject=f"Order Confirmation #{new_order.order_number}", 
            body=f"Thank you for your order! Your Order ID is {new_order.order_number}."
        )
    
    user_phone = order.customer.get("phone")
    if user_phone:
        background_tasks.add_task(
            send_whatsapp_notification,
            to_phone=user_phone,
            message=f"Order #{new_order.order_number} confirmed! Total: ₹{new_order.total}"
        )

    return new_order

@router.put("/{order_id}", response_model=schemas.Order)
async def update_order(order_id: str, order: schemas.OrderUpdate):
    db_order = await models.Order.find_one(models.Order.id == order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    update_data = order.dict(exclude_unset=True)
    old_status = db_order.status
    
    # Handle status history update
    if "status" in update_data and update_data["status"] != db_order.status:
        history = list(db_order.status_history)
        history.append({
            "status": update_data["status"],
            "timestamp": datetime.datetime.now().isoformat()
        })
        db_order.status_history = history
        
        # Handle stock restoration on cancellation
        new_status = update_data["status"]
        
        # If order is being cancelled (and wasn't cancelled before)
        if new_status == "cancelled" and old_status != "cancelled":
            # Restore stock
            if db_order.items:
                items_list = [item.dict() if hasattr(item, 'dict') else item for item in db_order.items]
                await update_product_stock(items_list, decrease=False)
                print(f"Stock restored for cancelled order {order_id}")
        
        # If order is being un-cancelled (rare case, but handle it)
        elif old_status == "cancelled" and new_status != "cancelled":
            # Decrease stock again
            if db_order.items:
                items_list = [item.dict() if hasattr(item, 'dict') else item for item in db_order.items]
                await update_product_stock(items_list, decrease=True)
                print(f"Stock decreased for reactivated order {order_id}")

    for key, value in update_data.items():
        setattr(db_order, key, value)
    
    await db_order.save()
    return db_order

@router.delete("/{order_id}")
async def delete_order(order_id: str):
    db_order = await models.Order.find_one(models.Order.id == order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Restore stock if order wasn't already cancelled
    if db_order.status != "cancelled" and db_order.items:
        items_list = [item.dict() if hasattr(item, 'dict') else item for item in db_order.items]
        await update_product_stock(items_list, decrease=False)
        print(f"Stock restored for deleted order {order_id}")
    
    await db_order.delete()
    return {"message": "Order deleted successfully"}
