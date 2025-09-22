# products/blockchain_service.py
import uuid
import qrcode
from io import BytesIO
from django.core.files.base import ContentFile

def store_product_on_chain(product):
    # Simulate creating a blockchain transaction
    blockchain_pid = str(uuid.uuid4())  # replace with actual blockchain PID

    # Generate QR Code for blockchain PID
    qr = qrcode.make(blockchain_pid)
    buffer = BytesIO()
    qr.save(buffer, format="PNG")
    qr_code_file = ContentFile(buffer.getvalue(), name=f"{product.uid}_qrcode.png")

    # Save to product
    product.blockchain_pid = blockchain_pid
    product.qr_code.save(f"{product.uid}_qrcode.png", qr_code_file)
    product.save()

    return blockchain_pid
