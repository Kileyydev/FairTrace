import json
import os
from web3 import Web3
from eth_account import Account
from django.conf import settings

# ------------------------------
# Connect to Ethereum (Sepolia / Hardhat)
# ------------------------------
w3 = Web3(Web3.HTTPProvider(settings.SEPOLIA_RPC_URL))
if not w3.is_connected():
    raise ConnectionError("Web3 provider not connected. Check SEPOLIA_RPC_URL.")

# ------------------------------
# Load ABI
# ------------------------------
ABI_PATH = os.path.join(
    settings.BASE_DIR,
    "blockchain",
    "artifacts",
    "contracts",
    "FairTraceRegistry.sol",
    "FarmerRegistry.json"
)

CONTRACT_ABI = None

if os.path.exists(ABI_PATH):
    with open(ABI_PATH, "r") as f:
        artifact = json.load(f)
        CONTRACT_ABI = artifact.get("abi")
        if not CONTRACT_ABI or not isinstance(CONTRACT_ABI, list):
            raise ValueError("ABI is missing or not a list in JSON artifact.")
else:
    # fallback: load ABI from Django settings
    if getattr(settings, "CONTRACT_ABI_JSON", None):
        CONTRACT_ABI = json.loads(settings.CONTRACT_ABI_JSON)
        if not isinstance(CONTRACT_ABI, list):
            raise ValueError("ABI from settings.CONTRACT_ABI_JSON is not a list.")
    else:
        raise FileNotFoundError(f"ABI file not found at {ABI_PATH} and CONTRACT_ABI_JSON not set.")

# ------------------------------
# Contract address
# ------------------------------
CONTRACT_ADDRESS = settings.CONTRACT_ADDRESS
contract = w3.eth.contract(
    address=Web3.to_checksum_address(CONTRACT_ADDRESS),
    abi=CONTRACT_ABI
)

# ------------------------------
# Helper functions
# ------------------------------

def uid_to_bytes32(uid_str: str) -> bytes:
    """
    Deterministically map UUID string to bytes32 via keccak
    """
    return Web3.keccak(text=uid_str)

def compute_data_hash(payload_json_str: str) -> bytes:
    """
    Compute keccak hash of any JSON string
    """
    return Web3.keccak(text=payload_json_str)

def send_register_transaction(farmer_uid: str, data_hash_bytes: bytes) -> str:
    """
    Sends a registerFarmer transaction to the contract
    """
    acct = Account.from_key(settings.WEB3_PRIVATE_KEY)
    farmer_id_bytes32 = uid_to_bytes32(farmer_uid)
    nonce = w3.eth.get_transaction_count(acct.address)
    
    txn = contract.functions.registerFarmer(
        farmer_id_bytes32,
        data_hash_bytes
    ).build_transaction({
        "from": acct.address,
        "nonce": nonce,
        "gas": 300_000,
        "gasPrice": w3.eth.gas_price,
    })
    
    signed_txn = acct.sign_transaction(txn)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    return tx_hash.hex()
