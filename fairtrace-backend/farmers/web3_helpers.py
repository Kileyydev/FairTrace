import json
import os
from web3 import Web3
from eth_account import Account
from django.conf import settings
from functools import lru_cache


# ------------------------------
# Lazy Web3 connection
# ------------------------------
@lru_cache
def get_w3():
    w3 = Web3(Web3.HTTPProvider(settings.SEPOLIA_RPC_URL))
    if not w3.is_connected():
        raise ConnectionError("Web3 provider not connected. Check SEPOLIA_RPC_URL.")
    return w3


# ------------------------------
# Load ABI (cached)
# ------------------------------
@lru_cache
def get_contract_abi():
    abi_path = os.path.join(
        settings.BASE_DIR,
        "blockchain",
        "artifacts",
        "contracts",
        "FairTraceRegistry.sol",
        "FarmerRegistry.json"
    )

    if os.path.exists(abi_path):
        with open(abi_path, "r") as f:
            artifact = json.load(f)
            contract_abi = artifact.get("abi")
            if not contract_abi or not isinstance(contract_abi, list):
                raise ValueError("ABI is missing or not a list in JSON artifact.")
            return contract_abi

    if getattr(settings, "CONTRACT_ABI_JSON", None):
        contract_abi = json.loads(settings.CONTRACT_ABI_JSON)
        if not isinstance(contract_abi, list):
            raise ValueError("ABI from settings.CONTRACT_ABI_JSON is not a list.")
        return contract_abi

    raise FileNotFoundError(
        f"ABI file not found at {abi_path} and CONTRACT_ABI_JSON not set."
    )


# ------------------------------
# Lazy contract getter
# ------------------------------
@lru_cache
def get_contract():
    w3 = get_w3()
    contract_address = settings.CONTRACT_ADDRESS
    return w3.eth.contract(
        address=Web3.to_checksum_address(contract_address),
        abi=get_contract_abi()
    )


# ------------------------------
# Helper functions
# ------------------------------
def uid_to_bytes32(uid_str: str) -> bytes:
    return Web3.keccak(text=uid_str)


def compute_data_hash(payload_json_str: str) -> bytes:
    return Web3.keccak(text=payload_json_str)


def send_register_transaction(farmer_uid: str, data_hash_bytes: bytes) -> str:
    w3 = get_w3()
    contract = get_contract()

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
