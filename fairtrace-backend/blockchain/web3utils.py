import os
import json
from web3 import Web3
from web3.middleware import geth_poa_middleware
from decouple import config

# Load environment variables
RPC = config('WEB3_RPC', default='http://localhost:8545')
PRIVATE_KEY = config('BACKEND_WALLET_PK', default='')
ACCOUNT = config('BACKEND_WALLET_ADDR', default='')
CONTRACT_ADDR = config('CONTRACT_ADDR', default='')
ABI_PATH = os.path.join(os.path.dirname(__file__), 'contract_abi.json')

# Initialize Web3 connection
w3 = Web3(Web3.HTTPProvider(RPC))

# If using a PoA network like Ganache, BSC, or Polygon, inject middleware
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

# Load contract
if CONTRACT_ADDR and os.path.exists(ABI_PATH):
    with open(ABI_PATH) as f:
        ABI = json.load(f)
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(CONTRACT_ADDR),
        abi=ABI
    )
else:
    contract = None


def send_register_farmer(record_hash_hex: str, sacco_id: str) -> str:
    """
    Sends a transaction to register a farmer on-chain.
    """
    if contract is None:
        raise RuntimeError('Contract not configured or ABI missing')

    # Ensure wallet details are present
    if not ACCOUNT or not PRIVATE_KEY:
        raise RuntimeError('Wallet address or private key not configured')

    # Get nonce for transaction
    nonce = w3.eth.get_transaction_count(ACCOUNT)

    # Build transaction
    tx = contract.functions.registerFarmer(record_hash_hex, sacco_id).build_transaction({
        'from': ACCOUNT,
        'nonce': nonce,
        'gas': 200000,
        'gasPrice': w3.to_wei('5', 'gwei')
    })

    # Sign transaction
    signed = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)

    # Send transaction
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)

    return w3.to_hex(tx_hash)
