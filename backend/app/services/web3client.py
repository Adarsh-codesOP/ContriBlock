from typing import Optional, Dict, Any

import json
from web3 import Web3
from eth_account.messages import encode_defunct
from siwe import SiweMessage

from app.core.config import settings


class Web3Client:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(settings.WEB3_RPC_URL))
        self.chain_id = settings.CHAIN_ID
        self.admin_account = self.w3.eth.account.from_key(settings.ADMIN_PRIVATE_KEY)
        
        # Load contract ABIs
        self.token_address = settings.TOKEN_ADDRESS
        self.controller_address = settings.CONTROLLER_ADDRESS
        self.token_contract = None
        self.controller_contract = None
        
        if self.token_address and self.controller_address:
            self.load_contracts()
    
    def load_contracts(self):
        # Load contract ABIs
        try:
            with open("contracts/artifacts/contracts/ContriToken.sol/ContriToken.json") as f:
                token_json = json.load(f)
                token_abi = token_json["abi"]
            
            with open("contracts/artifacts/contracts/Controller.sol/Controller.json") as f:
                controller_json = json.load(f)
                controller_abi = controller_json["abi"]
            
            # Create contract instances
            self.token_contract = self.w3.eth.contract(address=self.token_address, abi=token_abi)
            self.controller_contract = self.w3.eth.contract(address=self.controller_address, abi=controller_abi)
        except Exception as e:
            print(f"Error loading contracts: {e}")
    
    def verify_siwe_message(self, message: str, signature: str) -> bool:
        """Verify a SIWE message and signature."""
        try:
            siwe_message = SiweMessage(message=message)
            return siwe_message.verify(signature=signature)
        except Exception as e:
            print(f"Error verifying SIWE message: {e}")
            return False
    
    def get_balance(self, address: str) -> int:
        """Get the CTR token balance of an address."""
        if not self.token_contract:
            return 0
        
        try:
            return self.token_contract.functions.balanceOf(address).call()
        except Exception as e:
            print(f"Error getting balance: {e}")
            return 0
    
    def get_transaction_status(self, tx_hash: str) -> Dict[str, Any]:
        """Get the status of a transaction."""
        try:
            tx_receipt = self.w3.eth.get_transaction_receipt(tx_hash)
            return {
                "status": "confirmed" if tx_receipt.status else "failed",
                "block_number": tx_receipt.blockNumber,
                "gas_used": tx_receipt.gasUsed,
            }
        except Exception as e:
            return {"status": "pending", "error": str(e)}
    
    def register_contribution(self, contribution_id: int, author: str, cid: str) -> Optional[str]:
        """Register a contribution on-chain."""
        if not self.controller_contract:
            return None
        
        try:
            # Build transaction
            tx = self.controller_contract.functions.registerContribution(
                contribution_id, author, cid
            ).build_transaction({
                "from": self.admin_account.address,
                "nonce": self.w3.eth.get_transaction_count(self.admin_account.address),
                "gas": 200000,  # Estimate
                "gasPrice": self.w3.eth.gas_price,
            })
            
            # Sign and send transaction
            signed_tx = self.admin_account.sign_transaction(tx)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            return self.w3.to_hex(tx_hash)
        except Exception as e:
            print(f"Error registering contribution: {e}")
            return None
    
    def mint_on_approval(self, contribution_id: int, amount: int) -> Optional[str]:
        """Mint tokens on approval of a contribution."""
        if not self.controller_contract:
            return None
        
        try:
            # Build transaction
            tx = self.controller_contract.functions.mintOnApproval(
                contribution_id, amount
            ).build_transaction({
                "from": self.admin_account.address,
                "nonce": self.w3.eth.get_transaction_count(self.admin_account.address),
                "gas": 200000,  # Estimate
                "gasPrice": self.w3.eth.gas_price,
            })
            
            # Sign and send transaction
            signed_tx = self.admin_account.sign_transaction(tx)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            return self.w3.to_hex(tx_hash)
        except Exception as e:
            print(f"Error minting tokens: {e}")
            return None
    
    def distribute_impact(self, contribution_ids: list, scores: list, pool_amount: int) -> Optional[str]:
        """Distribute impact to contributions."""
        if not self.controller_contract:
            return None
        
        try:
            # Build transaction
            tx = self.controller_contract.functions.distributeImpact(
                contribution_ids, scores, pool_amount
            ).build_transaction({
                "from": self.admin_account.address,
                "nonce": self.w3.eth.get_transaction_count(self.admin_account.address),
                "gas": 500000,  # Estimate
                "gasPrice": self.w3.eth.gas_price,
            })
            
            # Sign and send transaction
            signed_tx = self.admin_account.sign_transaction(tx)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            return self.w3.to_hex(tx_hash)
        except Exception as e:
            print(f"Error distributing impact: {e}")
            return None


# Create a singleton instance
web3_client = Web3Client()