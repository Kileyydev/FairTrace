import hashlib
import json

def canonical_farmer_string(payload: dict) -> str:
    """
    Returns a JSON string of farmer data with a consistent field order
    for hashing purposes.
    """
    keys = [
        "fullName", "nationalId", "saccoMembership",
        "gpsLat", "gpsLong", "farmAddress", "timestamp"
    ]
    ordered = {k: payload.get(k, "") for k in keys}
    return json.dumps(ordered, separators=(',', ':'), ensure_ascii=False)

def sha256_hex(s: str) -> str:
    """
    Returns SHA256 hash of the input string with '0x' prefix.
    """
    return '0x' + hashlib.sha256(s.encode('utf-8')).hexdigest()
