# blockchain/tasks.py
from web3 import Web3
from pathlib import Path
import json

w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))  # Hardhat local node

# Load ABI
abi_path = Path(__file__).parent / "FarmerContract.json"
with open(abi_path) as f:
    contract_abi = json.load(f)["abi"]

contract_address = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
contract = w3.eth.contract(address=contract_address, abi=contract_abi)

def register_farmer_onchain(name, idHash, location):
    account = w3.eth.accounts[0]  # Hardhat default account
    tx = contract.functions.registerFarmer(name, idHash, location).transact({"from": account})
    receipt = w3.eth.wait_for_transaction_receipt(tx)
    return receipt.transactionHash.hex()
