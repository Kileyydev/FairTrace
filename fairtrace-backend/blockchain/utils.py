import json
import os
from web3 import Web3, HTTPProvider

# Connect to persistent Ganache
w3 = Web3(HTTPProvider("http://127.0.0.1:7545"))

if not w3.isConnected():
    raise Exception("❌ Cannot connect to Ganache. Make sure it's running.")

# Path to ABI JSON files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FARMER_ABI_PATH = os.path.join(BASE_DIR, "build/contracts/FarmerRegistry.json")
PRODUCT_ABI_PATH = os.path.join(BASE_DIR, "build/contracts/ProductRegistry.json")

# Load ABIs
with open(FARMER_ABI_PATH) as f:
    farmer_json = json.load(f)
with open(PRODUCT_ABI_PATH) as f:
    product_json = json.load(f)

# Deployed contract addresses (from your deployment)
farmer_registry_address = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318"
product_registry_address = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788"

# Create contract instances
farmer_registry = w3.eth.contract(
    address=farmer_registry_address,
    abi=farmer_json["abi"]
)

product_registry = w3.eth.contract(
    address=product_registry_address,
    abi=product_json["abi"]
)

# Example helper functions
def get_farmer(farmer_id):
    try:
        return farmer_registry.functions.getFarmer(farmer_id).call()
    except Exception as e:
        print("Error fetching farmer:", e)
        return None

def get_product(product_id):
    try:
        return product_registry.functions.getProduct(product_id).call()
    except Exception as e:
        print("Error fetching product:", e)
        return None
