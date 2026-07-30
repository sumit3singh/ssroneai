"""003_orders_kot_enhancements

Revision ID: 003_orders_kot_enhancements
Revises: 002_normalized_menu_schema
Create Date: 2026-07-27 11:22:00.000000

"""
from alembic import op
import sqlalchemy as sqa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003_orders_kot_enhancements'
down_revision = '002_normalized_menu_schema'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Enhance orders table
    op.add_column('orders', sqa.Column('token_number', sqa.String(length=20), nullable=True))
    op.add_column('orders', sqa.Column('guest_count', sqa.Integer(), nullable=False, server_default='1'))
    op.add_column('orders', sqa.Column('held_at', sqa.DateTime(timezone=True), nullable=True))
    op.add_column('orders', sqa.Column('kot_sent_at', sqa.DateTime(timezone=True), nullable=True))
    op.add_column('orders', sqa.Column('ready_at', sqa.DateTime(timezone=True), nullable=True))
    op.add_column('orders', sqa.Column('served_at', sqa.DateTime(timezone=True), nullable=True))
    op.add_column('orders', sqa.Column('is_held', sqa.Boolean(), nullable=False, server_default='false'))
    op.add_column('orders', sqa.Column('parent_order_id', sqa.BigInteger(), sqa.ForeignKey('orders.id', ondelete='SET NULL'), nullable=True))

    # 2. Enhance order_items table
    op.add_column('order_items', sqa.Column('menu_item_id', sqa.BigInteger(), sqa.ForeignKey('menu_items.id', ondelete='SET NULL'), nullable=True))
    op.add_column('order_items', sqa.Column('selected_variants', postgresql.JSONB(astext_type=sqa.Text()), nullable=True, server_default='[]'))
    op.add_column('order_items', sqa.Column('selected_addons', postgresql.JSONB(astext_type=sqa.Text()), nullable=True, server_default='[]'))
    op.add_column('order_items', sqa.Column('kot_id', sqa.BigInteger(), nullable=True))
    op.add_column('order_items', sqa.Column('void_reason', sqa.Text(), nullable=True))
    op.add_column('order_items', sqa.Column('voided_at', sqa.DateTime(timezone=True), nullable=True))
    op.add_column('order_items', sqa.Column('voided_by', sqa.BigInteger(), nullable=True))

    # 3. Create dining_tables
    op.create_table(
        'dining_tables',
        sqa.Column('id', sqa.BigInteger(), primary_key=True, autoincrement=True),
        sqa.Column('tenant_id', sqa.BigInteger(), nullable=False, index=True),
        sqa.Column('company_id', sqa.BigInteger(), nullable=True, index=True),
        sqa.Column('branch_id', sqa.BigInteger(), nullable=False, index=True),
        sqa.Column('table_number', sqa.String(length=20), nullable=False),
        sqa.Column('name', sqa.String(length=100), nullable=True),
        sqa.Column('capacity', sqa.Integer(), nullable=False, server_default='4'),
        sqa.Column('status', sqa.String(length=20), nullable=False, server_default='free'),
        sqa.Column('floor', sqa.String(length=50), nullable=True),
        sqa.Column('sort_order', sqa.Integer(), nullable=False, server_default='0'),
        sqa.Column('is_active', sqa.Boolean(), nullable=False, server_default='true'),
        sqa.Column('created_by', sqa.BigInteger(), nullable=True),
        sqa.Column('updated_by', sqa.BigInteger(), nullable=True),
        sqa.Column('created_at', sqa.DateTime(timezone=True), server_default=sqa.func.now(), nullable=False),
        sqa.Column('updated_at', sqa.DateTime(timezone=True), server_default=sqa.func.now(), onupdate=sqa.func.now(), nullable=False),
        sqa.Column('is_deleted', sqa.Boolean(), nullable=False, server_default='false'),
        sqa.Column('deleted_at', sqa.DateTime(timezone=True), nullable=True),
        sqa.Column('deleted_by', sqa.BigInteger(), nullable=True),
        sqa.UniqueConstraint('tenant_id', 'branch_id', 'table_number', name='uq_dining_table')
    )

    # 4. Create kitchen_stations
    op.create_table(
        'kitchen_stations',
        sqa.Column('id', sqa.BigInteger(), primary_key=True, autoincrement=True),
        sqa.Column('tenant_id', sqa.BigInteger(), nullable=False, index=True),
        sqa.Column('company_id', sqa.BigInteger(), nullable=True, index=True),
        sqa.Column('branch_id', sqa.BigInteger(), nullable=False, index=True),
        sqa.Column('name', sqa.String(length=100), nullable=False),
        sqa.Column('code', sqa.String(length=30), nullable=False),
        sqa.Column('printer_name', sqa.String(length=100), nullable=True),
        sqa.Column('is_active', sqa.Boolean(), nullable=False, server_default='true'),
        sqa.Column('sort_order', sqa.Integer(), nullable=False, server_default='0'),
        sqa.Column('created_by', sqa.BigInteger(), nullable=True),
        sqa.Column('updated_by', sqa.BigInteger(), nullable=True),
        sqa.Column('created_at', sqa.DateTime(timezone=True), server_default=sqa.func.now(), nullable=False),
        sqa.Column('updated_at', sqa.DateTime(timezone=True), server_default=sqa.func.now(), onupdate=sqa.func.now(), nullable=False),
        sqa.Column('is_deleted', sqa.Boolean(), nullable=False, server_default='false'),
        sqa.Column('deleted_at', sqa.DateTime(timezone=True), nullable=True),
        sqa.Column('deleted_by', sqa.BigInteger(), nullable=True),
    )

    # 5. Create kots
    op.create_table(
        'kots',
        sqa.Column('id', sqa.BigInteger(), primary_key=True, autoincrement=True),
        sqa.Column('tenant_id', sqa.BigInteger(), nullable=False, index=True),
        sqa.Column('company_id', sqa.BigInteger(), nullable=True, index=True),
        sqa.Column('branch_id', sqa.BigInteger(), nullable=False, index=True),
        sqa.Column('order_id', sqa.BigInteger(), sqa.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False, index=True),
        sqa.Column('kot_number', sqa.String(length=30), nullable=False),
        sqa.Column('station_id', sqa.BigInteger(), sqa.ForeignKey('kitchen_stations.id', ondelete='SET NULL'), nullable=True, index=True),
        sqa.Column('status', sqa.String(length=20), nullable=False, server_default='pending'),
        sqa.Column('printed_at', sqa.DateTime(timezone=True), nullable=True),
        sqa.Column('created_by', sqa.BigInteger(), nullable=True),
        sqa.Column('updated_by', sqa.BigInteger(), nullable=True),
        sqa.Column('created_at', sqa.DateTime(timezone=True), server_default=sqa.func.now(), nullable=False),
        sqa.Column('updated_at', sqa.DateTime(timezone=True), server_default=sqa.func.now(), onupdate=sqa.func.now(), nullable=False),
        sqa.Column('is_deleted', sqa.Boolean(), nullable=False, server_default='false'),
        sqa.Column('deleted_at', sqa.DateTime(timezone=True), nullable=True),
        sqa.Column('deleted_by', sqa.BigInteger(), nullable=True),
    )

    # 6. Create kot_items
    op.create_table(
        'kot_items',
        sqa.Column('id', sqa.BigInteger(), primary_key=True, autoincrement=True),
        sqa.Column('tenant_id', sqa.BigInteger(), nullable=False, index=True),
        sqa.Column('company_id', sqa.BigInteger(), nullable=True, index=True),
        sqa.Column('branch_id', sqa.BigInteger(), nullable=True, index=True),
        sqa.Column('kot_id', sqa.BigInteger(), sqa.ForeignKey('kots.id', ondelete='CASCADE'), nullable=False, index=True),
        sqa.Column('order_item_id', sqa.BigInteger(), sqa.ForeignKey('order_items.id', ondelete='CASCADE'), nullable=False, index=True),
        sqa.Column('quantity', sqa.Numeric(precision=10, scale=3), nullable=False),
        sqa.Column('status', sqa.String(length=20), nullable=False, server_default='pending'),
        sqa.Column('notes', sqa.Text(), nullable=True),
        sqa.Column('created_at', sqa.DateTime(timezone=True), server_default=sqa.func.now(), nullable=False),
        sqa.Column('updated_at', sqa.DateTime(timezone=True), server_default=sqa.func.now(), onupdate=sqa.func.now(), nullable=False),
        sqa.Column('is_deleted', sqa.Boolean(), nullable=False, server_default='false'),
    )

    # 7. Create order_status_logs
    op.create_table(
        'order_status_logs',
        sqa.Column('id', sqa.BigInteger(), primary_key=True, autoincrement=True),
        sqa.Column('tenant_id', sqa.BigInteger(), nullable=False, index=True),
        sqa.Column('order_id', sqa.BigInteger(), sqa.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False, index=True),
        sqa.Column('old_status', sqa.String(length=30), nullable=True),
        sqa.Column('new_status', sqa.String(length=30), nullable=False),
        sqa.Column('changed_by', sqa.BigInteger(), nullable=True),
        sqa.Column('notes', sqa.Text(), nullable=True),
        sqa.Column('created_at', sqa.DateTime(timezone=True), server_default=sqa.func.now(), nullable=False),
    )

def downgrade() -> None:
    op.drop_table('order_status_logs')
    op.drop_table('kot_items')
    op.drop_table('kots')
    op.drop_table('kitchen_stations')
    op.drop_table('dining_tables')
    op.drop_column('order_items', 'voided_by')
    op.drop_column('order_items', 'voided_at')
    op.drop_column('order_items', 'void_reason')
    op.drop_column('order_items', 'kot_id')
    op.drop_column('order_items', 'selected_addons')
    op.drop_column('order_items', 'selected_variants')
    op.drop_column('order_items', 'menu_item_id')
    op.drop_column('orders', 'parent_order_id')
    op.drop_column('orders', 'is_held')
    op.drop_column('orders', 'served_at')
    op.drop_column('orders', 'ready_at')
    op.drop_column('orders', 'kot_sent_at')
    op.drop_column('orders', 'held_at')
    op.drop_column('orders', 'guest_count')
    op.drop_column('orders', 'token_number')
