"""002_normalized_menu_schema

Revision ID: 002_normalized_menu_schema
Revises: 001_feature_licensing
Create Date: 2026-07-27 11:08:00.000000

"""
from alembic import op
import sqlalchemy as sqa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_normalized_menu_schema'
down_revision = '001_feature_licensing'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 0. Ensure company_id columns exist on existing menu_categories and menu_items
    op.add_column('menu_categories', sqa.Column('company_id', sqa.BigInteger(), nullable=True))
    op.add_column('menu_items', sqa.Column('company_id', sqa.BigInteger(), nullable=True))

    # 1. Enhance menu_items table with extra fields if not present
    op.add_column('menu_items', sqa.Column('short_description', sqa.String(length=200), nullable=True))
    op.add_column('menu_items', sqa.Column('images', postgresql.JSONB(astext_type=sqa.Text()), nullable=True, server_default='[]'))
    op.add_column('menu_items', sqa.Column('product_id', sqa.BigInteger(), nullable=True))
    op.add_column('menu_items', sqa.Column('kds_station', sqa.String(length=50), nullable=True))
    op.add_column('menu_items', sqa.Column('allergens', postgresql.JSONB(astext_type=sqa.Text()), nullable=True, server_default='[]'))
    op.add_column('menu_items', sqa.Column('nutrition', postgresql.JSONB(astext_type=sqa.Text()), nullable=True, server_default='{}'))
    op.add_column('menu_items', sqa.Column('sort_order', sqa.Integer(), nullable=False, server_default='1'))


    # 2. Create menu_variant_groups table
    op.create_table(
        'menu_variant_groups',
        sqa.Column('id', sqa.BigInteger(), primary_key=True, autoincrement=True),
        sqa.Column('tenant_id', sqa.BigInteger(), nullable=False, index=True),
        sqa.Column('company_id', sqa.BigInteger(), nullable=True, index=True),
        sqa.Column('branch_id', sqa.BigInteger(), nullable=True, index=True),
        sqa.Column('item_id', sqa.BigInteger(), sqa.ForeignKey('menu_items.id', ondelete='CASCADE'), nullable=False, index=True),
        sqa.Column('name', sqa.String(length=100), nullable=False),
        sqa.Column('min_selection', sqa.Integer(), nullable=False, server_default='1'),
        sqa.Column('max_selection', sqa.Integer(), nullable=False, server_default='1'),
        sqa.Column('is_required', sqa.Boolean(), nullable=False, server_default='true'),
        sqa.Column('sort_order', sqa.Integer(), nullable=False, server_default='1'),
        sqa.Column('is_deleted', sqa.Boolean(), nullable=False, server_default='false'),
        sqa.Column('deleted_at', sqa.DateTime(timezone=True), nullable=True),
        sqa.Column('deleted_by', sqa.BigInteger(), nullable=True),
        sqa.Column('created_by', sqa.BigInteger(), nullable=True),
        sqa.Column('updated_by', sqa.BigInteger(), nullable=True),
        sqa.Column('created_at', sqa.DateTime(timezone=True), server_default=sqa.func.now(), nullable=False),
        sqa.Column('updated_at', sqa.DateTime(timezone=True), server_default=sqa.func.now(), onupdate=sqa.func.now(), nullable=False),
    )

    # 3. Create menu_variant_options table
    op.create_table(
        'menu_variant_options',
        sqa.Column('id', sqa.BigInteger(), primary_key=True, autoincrement=True),
        sqa.Column('tenant_id', sqa.BigInteger(), nullable=False, index=True),
        sqa.Column('company_id', sqa.BigInteger(), nullable=True, index=True),
        sqa.Column('branch_id', sqa.BigInteger(), nullable=True, index=True),
        sqa.Column('group_id', sqa.BigInteger(), sqa.ForeignKey('menu_variant_groups.id', ondelete='CASCADE'), nullable=False, index=True),
        sqa.Column('name', sqa.String(length=100), nullable=False),
        sqa.Column('price_adjustment', sqa.Float(), nullable=False, server_default='0.0'),
        sqa.Column('is_default', sqa.Boolean(), nullable=False, server_default='false'),
        sqa.Column('is_available', sqa.Boolean(), nullable=False, server_default='true'),
        sqa.Column('sort_order', sqa.Integer(), nullable=False, server_default='1'),
        sqa.Column('is_deleted', sqa.Boolean(), nullable=False, server_default='false'),
        sqa.Column('deleted_at', sqa.DateTime(timezone=True), nullable=True),
        sqa.Column('deleted_by', sqa.BigInteger(), nullable=True),
        sqa.Column('created_by', sqa.BigInteger(), nullable=True),
        sqa.Column('updated_by', sqa.BigInteger(), nullable=True),
        sqa.Column('created_at', sqa.DateTime(timezone=True), server_default=sqa.func.now(), nullable=False),
        sqa.Column('updated_at', sqa.DateTime(timezone=True), server_default=sqa.func.now(), onupdate=sqa.func.now(), nullable=False),
    )

    # 4. Create menu_addon_groups table
    op.create_table(
        'menu_addon_groups',
        sqa.Column('id', sqa.BigInteger(), primary_key=True, autoincrement=True),
        sqa.Column('tenant_id', sqa.BigInteger(), nullable=False, index=True),
        sqa.Column('company_id', sqa.BigInteger(), nullable=True, index=True),
        sqa.Column('branch_id', sqa.BigInteger(), nullable=True, index=True),
        sqa.Column('item_id', sqa.BigInteger(), sqa.ForeignKey('menu_items.id', ondelete='CASCADE'), nullable=False, index=True),
        sqa.Column('name', sqa.String(length=100), nullable=False),
        sqa.Column('min_selection', sqa.Integer(), nullable=False, server_default='0'),
        sqa.Column('max_selection', sqa.Integer(), nullable=False, server_default='5'),
        sqa.Column('sort_order', sqa.Integer(), nullable=False, server_default='1'),
        sqa.Column('is_deleted', sqa.Boolean(), nullable=False, server_default='false'),
        sqa.Column('deleted_at', sqa.DateTime(timezone=True), nullable=True),
        sqa.Column('deleted_by', sqa.BigInteger(), nullable=True),
        sqa.Column('created_by', sqa.BigInteger(), nullable=True),
        sqa.Column('updated_by', sqa.BigInteger(), nullable=True),
        sqa.Column('created_at', sqa.DateTime(timezone=True), server_default=sqa.func.now(), nullable=False),
        sqa.Column('updated_at', sqa.DateTime(timezone=True), server_default=sqa.func.now(), onupdate=sqa.func.now(), nullable=False),
    )

    # 5. Create menu_addon_options table
    op.create_table(
        'menu_addon_options',
        sqa.Column('id', sqa.BigInteger(), primary_key=True, autoincrement=True),
        sqa.Column('tenant_id', sqa.BigInteger(), nullable=False, index=True),
        sqa.Column('company_id', sqa.BigInteger(), nullable=True, index=True),
        sqa.Column('branch_id', sqa.BigInteger(), nullable=True, index=True),
        sqa.Column('group_id', sqa.BigInteger(), sqa.ForeignKey('menu_addon_groups.id', ondelete='CASCADE'), nullable=False, index=True),
        sqa.Column('name', sqa.String(length=100), nullable=False),
        sqa.Column('price', sqa.Float(), nullable=False, server_default='0.0'),
        sqa.Column('is_available', sqa.Boolean(), nullable=False, server_default='true'),
        sqa.Column('sort_order', sqa.Integer(), nullable=False, server_default='1'),
        sqa.Column('is_deleted', sqa.Boolean(), nullable=False, server_default='false'),
        sqa.Column('deleted_at', sqa.DateTime(timezone=True), nullable=True),
        sqa.Column('deleted_by', sqa.BigInteger(), nullable=True),
        sqa.Column('created_by', sqa.BigInteger(), nullable=True),
        sqa.Column('updated_by', sqa.BigInteger(), nullable=True),
        sqa.Column('created_at', sqa.DateTime(timezone=True), server_default=sqa.func.now(), nullable=False),
        sqa.Column('updated_at', sqa.DateTime(timezone=True), server_default=sqa.func.now(), onupdate=sqa.func.now(), nullable=False),
    )

    # 6. Create menu_tags table
    op.create_table(
        'menu_tags',
        sqa.Column('id', sqa.BigInteger(), primary_key=True, autoincrement=True),
        sqa.Column('tenant_id', sqa.BigInteger(), nullable=False, index=True),
        sqa.Column('company_id', sqa.BigInteger(), nullable=True, index=True),
        sqa.Column('branch_id', sqa.BigInteger(), nullable=True, index=True),
        sqa.Column('name', sqa.String(length=50), nullable=False),
        sqa.Column('color', sqa.String(length=20), nullable=True, server_default='#ef4444'),
        sqa.Column('icon', sqa.String(length=50), nullable=True),
        sqa.Column('is_deleted', sqa.Boolean(), nullable=False, server_default='false'),
        sqa.Column('deleted_at', sqa.DateTime(timezone=True), nullable=True),
        sqa.Column('deleted_by', sqa.BigInteger(), nullable=True),
        sqa.Column('created_by', sqa.BigInteger(), nullable=True),
        sqa.Column('updated_by', sqa.BigInteger(), nullable=True),
        sqa.Column('created_at', sqa.DateTime(timezone=True), server_default=sqa.func.now(), nullable=False),
        sqa.Column('updated_at', sqa.DateTime(timezone=True), server_default=sqa.func.now(), onupdate=sqa.func.now(), nullable=False),
    )

    # 7. Create menu_item_tags junction table
    op.create_table(
        'menu_item_tags',
        sqa.Column('id', sqa.BigInteger(), primary_key=True, autoincrement=True),
        sqa.Column('tenant_id', sqa.BigInteger(), nullable=False, index=True),
        sqa.Column('company_id', sqa.BigInteger(), nullable=True, index=True),
        sqa.Column('branch_id', sqa.BigInteger(), nullable=True, index=True),
        sqa.Column('item_id', sqa.BigInteger(), sqa.ForeignKey('menu_items.id', ondelete='CASCADE'), nullable=False, index=True),
        sqa.Column('tag_id', sqa.BigInteger(), sqa.ForeignKey('menu_tags.id', ondelete='CASCADE'), nullable=False, index=True),
    )

def downgrade() -> None:
    op.drop_table('menu_item_tags')
    op.drop_table('menu_tags')
    op.drop_table('menu_addon_options')
    op.drop_table('menu_addon_groups')
    op.drop_table('menu_variant_options')
    op.drop_table('menu_variant_groups')
    op.drop_column('menu_items', 'sort_order')
    op.drop_column('menu_items', 'nutrition')
    op.drop_column('menu_items', 'allergens')
    op.drop_column('menu_items', 'kds_station')
    op.drop_column('menu_items', 'product_id')
    op.drop_column('menu_items', 'images')
    op.drop_column('menu_items', 'short_description')
