import datetime, json, hashlib, qrcode, io, base64
from django.core.files.base import ContentFile
from .models import Product

def generate_pid(product: Product):
    year = datetime.datetime.now().year
    seq = Product.objects.filter(farmer=product.farmer, pid__isnull=False).count() + 1
    pid = f"FT-{year}-{product.farmer.id}-{seq:04d}"
    return pid

def canonical_record_hash(product: Product):
    payload = {
        "pid": product.pid,
        "title": product.title,
        "quantity": str(product.quantity),
        "origin": [str(product.origin_lat), str(product.origin_lng)],
        "approved_at": product.approved_at.isoformat() if product.approved_at else "",
    }
    s = json.dumps(payload, sort_keys=True).encode()
    return "0x" + hashlib.sha256(s).hexdigest()

def create_qr_data_url(pid: str, base_url="http://localhost:3000/record"):
    url = f"{base_url}/{pid}"
    img = qrcode.make(url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode()
    return f"data:image/png;base64,{b64}"
