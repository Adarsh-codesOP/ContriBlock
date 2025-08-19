"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2023-07-01

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum types with IF NOT EXISTS check
    op.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
            CREATE TYPE user_role AS ENUM ('user', 'verifier', 'admin');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
            CREATE TYPE kyc_status AS ENUM ('none', 'pending', 'approved', 'rejected');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contribution_status') THEN
            CREATE TYPE contribution_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
            CREATE TYPE transaction_type AS ENUM ('mint', 'impact', 'purchase', 'other');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
            CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'failed');
        END IF;
    END
    $$;
    """)    
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('wallet', sa.String(), nullable=False),
        sa.Column('role', sa.Enum('user', 'verifier', 'admin', name='user_role'), nullable=False),
        sa.Column('reputation', sa.Integer(), nullable=False),
        sa.Column('kyc_status', sa.Enum('none', 'pending', 'approved', 'rejected', name='kyc_status'), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('wallet')
    )
    
    # Create sectors table
    op.create_table(
        'sectors',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('metadata_schema', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('verification_policy', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    
    # Create contributions table
    op.create_table(
        'contributions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('sector_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('abstract', sa.Text(), nullable=False),
        sa.Column('ipfs_cid', sa.String(), nullable=True),
        sa.Column('url', sa.String(), nullable=True),
        sa.Column('status', sa.Enum('draft', 'submitted', 'under_review', 'approved', 'rejected', name='contribution_status'), nullable=False),
        sa.Column('is_premium', sa.Boolean(), nullable=False),
        sa.Column('token_minted', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['sector_id'], ['sectors.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create contribution_metadata table
    op.create_table(
        'contribution_metadata',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('contribution_id', sa.Integer(), nullable=False),
        sa.Column('data', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.ForeignKeyConstraint(['contribution_id'], ['contributions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create impact_records table
    op.create_table(
        'impact_records',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('contribution_id', sa.Integer(), nullable=False),
        sa.Column('metric_type', sa.String(), nullable=False),
        sa.Column('value', sa.Float(), nullable=False),
        sa.Column('weight', sa.Float(), nullable=False),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['contribution_id'], ['contributions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create token_distributions table
    op.create_table(
        'token_distributions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('contribution_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('tx_hash', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['contribution_id'], ['contributions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create marketplace_items table
    op.create_table(
        'marketplace_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('contribution_id', sa.Integer(), nullable=False),
        sa.Column('price_tokens', sa.Integer(), nullable=False),
        sa.Column('active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['contribution_id'], ['contributions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create purchases table
    op.create_table(
        'purchases',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('buyer_id', sa.Integer(), nullable=False),
        sa.Column('item_id', sa.Integer(), nullable=False),
        sa.Column('tx_hash', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['buyer_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['item_id'], ['marketplace_items.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create onchain_transactions table
    op.create_table(
        'onchain_transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.Enum('mint', 'impact', 'purchase', 'other', name='transaction_type'), nullable=False),
        sa.Column('tx_hash', sa.String(), nullable=False),
        sa.Column('status', sa.Enum('pending', 'confirmed', 'failed', name='transaction_status'), nullable=False),
        sa.Column('payload', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create audit_logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('actor_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('entity', sa.String(), nullable=False),
        sa.Column('entity_id', sa.Integer(), nullable=True),
        sa.Column('meta', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['actor_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    # Drop all tables
    op.drop_table('audit_logs')
    op.drop_table('onchain_transactions')
    op.drop_table('purchases')
    op.drop_table('marketplace_items')
    op.drop_table('token_distributions')
    op.drop_table('impact_records')
    op.drop_table('contribution_metadata')
    op.drop_table('contributions')
    op.drop_table('sectors')
    op.drop_table('users')
    
    # Drop enum types
    op.execute('DROP TYPE transaction_status')
    op.execute('DROP TYPE transaction_type')
    op.execute('DROP TYPE contribution_status')
    op.execute('DROP TYPE kyc_status')
    op.execute('DROP TYPE user_role')