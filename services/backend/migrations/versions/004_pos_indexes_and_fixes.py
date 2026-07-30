"""004_pos_indexes_and_fixes

Revision ID: 004_pos_indexes_and_fixes
Revises: 003_orders_kot_enhancements
Create Date: 2026-07-27 11:39:30.000000

"""
from alembic import op
import sqlalchemy as sqa

# revision identifiers, used by Alembic.
revision = '004_pos_indexes_and_fixes'
down_revision = '003_orders_kot_enhancements'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Make order_items.product_id nullable
    op.alter_column('order_items', 'product_id', existing_type=sqa.BigInteger(), nullable=True)

    # 2. Add foreign key order_items.kot_id -> kots.id
    op.create_foreign_key('fk_order_items_kot_id', 'order_items', 'kots', ['kot_id'], ['id'], ondelete='SET NULL')

    # 3. Create high-performance indexes
    op.create_index('ix_orders_token_number', 'orders', ['token_number'], unique=False)
    op.create_index('ix_orders_is_held', 'orders', ['is_held'], unique=False)
    op.create_index('ix_order_items_menu_item_id', 'order_items', ['menu_item_id'], unique=False)
    op.create_index('ix_order_items_kot_id', 'order_items', ['kot_id'], unique=False)
    op.create_index('ix_kots_status', 'kots', ['status'], unique=False)

def downgrade() -> None:
    op.drop_index('ix_kots_status', table_name='kots')
    op.drop_index('ix_order_items_kot_id', table_name='order_items')
    op.drop_index('ix_order_items_menu_item_id', table_name='order_items')
    op.drop_index('ix_orders_is_held', table_name='orders')
    op.drop_index('ix_orders_token_number', table_name='orders')
    op.drop_constraint('fk_order_items_kot_id', 'order_items', type_='foreignkey')
    op.alter_column('order_items', 'product_id', existing_type=sqa.BigInteger(), nullable=False)
