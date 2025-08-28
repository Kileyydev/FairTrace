from django.core.management.base import BaseCommand
from blockchain.web3utils import contract, w3
from farmers.models import Farmer
import time


class Command(BaseCommand):
    help = 'Listen to FarmerRegistered events and update DB'

    def handle(self, *args, **options):
        if contract is None:
            self.stdout.write(self.style.ERROR('Contract not configured or ABI missing'))
            return

        self.stdout.write('Starting event listener...')
        event_filter = contract.events.FarmerRegistered.createFilter(fromBlock='latest')

        try:
            while True:
                for ev in event_filter.get_new_entries():
                    args = ev['args']
                    rec_hash = args.get('recordHash')
                    # Normalize 0x vs bytes
                    rec_hash_hex = rec_hash if isinstance(rec_hash, str) else w3.toHex(rec_hash)

                    try:
                        f = Farmer.objects.get(record_hash=rec_hash_hex)
                        f.onchain_status = 'confirmed'
                        f.save()
                        self.stdout.write(self.style.SUCCESS(f'Updated farmer {f.id} as confirmed'))
                    except Farmer.DoesNotExist:
                        self.stdout.write(self.style.WARNING(f'No farmer found for hash {rec_hash_hex}'))
                time.sleep(3)
        except KeyboardInterrupt:
            self.stdout.write('Stopped event listener')
