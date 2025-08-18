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

# Load contract ABIs and bytecode
def load_contract(contract_name):
    artifacts_dir = Path("../artifacts/contracts")
    with open(artifacts_dir / f"{contract_name}.sol" / f"{contract_name}.json") as f:
        contract_json = json.load(f)
    return contract_json["abi"], contract_json["bytecode"]

# Deploy ContriToken
def deploy_token():
    abi, bytecode = load_contract("ContriToken")
    ContriToken = w3.eth.contract(abi=abi, bytecode=bytecode)
    
    # Estimate gas
    gas_estimate = ContriToken.constructor(account.address).estimate_gas()
    
    # Build transaction
    transaction = ContriToken.constructor(account.address).build_transaction({
        "from": account.address,
        "nonce": w3.eth.get_transaction_count(account.address),
        "gas": gas_estimate,
        "gasPrice": w3.eth.gas_price,
    })
    
    # Sign and send transaction
    signed_txn = w3.eth.account.sign_transaction(transaction, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    
    # Wait for transaction receipt
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    token_address = tx_receipt.contractAddress
    
    print(f"ContriToken deployed at: {token_address}")
    return token_address

# Deploy Controller
def deploy_controller(token_address):
    abi, bytecode = load_contract("Controller")
    Controller = w3.eth.contract(abi=abi, bytecode=bytecode)
    
    # Estimate gas
    gas_estimate = Controller.constructor(token_address, account.address).estimate_gas()
    
    # Build transaction
    transaction = Controller.constructor(token_address, account.address).build_transaction({
        "from": account.address,
        "nonce": w3.eth.get_transaction_count(account.address),
        "gas": gas_estimate,
        "gasPrice": w3.eth.gas_price,
    })
    
    # Sign and send transaction
    signed_txn = w3.eth.account.sign_transaction(transaction, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    
    # Wait for transaction receipt
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    controller_address = tx_receipt.contractAddress
    
    print(f"Controller deployed at: {controller_address}")
    return controller_address

# Set controller in token contract
def set_controller(token_address, controller_address):
    abi, _ = load_contract("ContriToken")
    token = w3.eth.contract(address=token_address, abi=abi)
    
    # Build transaction
    transaction = token.functions.setController(controller_address).build_transaction({
        "from": account.address,
        "nonce": w3.eth.get_transaction_count(account.address),
        "gas": 100000,  # Estimate
        "gasPrice": w3.eth.gas_price,
    })
    
    # Sign and send transaction
    signed_txn = w3.eth.account.sign_transaction(transaction, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    
    # Wait for transaction receipt
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"Controller set in token contract: {tx_receipt.status}")

# Main deployment function
def main():
    print("Deploying ContriBlock contracts...")
    
    # Deploy token
    token_address = deploy_token()
    
    # Deploy controller
    controller_address = deploy_controller(token_address)
    
    # Set controller in token
    set_controller(token_address, controller_address)
    
    # Save addresses to file
    with open("../deployed_addresses.json", "w") as f:
        json.dump({
            "token_address": token_address,
            "controller_address": controller_address,
        }, f, indent=2)
    
    print("Deployment complete!")
    print(f"TOKEN_ADDRESS={token_address}")
    print(f"CONTROLLER_ADDRESS={controller_address}")

if __name__ == "__main__":
    main()