from celery import shared_task
from .web3utils import send_register_farmer
from farmers.models import Farmer


@shared_task(bind=True, max_retries=3)
def register_farmer_onchain(self, farmer_id: str, record_hash: str, sacco_id: str):
    try:
        farmer = Farmer.objects.get(id=farmer_id)
        tx_hash = send_register_farmer(record_hash, sacco_id)
        farmer.tx_hash = tx_hash
        farmer.onchain_status = 'pending'
        farmer.save()
        return tx_hash
    except Exception as e:
        # Optionally reschedule
        raise self.retry(exc=e, countdown=10)
