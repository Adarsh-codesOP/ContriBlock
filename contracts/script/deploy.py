#!/usr/bin/env python3

import os
import json
from web3 import Web3
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

# Connect to the blockchain
w3 = Web3(Web3.HTTPProvider(os.getenv("WEB3_RPC_URL")))

# Check connection
if not w3.is_connected():
    print("Failed to connect to Ethereum node")
    exit(1)

# Load account from private key
private_key = os.getenv("ADMIN_PRIVATE_KEY")
if not private_key:
    print("ADMIN_PRIVATE_KEY not set in environment variables")
    exit(1)

account = w3.eth.account.from_key(private_key)
print(f"Deploying from account: {account.address}")

# Helpers
CHAIN_ID = w3.eth.chain_id  # e.g. 31337 on Hardhat

def next_nonce():
    return w3.eth.get_transaction_count(account.address)

def load_contract(contract_name: str):
    possible_paths = [
        Path("../artifacts/src"),
        Path("../artifacts/contracts"),
        Path("./artifacts/src"),
        Path("./artifacts/contracts"),
        Path("/app/artifacts/src"),
        Path("/app/artifacts/contracts"),
    ]
    for artifacts_dir in possible_paths:
        try:
            file_path = artifacts_dir / f"{contract_name}.sol" / f"{contract_name}.json"
            print(f"Trying path: {file_path}")
            with open(file_path) as f:
                contract_json = json.load(f)
            # Hardhat artifact format: "abi" and "bytecode" (hex string)
            abi = contract_json["abi"]
            bytecode = contract_json["bytecode"]
            if not bytecode or bytecode == "0x":
                raise ValueError(f"Empty bytecode for {contract_name}")
            return abi, bytecode
        except FileNotFoundError:
            continue

    print(f"Could not find contract artifacts for {contract_name}")
    print("Available directories:")
    for path in [Path("."), Path("../artifacts"), Path("/app/artifacts")]:
        if path.exists():
            print(f"Contents of {path}:")
            for item in path.glob("**/*"):
                print(f"  {item}")
    raise FileNotFoundError(f"Could not find contract artifacts for {contract_name}")

# Deploy ContriToken
def deploy_token():
    abi, bytecode = load_contract("ContriToken")
    ContriToken = w3.eth.contract(abi=abi, bytecode=bytecode)

    # Estimate gas (constructor needs a from address)
    gas_estimate = ContriToken.constructor(account.address).estimate_gas({"from": account.address})

    tx = ContriToken.constructor(account.address).build_transaction({
        "from": account.address,
        "nonce": next_nonce(),
        "gas": gas_estimate,
        # Using legacy gasPrice is fine on Hardhat; EIP-1559 fields would also work
        "gasPrice": w3.eth.gas_price,
        "chainId": CHAIN_ID,
    })

    signed = w3.eth.account.sign_transaction(tx, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)  # <-- v6 snake_case
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    addr = receipt.contractAddress
    print(f"ContriToken deployed at: {addr}")
    return addr

# Deploy Controller
def deploy_controller(token_address: str):
    abi, bytecode = load_contract("Controller")
    Controller = w3.eth.contract(abi=abi, bytecode=bytecode)

    gas_estimate = Controller.constructor(token_address, account.address).estimate_gas({"from": account.address})

    tx = Controller.constructor(token_address, account.address).build_transaction({
        "from": account.address,
        "nonce": next_nonce(),
        "gas": gas_estimate,
        "gasPrice": w3.eth.gas_price,
        "chainId": CHAIN_ID,
    })

    signed = w3.eth.account.sign_transaction(tx, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)  # <-- v6 snake_case
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    addr = receipt.contractAddress
    print(f"Controller deployed at: {addr}")
    return addr

# Set controller in token contract
def set_controller(token_address: str, controller_address: str):
    abi, _ = load_contract("ContriToken")
    token = w3.eth.contract(address=token_address, abi=abi)

    gas_estimate = token.functions.setController(controller_address).estimate_gas({"from": account.address})

    tx = token.functions.setController(controller_address).build_transaction({
        "from": account.address,
        "nonce": next_nonce(),
        "gas": gas_estimate,
        "gasPrice": w3.eth.gas_price,
        "chainId": CHAIN_ID,
    })

    signed = w3.eth.account.sign_transaction(tx, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"Controller set in token contract: {receipt.status}")

def main():
    print("Deploying ContriBlock contracts...")
    token_address = deploy_token()
    controller_address = deploy_controller(token_address)
    set_controller(token_address, controller_address)

    with open("../deployed_addresses.json", "w") as f:
        json.dump(
            {
                "token_address": token_address,
                "controller_address": controller_address,
            },
            f,
            indent=2,
        )

    print("Deployment complete!")
    print(f"TOKEN_ADDRESS={token_address}")
    print(f"CONTROLLER_ADDRESS={controller_address}")

if __name__ == "__main__":
    main()
