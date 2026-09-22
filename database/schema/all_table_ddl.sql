-- public.approval_requests definition

-- Drop table

-- DROP TABLE public.approval_requests;

CREATE TABLE public.approval_requests (
	entity_type varchar(100) NOT NULL,
	entity_id varchar(100) NOT NULL,
	amount numeric(15, 2) NOT NULL,
	required_role varchar(50) NOT NULL,
	status varchar(50) NOT NULL,
	requested_by int8 NULL,
	approved_by int8 NULL,
	reason text NULL,
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	is_deleted bool NOT NULL,
	CONSTRAINT approval_requests_pkey PRIMARY KEY (id)
);
CREATE INDEX ix_approval_requests_id ON public.approval_requests USING btree (id);
CREATE INDEX ix_approval_requests_tenant_id ON public.approval_requests USING btree (tenant_id);


-- public.audit_logs_partitioned definition

-- Drop table

-- DROP TABLE public.audit_logs_partitioned;

CREATE TABLE public.audit_logs_partitioned (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	user_id int8 NULL,
	"action" varchar(100) NOT NULL,
	resource_type varchar(100) NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT audit_logs_partitioned_pkey PRIMARY KEY (id, created_at)
)
PARTITION BY RANGE (created_at);


-- public.daily_order_sequences definition

-- Drop table

-- DROP TABLE public.daily_order_sequences;

CREATE TABLE public.daily_order_sequences (
	branch_id int8 NOT NULL,
	sequence_date varchar(10) NOT NULL,
	last_seq int4 NOT NULL,
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	is_deleted bool NOT NULL,
	CONSTRAINT daily_order_sequences_pkey PRIMARY KEY (id),
	CONSTRAINT uq_tenant_branch_date_seq UNIQUE (tenant_id, branch_id, sequence_date)
);
CREATE INDEX idx_daily_order_sequences_tenant ON public.daily_order_sequences USING btree (tenant_id, branch_id, sequence_date);
CREATE INDEX ix_daily_order_sequences_branch_id ON public.daily_order_sequences USING btree (branch_id);
CREATE INDEX ix_daily_order_sequences_id ON public.daily_order_sequences USING btree (id);
CREATE INDEX ix_daily_order_sequences_tenant_id ON public.daily_order_sequences USING btree (tenant_id);


-- public.feature_master definition

-- Drop table

-- DROP TABLE public.feature_master;

CREATE TABLE public.feature_master (
	id bigserial NOT NULL,
	code varchar(100) NOT NULL,
	"name" varchar(200) NOT NULL,
	description text NULL,
	category varchar(100) NOT NULL,
	dependencies jsonb DEFAULT '[]'::jsonb NULL,
	is_core bool DEFAULT false NOT NULL,
	is_active bool DEFAULT true NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	is_deleted bool DEFAULT false NULL,
	tenant_id int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT feature_master_code_key UNIQUE (code),
	CONSTRAINT feature_master_pkey PRIMARY KEY (id)
);


-- public.financial_years definition

-- Drop table

-- DROP TABLE public.financial_years;

CREATE TABLE public.financial_years (
	"name" varchar(100) NOT NULL,
	code varchar(50) NOT NULL,
	is_active bool NOT NULL,
	is_deleted bool NOT NULL,
	start_date date NULL,
	end_date date NULL,
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	created_by int8 NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT financial_years_pkey PRIMARY KEY (id),
	CONSTRAINT uq_tenant_financial_year_code UNIQUE (tenant_id, code)
);
CREATE INDEX ix_financial_years_id ON public.financial_years USING btree (id);
CREATE INDEX ix_financial_years_tenant_id ON public.financial_years USING btree (tenant_id);


-- public.form_master definition

-- Drop table

-- DROP TABLE public.form_master;

CREATE TABLE public.form_master (
	id bigserial NOT NULL,
	form_key varchar(100) NOT NULL,
	title varchar(200) NOT NULL,
	description varchar(500) NULL,
	business_type_id varchar(50) NULL,
	submit_label varchar(50) DEFAULT 'Save'::character varying NOT NULL,
	is_active bool DEFAULT true NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	is_deleted bool DEFAULT false NULL,
	tenant_id int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT form_master_form_key_key UNIQUE (form_key),
	CONSTRAINT form_master_pkey PRIMARY KEY (id)
);


-- public.hotel_guests definition

-- Drop table

-- DROP TABLE public.hotel_guests;

CREATE TABLE public.hotel_guests (
	branch_id int8 NOT NULL,
	first_name varchar(80) NOT NULL,
	last_name varchar(80) NOT NULL,
	email varchar(120) NULL,
	phone varchar(30) NULL,
	id_type varchar(50) NULL,
	id_number varchar(100) NULL,
	notes text NULL,
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	created_by int8 NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	is_deleted bool NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	CONSTRAINT hotel_guests_pkey PRIMARY KEY (id)
);
CREATE INDEX ix_hotel_guests_branch_id ON public.hotel_guests USING btree (branch_id);
CREATE INDEX ix_hotel_guests_id ON public.hotel_guests USING btree (id);
CREATE INDEX ix_hotel_guests_tenant_id ON public.hotel_guests USING btree (tenant_id);


-- public.installed_plugins definition

-- Drop table

-- DROP TABLE public.installed_plugins;

CREATE TABLE public.installed_plugins (
	plugin_id varchar(100) NOT NULL,
	plugin_name varchar(200) NOT NULL,
	is_enabled bool NOT NULL,
	config_data jsonb NOT NULL,
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	is_deleted bool NOT NULL,
	CONSTRAINT installed_plugins_pkey PRIMARY KEY (id),
	CONSTRAINT uq_tenant_plugin UNIQUE (tenant_id, plugin_id)
);
CREATE INDEX ix_installed_plugins_id ON public.installed_plugins USING btree (id);
CREATE INDEX ix_installed_plugins_tenant_id ON public.installed_plugins USING btree (tenant_id);


-- public.kds_alerts definition

-- Drop table

-- DROP TABLE public.kds_alerts;

CREATE TABLE public.kds_alerts (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	order_id int8 NULL,
	ticket_id int8 NULL,
	station_id int8 NULL,
	alert_type varchar(40) NOT NULL,
	severity varchar(20) DEFAULT 'INFO'::character varying NOT NULL,
	message varchar(500) NOT NULL,
	is_acknowledged bool DEFAULT false NOT NULL,
	acknowledged_by int8 NULL,
	acknowledged_at timestamptz NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	CONSTRAINT kds_alerts_pkey PRIMARY KEY (id)
);


-- public.kds_settings definition

-- Drop table

-- DROP TABLE public.kds_settings;

CREATE TABLE public.kds_settings (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	settings jsonb DEFAULT '{}'::jsonb NOT NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	CONSTRAINT kds_settings_pkey PRIMARY KEY (id)
);


-- public.kds_station_rules definition

-- Drop table

-- DROP TABLE public.kds_station_rules;

CREATE TABLE public.kds_station_rules (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	station_id int8 NOT NULL,
	menu_item_id int8 NULL,
	category_id int8 NULL,
	rule_type varchar(30) DEFAULT 'ITEM'::character varying NOT NULL,
	priority int4 DEFAULT 100 NOT NULL,
	preparation_time_seconds int4 DEFAULT 300 NOT NULL,
	is_default bool DEFAULT false NOT NULL,
	is_active bool DEFAULT true NOT NULL,
	conditions jsonb DEFAULT '{}'::jsonb NOT NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	CONSTRAINT kds_station_rules_pkey PRIMARY KEY (id)
);


-- public.lead_inquiries definition

-- Drop table

-- DROP TABLE public.lead_inquiries;

CREATE TABLE public.lead_inquiries (
	id bigserial NOT NULL,
	full_name varchar(255) NOT NULL,
	company_name varchar(255) NOT NULL,
	phone varchar(50) NOT NULL,
	email varchar(255) NOT NULL,
	vertical varchar(50) DEFAULT 'restaurant'::character varying NOT NULL,
	outlet_count varchar(50) DEFAULT '1-3 Outlets'::character varying NULL,
	preferred_date varchar(50) NULL,
	preferred_time varchar(50) NULL,
	inquiry_type varchar(50) DEFAULT 'DEMO_REQUEST'::character varying NOT NULL,
	status varchar(50) DEFAULT 'NEW'::character varying NOT NULL,
	notes text NULL,
	operator_notes text NULL,
	"source" varchar(100) DEFAULT 'MARKETING_WEB'::character varying NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT lead_inquiries_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_lead_inquiries_created_at ON public.lead_inquiries USING btree (created_at DESC);
CREATE INDEX idx_lead_inquiries_status ON public.lead_inquiries USING btree (status);
CREATE INDEX idx_lead_inquiries_vertical ON public.lead_inquiries USING btree (vertical);


-- public.notification_logs definition

-- Drop table

-- DROP TABLE public.notification_logs;

CREATE TABLE public.notification_logs (
	channel varchar(20) NOT NULL,
	recipient varchar(300) NOT NULL,
	subject varchar(300) NULL,
	body text NOT NULL,
	status varchar(20) NOT NULL,
	error_message text NULL,
	sent_at timestamp NULL,
	delivered_at timestamp NULL,
	template_key varchar(100) NULL,
	reference_type varchar(50) NULL,
	reference_id varchar(100) NULL,
	metadata jsonb NOT NULL,
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	created_by int8 NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	is_deleted bool NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT notification_logs_pkey PRIMARY KEY (id)
);
CREATE INDEX ix_notification_logs_id ON public.notification_logs USING btree (id);
CREATE INDEX ix_notification_logs_tenant_id ON public.notification_logs USING btree (tenant_id);


-- public.notification_templates definition

-- Drop table

-- DROP TABLE public.notification_templates;

CREATE TABLE public.notification_templates (
	"name" varchar(200) NOT NULL,
	template_key varchar(100) NOT NULL,
	channel varchar(20) NOT NULL,
	subject varchar(300) NULL,
	body text NOT NULL,
	variables jsonb NOT NULL,
	is_active bool NOT NULL,
	"version" int4 NOT NULL,
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	created_by int8 NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	is_deleted bool NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT notification_templates_pkey PRIMARY KEY (id)
);
CREATE INDEX ix_notification_templates_id ON public.notification_templates USING btree (id);
CREATE INDEX ix_notification_templates_tenant_id ON public.notification_templates USING btree (tenant_id);


-- public.notifications definition

-- Drop table

-- DROP TABLE public.notifications;

CREATE TABLE public.notifications (
	recipient varchar(255) NOT NULL,
	channel varchar(50) NOT NULL,
	subject varchar(255) NULL,
	body text NOT NULL,
	status varchar(50) NOT NULL,
	error_message text NULL,
	sent_at timestamptz NULL,
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	is_deleted bool NOT NULL,
	CONSTRAINT notifications_pkey PRIMARY KEY (id)
);
CREATE INDEX ix_notifications_id ON public.notifications USING btree (id);
CREATE INDEX ix_notifications_tenant_id ON public.notifications USING btree (tenant_id);


-- public.payment_modes definition

-- Drop table

-- DROP TABLE public.payment_modes;

CREATE TABLE public.payment_modes (
	branch_id int8 NULL,
	"name" varchar(100) NOT NULL,
	code varchar(30) NOT NULL,
	icon varchar(50) NULL,
	payment_type varchar(50) NOT NULL,
	qr_code_url varchar(500) NULL,
	is_active bool NOT NULL,
	sort_order int4 NOT NULL,
	company_id int8 NULL,
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	is_deleted bool NOT NULL,
	CONSTRAINT payment_modes_pkey PRIMARY KEY (id)
);
CREATE INDEX ix_payment_modes_branch_id ON public.payment_modes USING btree (branch_id);
CREATE INDEX ix_payment_modes_company_id ON public.payment_modes USING btree (company_id);
CREATE INDEX ix_payment_modes_id ON public.payment_modes USING btree (id);
CREATE INDEX ix_payment_modes_tenant_id ON public.payment_modes USING btree (tenant_id);


-- public.pos_queue_tokens definition

-- Drop table

-- DROP TABLE public.pos_queue_tokens;

CREATE TABLE public.pos_queue_tokens (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	branch_id int8 NULL,
	token_code varchar(20) NOT NULL,
	cart_items jsonb NOT NULL,
	customer_name varchar(100) NULL,
	customer_phone varchar(20) NULL,
	is_claimed bool DEFAULT false NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT pos_queue_tokens_pkey PRIMARY KEY (id),
	CONSTRAINT pos_queue_tokens_token_code_key UNIQUE (token_code)
);
CREATE INDEX idx_pos_queue_tokens ON public.pos_queue_tokens USING btree (tenant_id, token_code, is_claimed);


-- public.pos_shifts definition

-- Drop table

-- DROP TABLE public.pos_shifts;

CREATE TABLE public.pos_shifts (
	branch_id int8 NULL,
	shift_number varchar(50) NOT NULL,
	cashier_name varchar(100) NOT NULL,
	status varchar(20) NOT NULL,
	opening_cash numeric(15, 2) NOT NULL,
	closing_cash numeric(15, 2) NULL,
	expected_cash numeric(15, 2) NOT NULL,
	cash_sales numeric(15, 2) NOT NULL,
	upi_sales numeric(15, 2) NOT NULL,
	card_sales numeric(15, 2) NOT NULL,
	total_sales numeric(15, 2) NOT NULL,
	pay_ins numeric(15, 2) NOT NULL,
	pay_outs numeric(15, 2) NOT NULL,
	variance numeric(15, 2) NULL,
	opened_at timestamptz NOT NULL,
	closed_at timestamptz NULL,
	notes text NULL,
	company_id int8 NULL,
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	is_deleted bool NOT NULL,
	CONSTRAINT pos_shifts_pkey PRIMARY KEY (id)
);
CREATE INDEX ix_pos_shifts_branch_id ON public.pos_shifts USING btree (branch_id);
CREATE INDEX ix_pos_shifts_company_id ON public.pos_shifts USING btree (company_id);
CREATE INDEX ix_pos_shifts_id ON public.pos_shifts USING btree (id);
CREATE INDEX ix_pos_shifts_tenant_id ON public.pos_shifts USING btree (tenant_id);


-- public.queue_tokens definition

-- Drop table

-- DROP TABLE public.queue_tokens;

CREATE TABLE public.queue_tokens (
	branch_id int8 NOT NULL,
	token_code varchar(10) NOT NULL,
	customer_name varchar(100) NULL,
	customer_phone varchar(20) NULL,
	table_number varchar(20) NULL,
	cart_items jsonb NOT NULL,
	subtotal numeric(15, 2) NOT NULL,
	is_claimed bool NOT NULL,
	claimed_at timestamptz NULL,
	claimed_by_order_id int8 NULL,
	expires_at timestamptz NOT NULL,
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	is_deleted bool NOT NULL,
	CONSTRAINT queue_tokens_pkey PRIMARY KEY (id)
);
CREATE INDEX ix_queue_tokens_branch_id ON public.queue_tokens USING btree (branch_id);
CREATE INDEX ix_queue_tokens_id ON public.queue_tokens USING btree (id);
CREATE INDEX ix_queue_tokens_is_claimed ON public.queue_tokens USING btree (is_claimed);
CREATE INDEX ix_queue_tokens_tenant_id ON public.queue_tokens USING btree (tenant_id);
CREATE INDEX ix_queue_tokens_token_code ON public.queue_tokens USING btree (token_code);


-- public.tenant_app_configs definition

-- Drop table

-- DROP TABLE public.tenant_app_configs;

CREATE TABLE public.tenant_app_configs (
	branch_id int8 NULL,
	app_name varchar(100) NOT NULL,
	draft_config jsonb NOT NULL,
	published_config jsonb NOT NULL,
	config_version int4 NOT NULL,
	published_at timestamptz NULL,
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	is_deleted bool NOT NULL,
	CONSTRAINT tenant_app_configs_pkey PRIMARY KEY (id),
	CONSTRAINT uq_tenant_branch_app_config UNIQUE (tenant_id, branch_id, app_name)
);
CREATE INDEX ix_tenant_app_configs_app_name ON public.tenant_app_configs USING btree (app_name);
CREATE INDEX ix_tenant_app_configs_branch_id ON public.tenant_app_configs USING btree (branch_id);
CREATE INDEX ix_tenant_app_configs_id ON public.tenant_app_configs USING btree (id);
CREATE INDEX ix_tenant_app_configs_tenant_id ON public.tenant_app_configs USING btree (tenant_id);


-- public.tenant_custom_domains definition

-- Drop table

-- DROP TABLE public.tenant_custom_domains;

CREATE TABLE public.tenant_custom_domains (
	branch_id int8 NULL,
	app_name varchar(100) NOT NULL,
	"domain" varchar(255) NOT NULL,
	status varchar(50) NOT NULL,
	record_type varchar(20) NOT NULL,
	target_value varchar(255) NOT NULL,
	verified_at timestamptz NULL,
	last_checked_at timestamptz NULL,
	error_message text NULL,
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	is_deleted bool NOT NULL,
	CONSTRAINT tenant_custom_domains_pkey PRIMARY KEY (id),
	CONSTRAINT uq_custom_domain UNIQUE (domain)
);
CREATE INDEX ix_tenant_custom_domains_branch_id ON public.tenant_custom_domains USING btree (branch_id);
CREATE UNIQUE INDEX ix_tenant_custom_domains_domain ON public.tenant_custom_domains USING btree (domain);
CREATE INDEX ix_tenant_custom_domains_id ON public.tenant_custom_domains USING btree (id);
CREATE INDEX ix_tenant_custom_domains_tenant_id ON public.tenant_custom_domains USING btree (tenant_id);


-- public.tenants definition

-- Drop table

-- DROP TABLE public.tenants;

CREATE TABLE public.tenants (
	id bigserial NOT NULL,
	"name" varchar(200) NOT NULL,
	slug varchar(100) NOT NULL,
	subdomain varchar(100) NULL,
	"domain" varchar(255) NULL,
	logo_url varchar(500) NULL,
	"plan" varchar(50) DEFAULT 'starter'::character varying NOT NULL,
	is_active bool DEFAULT true NOT NULL,
	settings jsonb DEFAULT '{}'::jsonb NULL,
	theme jsonb DEFAULT '{}'::jsonb NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT tenants_domain_key UNIQUE (domain),
	CONSTRAINT tenants_pkey PRIMARY KEY (id),
	CONSTRAINT tenants_plan_check CHECK (((plan)::text = ANY ((ARRAY['starter'::character varying, 'professional'::character varying, 'enterprise'::character varying])::text[]))),
	CONSTRAINT tenants_slug_key UNIQUE (slug)
);


-- public.workflow_instances definition

-- Drop table

-- DROP TABLE public.workflow_instances;

CREATE TABLE public.workflow_instances (
	workflow_key varchar(100) NOT NULL,
	entity_id varchar(100) NOT NULL,
	current_state varchar(100) NOT NULL,
	state_payload jsonb NOT NULL,
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	is_deleted bool NOT NULL,
	CONSTRAINT uq_tenant_workflow_entity UNIQUE (tenant_id, workflow_key, entity_id),
	CONSTRAINT workflow_instances_pkey PRIMARY KEY (id)
);
CREATE INDEX ix_workflow_instances_id ON public.workflow_instances USING btree (id);
CREATE INDEX ix_workflow_instances_tenant_id ON public.workflow_instances USING btree (tenant_id);


-- public.ai_conversations definition

-- Drop table

-- DROP TABLE public.ai_conversations;

CREATE TABLE public.ai_conversations (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	user_id int8 NOT NULL,
	agent_type varchar(50) DEFAULT 'general'::character varying NOT NULL,
	title varchar(300) NULL,
	context jsonb DEFAULT '{}'::jsonb NULL,
	token_count int4 DEFAULT 0 NOT NULL,
	cost_usd numeric(10, 4) DEFAULT 0.0000 NOT NULL,
	is_archived bool DEFAULT false NOT NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT ai_conversations_pkey PRIMARY KEY (id),
	CONSTRAINT ai_conversations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_ai_conversations_lookup ON public.ai_conversations USING btree (tenant_id, user_id, is_archived);


-- public.ai_messages definition

-- Drop table

-- DROP TABLE public.ai_messages;

CREATE TABLE public.ai_messages (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	conversation_id int8 NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	token_count int4 DEFAULT 0 NOT NULL,
	model_used varchar(100) NULL,
	metadata jsonb DEFAULT '{}'::jsonb NULL,
	feedback varchar(10) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT ai_messages_feedback_check CHECK (((feedback)::text = ANY ((ARRAY['good'::character varying, 'bad'::character varying])::text[]))),
	CONSTRAINT ai_messages_pkey PRIMARY KEY (id),
	CONSTRAINT ai_messages_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'assistant'::character varying, 'system'::character varying])::text[]))),
	CONSTRAINT ai_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
	CONSTRAINT ai_messages_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_ai_messages_lookup ON public.ai_messages USING btree (tenant_id, conversation_id, created_at);


-- public.ai_prompt_templates definition

-- Drop table

-- DROP TABLE public.ai_prompt_templates;

CREATE TABLE public.ai_prompt_templates (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	"name" varchar(200) NOT NULL,
	category varchar(100) NOT NULL,
	agent_type varchar(50) NOT NULL,
	system_prompt text NOT NULL,
	user_prompt_template text NOT NULL,
	variables jsonb DEFAULT '[]'::jsonb NULL,
	"version" int4 DEFAULT 1 NOT NULL,
	is_active bool DEFAULT true NOT NULL,
	usage_count int4 DEFAULT 0 NOT NULL,
	avg_rating numeric(3, 2) DEFAULT 0.00 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT ai_prompt_templates_pkey PRIMARY KEY (id),
	CONSTRAINT ai_prompt_templates_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_ai_prompt_templates_lookup ON public.ai_prompt_templates USING btree (tenant_id, agent_type, is_active);


-- public.audit_logs definition

-- Drop table

-- DROP TABLE public.audit_logs;

CREATE TABLE public.audit_logs (
	id bigserial NOT NULL,
	tenant_id int8 NULL,
	user_id int8 NULL,
	"action" varchar(100) NOT NULL,
	resource_type varchar(100) NOT NULL,
	resource_id varchar(255) NULL,
	old_values jsonb NULL,
	new_values jsonb NULL,
	ip_address varchar(50) NULL,
	user_agent varchar(500) NULL,
	metadata jsonb DEFAULT '{}'::jsonb NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	is_deleted bool DEFAULT false NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
	CONSTRAINT audit_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_audit_logs_lookup ON public.audit_logs USING btree (tenant_id, resource_type, created_at DESC);


-- public.budget_entries definition

-- Drop table

-- DROP TABLE public.budget_entries;

CREATE TABLE public.budget_entries (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	fiscal_year varchar(10) NOT NULL,
	category varchar(100) NOT NULL,
	allocated_amount numeric(12, 2) NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT budget_entries_pkey PRIMARY KEY (id),
	CONSTRAINT budget_entries_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_budget_entries_lookup ON public.budget_entries USING btree (tenant_id, fiscal_year, category);


-- public.campaigns definition

-- Drop table

-- DROP TABLE public.campaigns;

CREATE TABLE public.campaigns (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	title varchar(200) NOT NULL,
	channel varchar(50) NOT NULL,
	status varchar(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT campaigns_channel_check CHECK (((channel)::text = ANY ((ARRAY['SMS'::character varying, 'EMAIL'::character varying, 'WHATSAPP'::character varying, 'PUSH'::character varying])::text[]))),
	CONSTRAINT campaigns_pkey PRIMARY KEY (id),
	CONSTRAINT campaigns_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'SCHEDULED'::character varying, 'ACTIVE'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying])::text[]))),
	CONSTRAINT campaigns_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_campaigns_lookup ON public.campaigns USING btree (tenant_id, status);


-- public.chart_of_accounts definition

-- Drop table

-- DROP TABLE public.chart_of_accounts;

CREATE TABLE public.chart_of_accounts (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	account_code varchar(50) NOT NULL,
	account_name varchar(150) NOT NULL,
	account_type varchar(50) NOT NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT chart_of_accounts_account_type_check CHECK (((account_type)::text = ANY ((ARRAY['ASSET'::character varying, 'LIABILITY'::character varying, 'EQUITY'::character varying, 'REVENUE'::character varying, 'EXPENSE'::character varying])::text[]))),
	CONSTRAINT chart_of_accounts_pkey PRIMARY KEY (id),
	CONSTRAINT uq_tenant_account_code UNIQUE (tenant_id, account_code),
	CONSTRAINT chart_of_accounts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_chart_of_accounts_lookup ON public.chart_of_accounts USING btree (tenant_id, account_type);


-- public.companies definition

-- Drop table

-- DROP TABLE public.companies;

CREATE TABLE public.companies (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	"name" varchar(200) NOT NULL,
	legal_name varchar(300) NULL,
	gstin varchar(15) NULL,
	pan varchar(10) NULL,
	cin varchar(21) NULL,
	address jsonb DEFAULT '{}'::jsonb NULL,
	country_code varchar(3) DEFAULT 'IN'::character varying NULL,
	currency_code varchar(3) DEFAULT 'INR'::character varying NULL,
	fiscal_year_start varchar(5) DEFAULT '04-01'::character varying NULL,
	business_type varchar(50) DEFAULT 'restaurant'::character varying NULL,
	is_active bool DEFAULT true NOT NULL,
	settings jsonb DEFAULT '{}'::jsonb NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT companies_pkey PRIMARY KEY (id),
	CONSTRAINT companies_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_companies_tenant ON public.companies USING btree (tenant_id);


-- public.customers definition

-- Drop table

-- DROP TABLE public.customers;

CREATE TABLE public.customers (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	"name" varchar(150) NOT NULL,
	phone varchar(30) NOT NULL,
	email varchar(150) NULL,
	loyalty_points int4 DEFAULT 0 NOT NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	hashed_password varchar(255) NULL,
	address jsonb DEFAULT '{}'::jsonb NULL,
	city varchar(100) NULL,
	pincode varchar(20) NULL,
	CONSTRAINT customers_pkey PRIMARY KEY (id),
	CONSTRAINT customers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_customers_hierarchy ON public.customers USING btree (tenant_id, company_id, branch_id);
CREATE INDEX idx_customers_lookup ON public.customers USING btree (tenant_id, phone);
CREATE INDEX idx_customers_tenant_phone ON public.customers USING btree (tenant_id, phone);


-- public.departments definition

-- Drop table

-- DROP TABLE public.departments;

CREATE TABLE public.departments (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	"name" varchar(100) NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT departments_pkey PRIMARY KEY (id),
	CONSTRAINT departments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_departments_tenant ON public.departments USING btree (tenant_id);


-- public.designations definition

-- Drop table

-- DROP TABLE public.designations;

CREATE TABLE public.designations (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	department_id int8 NULL,
	title varchar(100) NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT designations_pkey PRIMARY KEY (id),
	CONSTRAINT designations_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL,
	CONSTRAINT designations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_designations_tenant ON public.designations USING btree (tenant_id, department_id);


-- public.employees definition

-- Drop table

-- DROP TABLE public.employees;

CREATE TABLE public.employees (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	employee_code varchar(50) NOT NULL,
	full_name varchar(150) NOT NULL,
	designation varchar(100) NOT NULL,
	phone varchar(30) NOT NULL,
	basic_salary numeric(12, 2) NOT NULL,
	status varchar(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	is_waiter bool DEFAULT false NULL,
	is_cashier bool DEFAULT false NULL,
	is_chef bool DEFAULT false NULL,
	department_name varchar(100) DEFAULT 'General'::character varying NULL,
	allowances numeric(12, 2) DEFAULT 0.00 NULL,
	deductions numeric(12, 2) DEFAULT 0.00 NULL,
	can_access_staff_web bool DEFAULT false NULL,
	can_access_kds_web bool DEFAULT false NULL,
	can_access_pos bool DEFAULT false NULL,
	user_id int8 NULL,
	pin_code varchar(100) DEFAULT '1234'::character varying NULL,
	CONSTRAINT employees_pkey PRIMARY KEY (id),
	CONSTRAINT employees_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'ON_LEAVE'::character varying, 'SUSPENDED'::character varying, 'TERMINATED'::character varying])::text[]))),
	CONSTRAINT uq_tenant_emp_code UNIQUE (tenant_id, employee_code),
	CONSTRAINT employees_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_employees_hierarchy ON public.employees USING btree (tenant_id, company_id, branch_id, status);
CREATE INDEX idx_employees_lookup ON public.employees USING btree (tenant_id, status, designation);


-- public.event_store definition

-- Drop table

-- DROP TABLE public.event_store;

CREATE TABLE public.event_store (
	id bigserial NOT NULL,
	event_type varchar(100) NOT NULL,
	tenant_id int8 NOT NULL,
	payload jsonb NOT NULL,
	status varchar(20) DEFAULT 'PENDING'::character varying NOT NULL,
	retry_count int4 DEFAULT 0 NOT NULL,
	source_module varchar(100) NULL,
	correlation_id varchar(255) NULL,
	processed_at timestamptz NULL,
	"error" text NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	is_deleted bool DEFAULT false NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT event_store_pkey PRIMARY KEY (id),
	CONSTRAINT event_store_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'PROCESSED'::character varying, 'FAILED'::character varying])::text[]))),
	CONSTRAINT event_store_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_event_store_lookup ON public.event_store USING btree (tenant_id, status, created_at);


-- public.feature_licenses definition

-- Drop table

-- DROP TABLE public.feature_licenses;

CREATE TABLE public.feature_licenses (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	feature_code varchar(100) NOT NULL,
	is_active bool DEFAULT true NOT NULL,
	expires_at timestamptz NULL,
	max_users int4 NULL,
	max_branches int4 NULL,
	config jsonb DEFAULT '{}'::jsonb NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT feature_licenses_pkey PRIMARY KEY (id),
	CONSTRAINT uq_feature_license UNIQUE (tenant_id, feature_code),
	CONSTRAINT feature_licenses_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_feature_licenses_lookup ON public.feature_licenses USING btree (tenant_id, feature_code, is_active);


-- public.file_master_erp definition

-- Drop table

-- DROP TABLE public.file_master_erp;

CREATE TABLE public.file_master_erp (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	code varchar(100) NOT NULL,
	"label" varchar(200) NOT NULL,
	href varchar(300) NOT NULL,
	icon varchar(100) NULL,
	category varchar(50) DEFAULT 'core'::character varying NULL,
	parent_code varchar(100) NULL,
	is_active bool DEFAULT true NOT NULL,
	sort_order int4 DEFAULT 0 NOT NULL,
	required_permission varchar(100) NULL,
	required_feature varchar(100) NULL,
	"type" varchar(50) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT file_master_erp_pkey PRIMARY KEY (id),
	CONSTRAINT uq_file_master_erp_code UNIQUE (tenant_id, code),
	CONSTRAINT file_master_erp_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_file_master_erp_lookup ON public.file_master_erp USING btree (tenant_id, category, is_active);


-- public.form_fields definition

-- Drop table

-- DROP TABLE public.form_fields;

CREATE TABLE public.form_fields (
	id bigserial NOT NULL,
	form_id int8 NOT NULL,
	field_name varchar(100) NOT NULL,
	field_label varchar(200) NOT NULL,
	field_type varchar(50) NOT NULL,
	placeholder varchar(200) NULL,
	default_value varchar(200) NULL,
	is_required bool DEFAULT false NOT NULL,
	is_readonly bool DEFAULT false NOT NULL,
	is_hidden bool DEFAULT false NOT NULL,
	sort_order int4 DEFAULT 0 NOT NULL,
	"section" varchar(50) DEFAULT 'default'::character varying NOT NULL,
	tab varchar(50) DEFAULT 'basic'::character varying NOT NULL,
	width varchar(50) DEFAULT 'full'::character varying NOT NULL,
	help_text varchar(500) NULL,
	"options" jsonb NULL,
	depends_on varchar(100) NULL,
	depends_value varchar(100) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	is_deleted bool DEFAULT false NULL,
	tenant_id int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT form_fields_pkey PRIMARY KEY (id),
	CONSTRAINT uq_form_field_name UNIQUE (form_id, field_name),
	CONSTRAINT form_fields_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.form_master(id) ON DELETE CASCADE
);


-- public.form_submissions definition

-- Drop table

-- DROP TABLE public.form_submissions;

CREATE TABLE public.form_submissions (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	form_key varchar(100) NOT NULL,
	submitted_by int8 NULL,
	payload jsonb DEFAULT '{}'::jsonb NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT form_submissions_pkey PRIMARY KEY (id),
	CONSTRAINT form_submissions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_form_submissions_lookup ON public.form_submissions USING btree (tenant_id, form_key, created_at DESC);


-- public.hotel_rooms definition

-- Drop table

-- DROP TABLE public.hotel_rooms;

CREATE TABLE public.hotel_rooms (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	room_number varchar(20) NOT NULL,
	room_type varchar(50) NOT NULL,
	rate_per_night numeric(12, 2) NOT NULL,
	status varchar(50) DEFAULT 'VACANT'::character varying NOT NULL,
	floor_number int4 DEFAULT 1 NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT hotel_rooms_pkey PRIMARY KEY (id),
	CONSTRAINT hotel_rooms_status_check CHECK (((status)::text = ANY ((ARRAY['VACANT'::character varying, 'OCCUPIED'::character varying, 'RESERVED'::character varying, 'CLEANING'::character varying, 'MAINTENANCE'::character varying])::text[]))),
	CONSTRAINT uq_tenant_hotel_room UNIQUE (tenant_id, room_number),
	CONSTRAINT hotel_rooms_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_hotel_rooms_pms_lookup ON public.hotel_rooms USING btree (tenant_id, status, room_type);


-- public.inventory_items definition

-- Drop table

-- DROP TABLE public.inventory_items;

CREATE TABLE public.inventory_items (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	branch_id int8 NULL,
	"name" varchar(200) NOT NULL,
	item_code varchar(50) NOT NULL,
	unit_of_measure varchar(20) DEFAULT 'kg'::character varying NOT NULL,
	current_stock numeric(15, 3) DEFAULT 0.000 NOT NULL,
	reorder_level numeric(15, 3) DEFAULT 10.000 NOT NULL,
	cost_per_unit numeric(15, 2) DEFAULT 0.00 NOT NULL,
	is_deleted bool DEFAULT false NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT inventory_items_pkey PRIMARY KEY (id),
	CONSTRAINT inventory_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);


-- public.invoices definition

-- Drop table

-- DROP TABLE public.invoices;

CREATE TABLE public.invoices (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	invoice_number varchar(50) NOT NULL,
	customer_name varchar(150) NOT NULL,
	invoice_date date NOT NULL,
	due_date date NOT NULL,
	subtotal numeric(12, 2) NOT NULL,
	tax_amount numeric(12, 2) DEFAULT 0.00 NOT NULL,
	total_amount numeric(12, 2) NOT NULL,
	paid_amount numeric(12, 2) DEFAULT 0.00 NOT NULL,
	status varchar(50) DEFAULT 'UNPAID'::character varying NOT NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT invoices_pkey PRIMARY KEY (id),
	CONSTRAINT invoices_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'UNPAID'::character varying, 'PARTIALLY_PAID'::character varying, 'PAID'::character varying, 'CANCELLED'::character varying, 'OVERDUE'::character varying])::text[]))),
	CONSTRAINT uq_tenant_invoice_no UNIQUE (tenant_id, invoice_number),
	CONSTRAINT invoices_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_invoices_lookup ON public.invoices USING btree (tenant_id, status, due_date);


-- public.journal_entries definition

-- Drop table

-- DROP TABLE public.journal_entries;

CREATE TABLE public.journal_entries (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	entry_date date NOT NULL,
	description text NULL,
	debit_amount numeric(12, 2) DEFAULT 0.00 NOT NULL,
	credit_amount numeric(12, 2) DEFAULT 0.00 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT journal_entries_pkey PRIMARY KEY (id),
	CONSTRAINT journal_entries_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_journal_entries_lookup ON public.journal_entries USING btree (tenant_id, entry_date);


-- public.leave_requests definition

-- Drop table

-- DROP TABLE public.leave_requests;

CREATE TABLE public.leave_requests (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	employee_id int8 NOT NULL,
	start_date date NOT NULL,
	end_date date NOT NULL,
	reason text NULL,
	status varchar(50) DEFAULT 'PENDING'::character varying NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT leave_requests_pkey PRIMARY KEY (id),
	CONSTRAINT leave_requests_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying, 'CANCELLED'::character varying])::text[]))),
	CONSTRAINT leave_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE,
	CONSTRAINT leave_requests_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_leave_requests_lookup ON public.leave_requests USING btree (tenant_id, employee_id, status);


-- public.leave_types definition

-- Drop table

-- DROP TABLE public.leave_types;

CREATE TABLE public.leave_types (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	"name" varchar(50) NOT NULL,
	max_days int4 DEFAULT 12 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT leave_types_pkey PRIMARY KEY (id),
	CONSTRAINT leave_types_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_leave_types_tenant ON public.leave_types USING btree (tenant_id);


-- public.loyalty_transactions definition

-- Drop table

-- DROP TABLE public.loyalty_transactions;

CREATE TABLE public.loyalty_transactions (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	customer_id int8 NOT NULL,
	points_earned int4 DEFAULT 0 NOT NULL,
	points_redeemed int4 DEFAULT 0 NOT NULL,
	transaction_type varchar(50) NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT loyalty_transactions_pkey PRIMARY KEY (id),
	CONSTRAINT loyalty_transactions_transaction_type_check CHECK (((transaction_type)::text = ANY ((ARRAY['EARN'::character varying, 'REDEEM'::character varying, 'EXPIRE'::character varying, 'ADJUSTMENT'::character varying])::text[]))),
	CONSTRAINT loyalty_transactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE,
	CONSTRAINT loyalty_transactions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_loyalty_transactions_lookup ON public.loyalty_transactions USING btree (tenant_id, customer_id, created_at DESC);


-- public.menu_categories definition

-- Drop table

-- DROP TABLE public.menu_categories;

CREATE TABLE public.menu_categories (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	branch_id int8 NULL,
	"name" varchar(100) NOT NULL,
	icon varchar(50) NULL,
	slug varchar(100) NULL,
	parent_id int8 NULL,
	"level" int4 DEFAULT 1 NULL,
	sort_order int4 DEFAULT 1 NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	company_id int8 NULL,
	updated_by int8 NULL,
	CONSTRAINT menu_categories_pkey PRIMARY KEY (id),
	CONSTRAINT menu_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.menu_categories(id) ON DELETE SET NULL
);
CREATE INDEX idx_menu_categories_lookup ON public.menu_categories USING btree (tenant_id, branch_id, sort_order);


-- public.menu_items definition

-- Drop table

-- DROP TABLE public.menu_items;

CREATE TABLE public.menu_items (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	category_id int8 NULL,
	item_code varchar(50) DEFAULT ''::character varying NULL,
	"name" varchar(200) NOT NULL,
	price numeric(12, 2) DEFAULT 0.00 NOT NULL,
	cost_price numeric(12, 2) DEFAULT 0.00 NOT NULL,
	tax_rate numeric(5, 2) DEFAULT 5.00 NOT NULL,
	is_available bool DEFAULT true NOT NULL,
	image_url text NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	branch_id int8 NULL,
	company_id int8 NULL,
	description varchar(500) NULL,
	short_description varchar(200) NULL,
	images jsonb DEFAULT '[]'::jsonb NULL,
	product_id int8 NULL,
	kds_station varchar(50) NULL,
	allergens jsonb DEFAULT '[]'::jsonb NULL,
	nutrition jsonb DEFAULT '{}'::jsonb NULL,
	is_veg bool DEFAULT true NULL,
	is_popular bool DEFAULT false NULL,
	packaging_charge numeric(15, 2) DEFAULT 0.0 NULL,
	sort_order int4 DEFAULT 1 NULL,
	CONSTRAINT menu_items_pkey PRIMARY KEY (id),
	CONSTRAINT uq_tenant_item_code UNIQUE (tenant_id, item_code),
	CONSTRAINT menu_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.menu_categories(id) ON DELETE SET NULL,
	CONSTRAINT menu_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_menu_items_active ON public.menu_items USING btree (tenant_id, category_id) WHERE ((is_deleted = false) AND (is_available = true));
CREATE INDEX idx_menu_items_hierarchy ON public.menu_items USING btree (tenant_id, company_id, branch_id, category_id);
CREATE INDEX idx_menu_items_pos_lookup ON public.menu_items USING btree (tenant_id, category_id, is_available);


-- public.menu_tags definition

-- Drop table

-- DROP TABLE public.menu_tags;

CREATE TABLE public.menu_tags (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	"name" varchar(50) NOT NULL,
	color_code varchar(20) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	color varchar(20) DEFAULT '#ef4444'::character varying NULL,
	icon varchar(50) NULL,
	CONSTRAINT menu_tags_pkey PRIMARY KEY (id),
	CONSTRAINT menu_tags_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_menu_tags_tenant ON public.menu_tags USING btree (tenant_id);


-- public.menu_variant_groups definition

-- Drop table

-- DROP TABLE public.menu_variant_groups;

CREATE TABLE public.menu_variant_groups (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	item_id int8 NOT NULL,
	"name" varchar(100) NOT NULL,
	is_required bool DEFAULT false NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	branch_id int8 NULL,
	min_selection varchar NULL,
	max_selection varchar NULL,
	sort_order varchar NULL,
	company_id int8 NULL,
	CONSTRAINT menu_variant_groups_pkey PRIMARY KEY (id),
	CONSTRAINT menu_variant_groups_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.menu_items(id) ON DELETE CASCADE,
	CONSTRAINT menu_variant_groups_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_variant_groups_item ON public.menu_variant_groups USING btree (tenant_id, item_id);


-- public.menu_variant_options definition

-- Drop table

-- DROP TABLE public.menu_variant_options;

CREATE TABLE public.menu_variant_options (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	group_id int8 NOT NULL,
	"name" varchar(100) NOT NULL,
	additional_price numeric(12, 2) DEFAULT 0.00 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	selling_price float8 DEFAULT 0.0 NULL,
	branch_id int8 NULL,
	company_id int8 NULL,
	price numeric NULL,
	is_default bool DEFAULT false NULL,
	is_available bool DEFAULT true NULL,
	sort_order int4 DEFAULT 1 NULL,
	CONSTRAINT menu_variant_options_pkey PRIMARY KEY (id),
	CONSTRAINT menu_variant_options_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.menu_variant_groups(id) ON DELETE CASCADE,
	CONSTRAINT menu_variant_options_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_variant_options_group ON public.menu_variant_options USING btree (tenant_id, group_id);


-- public.order_items definition

-- Drop table

-- DROP TABLE public.order_items;

CREATE TABLE public.order_items (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	order_id int8 NOT NULL,
	item_id int8 NULL,
	item_name varchar(200) NULL,
	quantity int4 DEFAULT 1 NOT NULL,
	unit_price numeric(12, 2) NOT NULL,
	total_price numeric(12, 2) NULL,
	notes text NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	menu_item_id int8 NULL,
	product_id int8 NULL,
	product_name varchar(300) NULL,
	product_code varchar(50) NULL,
	variant_id int8 NULL,
	variant_name varchar(200) NULL,
	unit_of_measure varchar(20) DEFAULT 'pcs'::character varying NULL,
	mrp numeric(12, 2) NULL,
	discount_amount numeric(12, 2) DEFAULT 0 NULL,
	tax_amount numeric(12, 2) DEFAULT 0 NULL,
	line_total numeric(12, 2) DEFAULT 0 NULL,
	kot_id int8 NULL,
	kds_status varchar(20) DEFAULT 'pending'::character varying NULL,
	course varchar(50) NULL,
	preparation_notes text NULL,
	selected_variants jsonb DEFAULT '[]'::jsonb NULL,
	selected_addons jsonb DEFAULT '[]'::jsonb NULL,
	modifiers jsonb DEFAULT '[]'::jsonb NULL,
	tax_breakdown jsonb DEFAULT '{}'::jsonb NULL,
	is_voided bool DEFAULT false NULL,
	is_active bool DEFAULT true NULL,
	kds_sent_at timestamptz NULL,
	kds_completed_at timestamptz NULL,
	void_reason text NULL,
	voided_at timestamptz NULL,
	voided_by int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT order_items_pkey PRIMARY KEY (id),
	CONSTRAINT order_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.menu_items(id) ON DELETE SET NULL,
	CONSTRAINT order_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_order_items_hierarchy ON public.order_items USING btree (tenant_id, company_id, branch_id, order_id);
CREATE INDEX idx_order_items_order ON public.order_items USING btree (tenant_id, order_id);


-- public.orders definition

-- Drop table

-- DROP TABLE public.orders;

CREATE TABLE public.orders (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	branch_id int8 NULL,
	order_number varchar(50) NOT NULL,
	table_id int8 NULL,
	order_type varchar(50) DEFAULT 'DINE_IN'::character varying NOT NULL,
	status varchar(50) DEFAULT 'OPEN'::character varying NOT NULL,
	subtotal numeric(12, 2) DEFAULT 0.00 NOT NULL,
	tax_amount numeric(12, 2) DEFAULT 0.00 NOT NULL,
	discount_amount numeric(12, 2) DEFAULT 0.00 NOT NULL,
	total_amount numeric(12, 2) DEFAULT 0.00 NOT NULL,
	customer_name varchar(150) NULL,
	customer_phone varchar(30) NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	token_number varchar(20) NULL,
	customer_id int8 NULL,
	waiter_id int8 NULL,
	guest_count int4 DEFAULT 1 NULL,
	payment_status varchar(20) DEFAULT 'unpaid'::character varying NULL,
	is_held bool DEFAULT false NULL,
	taxable_amount numeric(12, 2) DEFAULT 0 NULL,
	cgst_amount numeric(12, 2) DEFAULT 0 NULL,
	sgst_amount numeric(12, 2) DEFAULT 0 NULL,
	igst_amount numeric(12, 2) DEFAULT 0 NULL,
	total_tax numeric(12, 2) DEFAULT 0 NULL,
	grand_total numeric(12, 2) DEFAULT 0 NULL,
	amount_paid numeric(12, 2) DEFAULT 0 NULL,
	balance_due numeric(12, 2) DEFAULT 0 NULL,
	notes text NULL,
	special_instructions text NULL,
	source_channel varchar(30) DEFAULT 'pos'::character varying NULL,
	is_active bool DEFAULT true NULL,
	parent_order_id int8 NULL,
	external_order_id varchar(100) NULL,
	metadata jsonb DEFAULT '{}'::jsonb NULL,
	held_at timestamptz NULL,
	kot_sent_at timestamptz NULL,
	confirmed_at timestamptz NULL,
	ready_at timestamptz NULL,
	served_at timestamptz NULL,
	completed_at timestamptz NULL,
	cancelled_at timestamptz NULL,
	cancellation_reason text NULL,
	CONSTRAINT orders_pkey PRIMARY KEY (id),
	CONSTRAINT uq_tenant_order_no UNIQUE (tenant_id, order_number),
	CONSTRAINT orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_orders_active_pos ON public.orders USING btree (tenant_id, branch_id, status, created_at DESC) WHERE (is_deleted = false);
CREATE INDEX idx_orders_hierarchy ON public.orders USING btree (tenant_id, company_id, branch_id, status);
CREATE INDEX idx_orders_pos_filtering ON public.orders USING btree (tenant_id, branch_id, status, created_at DESC);


-- public.payroll_runs definition

-- Drop table

-- DROP TABLE public.payroll_runs;

CREATE TABLE public.payroll_runs (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	pay_period varchar(7) NOT NULL,
	total_payout numeric(12, 2) NOT NULL,
	status varchar(50) DEFAULT 'PROCESSED'::character varying NOT NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT payroll_runs_pkey PRIMARY KEY (id),
	CONSTRAINT payroll_runs_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'PROCESSED'::character varying, 'APPROVED'::character varying, 'CANCELLED'::character varying])::text[]))),
	CONSTRAINT payroll_runs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_payroll_runs_lookup ON public.payroll_runs USING btree (tenant_id, pay_period, status);


-- public.payslips definition

-- Drop table

-- DROP TABLE public.payslips;

CREATE TABLE public.payslips (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	payroll_run_id int8 NOT NULL,
	employee_id int8 NOT NULL,
	basic_salary numeric(12, 2) NOT NULL,
	net_salary numeric(12, 2) NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT payslips_pkey PRIMARY KEY (id),
	CONSTRAINT payslips_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE,
	CONSTRAINT payslips_payroll_run_id_fkey FOREIGN KEY (payroll_run_id) REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
	CONSTRAINT payslips_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_payslips_lookup ON public.payslips USING btree (tenant_id, payroll_run_id, employee_id);


-- public.pg_floors definition

-- Drop table

-- DROP TABLE public.pg_floors;

CREATE TABLE public.pg_floors (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	floor_name varchar(50) NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT pg_floors_pkey PRIMARY KEY (id),
	CONSTRAINT pg_floors_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_pg_floors_tenant ON public.pg_floors USING btree (tenant_id);


-- public.pg_rooms definition

-- Drop table

-- DROP TABLE public.pg_rooms;

CREATE TABLE public.pg_rooms (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	floor_id int8 NULL,
	room_number varchar(20) NOT NULL,
	sharing_type int4 DEFAULT 2 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT pg_rooms_pkey PRIMARY KEY (id),
	CONSTRAINT pg_rooms_floor_id_fkey FOREIGN KEY (floor_id) REFERENCES public.pg_floors(id) ON DELETE SET NULL,
	CONSTRAINT pg_rooms_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_pg_rooms_tenant ON public.pg_rooms USING btree (tenant_id, floor_id);


-- public.pos_shift_transactions definition

-- Drop table

-- DROP TABLE public.pos_shift_transactions;

CREATE TABLE public.pos_shift_transactions (
	shift_id int8 NOT NULL,
	"type" varchar(30) NOT NULL,
	amount float8 NOT NULL,
	payment_mode varchar(30) NOT NULL,
	reason varchar(255) NULL,
	performed_by varchar(100) NOT NULL,
	company_id int8 NULL,
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	is_deleted bool NOT NULL,
	branch_id int8 NULL,
	CONSTRAINT pos_shift_transactions_pkey PRIMARY KEY (id),
	CONSTRAINT pos_shift_transactions_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES public.pos_shifts(id) ON DELETE CASCADE
);
CREATE INDEX ix_pos_shift_transactions_company_id ON public.pos_shift_transactions USING btree (company_id);
CREATE INDEX ix_pos_shift_transactions_id ON public.pos_shift_transactions USING btree (id);
CREATE INDEX ix_pos_shift_transactions_shift_id ON public.pos_shift_transactions USING btree (shift_id);
CREATE INDEX ix_pos_shift_transactions_tenant_id ON public.pos_shift_transactions USING btree (tenant_id);


-- public.product_categories definition

-- Drop table

-- DROP TABLE public.product_categories;

CREATE TABLE public.product_categories (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	"name" varchar(100) NOT NULL,
	description text NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT product_categories_pkey PRIMARY KEY (id),
	CONSTRAINT product_categories_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_product_categories_tenant ON public.product_categories USING btree (tenant_id);


-- public.production_batches definition

-- Drop table

-- DROP TABLE public.production_batches;

CREATE TABLE public.production_batches (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	batch_number varchar(50) NOT NULL,
	recipe_name varchar(150) NOT NULL,
	quantity_produced numeric(12, 3) NOT NULL,
	status varchar(50) DEFAULT 'COMPLETED'::character varying NOT NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT production_batches_pkey PRIMARY KEY (id),
	CONSTRAINT production_batches_status_check CHECK (((status)::text = ANY ((ARRAY['PLANNED'::character varying, 'IN_PROGRESS'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying])::text[]))),
	CONSTRAINT production_batches_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_production_batches_lookup ON public.production_batches USING btree (tenant_id, status, created_at DESC);


-- public.products definition

-- Drop table

-- DROP TABLE public.products;

CREATE TABLE public.products (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	category_id int8 NULL,
	sku varchar(50) NOT NULL,
	"name" varchar(200) NOT NULL,
	unit varchar(20) DEFAULT 'PCS'::character varying NOT NULL,
	current_stock numeric(12, 3) DEFAULT 0.000 NOT NULL,
	min_stock_level numeric(12, 3) DEFAULT 10.000 NOT NULL,
	unit_cost numeric(12, 2) DEFAULT 0.00 NOT NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT products_pkey PRIMARY KEY (id),
	CONSTRAINT uq_tenant_product_sku UNIQUE (tenant_id, sku),
	CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id) ON DELETE SET NULL,
	CONSTRAINT products_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_products_stock_lookup ON public.products USING btree (tenant_id, category_id, current_stock);


-- public.recipe_ingredients definition

-- Drop table

-- DROP TABLE public.recipe_ingredients;

CREATE TABLE public.recipe_ingredients (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	menu_item_id int8 NOT NULL,
	inventory_item_id int8 NOT NULL,
	quantity_required numeric(15, 4) NOT NULL,
	wastage_percentage numeric(5, 2) DEFAULT 0.00 NOT NULL,
	is_deleted bool DEFAULT false NOT NULL,
	CONSTRAINT recipe_ingredients_pkey PRIMARY KEY (id),
	CONSTRAINT recipe_ingredients_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON DELETE CASCADE,
	CONSTRAINT recipe_ingredients_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE CASCADE,
	CONSTRAINT recipe_ingredients_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);


-- public.roles definition

-- Drop table

-- DROP TABLE public.roles;

CREATE TABLE public.roles (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	"name" varchar(100) NOT NULL,
	code varchar(50) NOT NULL,
	description text NULL,
	permissions jsonb DEFAULT '{}'::jsonb NOT NULL,
	is_system_role bool DEFAULT false NOT NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT roles_pkey PRIMARY KEY (id),
	CONSTRAINT roles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_roles_tenant ON public.roles USING btree (tenant_id);


-- public.room_types definition

-- Drop table

-- DROP TABLE public.room_types;

CREATE TABLE public.room_types (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	"name" varchar(100) NOT NULL,
	base_rate numeric(12, 2) NOT NULL,
	capacity int4 DEFAULT 2 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT room_types_pkey PRIMARY KEY (id),
	CONSTRAINT room_types_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_room_types_tenant ON public.room_types USING btree (tenant_id);


-- public.shifts definition

-- Drop table

-- DROP TABLE public.shifts;

CREATE TABLE public.shifts (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	"name" varchar(50) NOT NULL,
	start_time time NOT NULL,
	end_time time NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT shifts_pkey PRIMARY KEY (id),
	CONSTRAINT shifts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_shifts_tenant ON public.shifts USING btree (tenant_id);


-- public.stock_entries definition

-- Drop table

-- DROP TABLE public.stock_entries;

CREATE TABLE public.stock_entries (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	product_id int8 NOT NULL,
	entry_type varchar(50) NOT NULL,
	quantity numeric(12, 3) NOT NULL,
	unit_cost numeric(12, 2) NOT NULL,
	notes text NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT stock_entries_pkey PRIMARY KEY (id),
	CONSTRAINT stock_entries_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
	CONSTRAINT stock_entries_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_stock_entries_product ON public.stock_entries USING btree (tenant_id, product_id, created_at DESC);


-- public.stock_movements definition

-- Drop table

-- DROP TABLE public.stock_movements;

CREATE TABLE public.stock_movements (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	product_id int8 NOT NULL,
	movement_type varchar(50) NOT NULL,
	quantity numeric(12, 3) NOT NULL,
	source_location varchar(100) NULL,
	destination_location varchar(100) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT stock_movements_pkey PRIMARY KEY (id),
	CONSTRAINT stock_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
	CONSTRAINT stock_movements_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_stock_movements_product ON public.stock_movements USING btree (tenant_id, product_id, created_at DESC);


-- public.attendance_records definition

-- Drop table

-- DROP TABLE public.attendance_records;

CREATE TABLE public.attendance_records (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	employee_id int8 NOT NULL,
	attendance_date date NOT NULL,
	check_in timestamptz NULL,
	check_out timestamptz NULL,
	status varchar(50) DEFAULT 'PRESENT'::character varying NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT attendance_records_pkey PRIMARY KEY (id),
	CONSTRAINT attendance_records_status_check CHECK (((status)::text = ANY ((ARRAY['PRESENT'::character varying, 'ABSENT'::character varying, 'HALF_DAY'::character varying, 'LEAVE'::character varying])::text[]))),
	CONSTRAINT attendance_records_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE,
	CONSTRAINT attendance_records_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_attendance_records_lookup ON public.attendance_records USING btree (tenant_id, employee_id, attendance_date);


-- public.branches definition

-- Drop table

-- DROP TABLE public.branches;

CREATE TABLE public.branches (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	company_id int8 NOT NULL,
	"name" varchar(200) NOT NULL,
	code varchar(20) NOT NULL,
	branch_type varchar(50) DEFAULT 'outlet'::character varying NULL,
	address jsonb DEFAULT '{}'::jsonb NULL,
	phone varchar(20) NULL,
	email varchar(255) NULL,
	gstin varchar(15) NULL,
	latitude numeric(10, 7) NULL,
	longitude numeric(10, 7) NULL,
	timezone varchar(50) DEFAULT 'Asia/Kolkata'::character varying NULL,
	is_active bool DEFAULT true NOT NULL,
	settings jsonb DEFAULT '{}'::jsonb NULL,
	operating_hours jsonb DEFAULT '{}'::jsonb NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT branches_pkey PRIMARY KEY (id),
	CONSTRAINT uq_branch_code UNIQUE (tenant_id, company_id, code),
	CONSTRAINT branches_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
	CONSTRAINT branches_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_branches_company ON public.branches USING btree (tenant_id, company_id);
CREATE INDEX idx_branches_tenant ON public.branches USING btree (tenant_id);


-- public.customer_addresses definition

-- Drop table

-- DROP TABLE public.customer_addresses;

CREATE TABLE public.customer_addresses (
	customer_id int8 NOT NULL,
	"label" varchar(50) NOT NULL,
	flat_no varchar(100) NULL,
	area_street text NOT NULL,
	landmark varchar(150) NULL,
	city varchar(100) NOT NULL,
	state varchar(100) NULL,
	pincode varchar(20) NULL,
	is_default bool NOT NULL,
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	is_deleted bool NOT NULL,
	CONSTRAINT customer_addresses_pkey PRIMARY KEY (id),
	CONSTRAINT customer_addresses_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE INDEX idx_customer_addresses_cust ON public.customer_addresses USING btree (tenant_id, customer_id);
CREATE INDEX ix_customer_addresses_customer_id ON public.customer_addresses USING btree (customer_id);
CREATE INDEX ix_customer_addresses_id ON public.customer_addresses USING btree (id);
CREATE INDEX ix_customer_addresses_tenant_id ON public.customer_addresses USING btree (tenant_id);


-- public.customer_interactions definition

-- Drop table

-- DROP TABLE public.customer_interactions;

CREATE TABLE public.customer_interactions (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	customer_id int8 NOT NULL,
	interaction_type varchar(50) NOT NULL,
	notes text NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT customer_interactions_pkey PRIMARY KEY (id),
	CONSTRAINT customer_interactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE,
	CONSTRAINT customer_interactions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_customer_interactions_lookup ON public.customer_interactions USING btree (tenant_id, customer_id);


-- public.dining_tables definition

-- Drop table

-- DROP TABLE public.dining_tables;

CREATE TABLE public.dining_tables (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	branch_id int8 NULL,
	table_number varchar(20) NOT NULL,
	seating_capacity int4 DEFAULT 4 NOT NULL,
	status varchar(50) DEFAULT 'VACANT'::character varying NOT NULL,
	"section" varchar(50) DEFAULT 'MAIN'::character varying NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	"name" varchar(100) NULL,
	floor varchar(50) NULL,
	sort_order int4 DEFAULT 0 NULL,
	position_x int4 DEFAULT 0 NULL,
	position_y int4 DEFAULT 0 NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb NULL,
	company_id int8 NULL,
	capacity int4 DEFAULT 4 NULL,
	current_order_id int8 NULL,
	is_active bool DEFAULT true NULL,
	CONSTRAINT dining_tables_pkey PRIMARY KEY (id),
	CONSTRAINT uq_tenant_table_no UNIQUE (tenant_id, table_number),
	CONSTRAINT dining_tables_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL,
	CONSTRAINT dining_tables_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_dining_tables_pos_lookup ON public.dining_tables USING btree (tenant_id, branch_id, status);


-- public.field_validations definition

-- Drop table

-- DROP TABLE public.field_validations;

CREATE TABLE public.field_validations (
	id bigserial NOT NULL,
	field_id int8 NOT NULL,
	min_value numeric NULL,
	max_value numeric NULL,
	min_length int4 NULL,
	max_length int4 NULL,
	regex_pattern varchar(500) NULL,
	regex_message varchar(300) NULL,
	allowed_values jsonb NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	is_deleted bool DEFAULT false NULL,
	CONSTRAINT field_validations_field_id_key UNIQUE (field_id),
	CONSTRAINT field_validations_pkey PRIMARY KEY (id),
	CONSTRAINT field_validations_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.form_fields(id) ON DELETE CASCADE
);


-- public.hotel_reservations definition

-- Drop table

-- DROP TABLE public.hotel_reservations;

CREATE TABLE public.hotel_reservations (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	reservation_code varchar(50) NOT NULL,
	room_id int8 NOT NULL,
	guest_name varchar(150) NOT NULL,
	guest_phone varchar(30) NOT NULL,
	check_in_date date NOT NULL,
	check_out_date date NOT NULL,
	total_amount numeric(12, 2) NOT NULL,
	status varchar(50) DEFAULT 'CONFIRMED'::character varying NOT NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT hotel_reservations_pkey PRIMARY KEY (id),
	CONSTRAINT hotel_reservations_status_check CHECK (((status)::text = ANY ((ARRAY['CONFIRMED'::character varying, 'CHECKED_IN'::character varying, 'CHECKED_OUT'::character varying, 'CANCELLED'::character varying, 'NO_SHOW'::character varying])::text[]))),
	CONSTRAINT uq_tenant_reservation UNIQUE (tenant_id, reservation_code),
	CONSTRAINT hotel_reservations_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.hotel_rooms(id) ON DELETE CASCADE,
	CONSTRAINT hotel_reservations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_hotel_reservations_pms_lookup ON public.hotel_reservations USING btree (tenant_id, room_id, status, check_in_date, check_out_date);


-- public.invoice_items definition

-- Drop table

-- DROP TABLE public.invoice_items;

CREATE TABLE public.invoice_items (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	invoice_id int8 NOT NULL,
	item_description varchar(250) NOT NULL,
	quantity numeric(12, 3) DEFAULT 1 NOT NULL,
	unit_price numeric(12, 2) NOT NULL,
	total_price numeric(12, 2) NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT invoice_items_pkey PRIMARY KEY (id),
	CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE,
	CONSTRAINT invoice_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_invoice_items_invoice ON public.invoice_items USING btree (tenant_id, invoice_id);


-- public.invoice_payments definition

-- Drop table

-- DROP TABLE public.invoice_payments;

CREATE TABLE public.invoice_payments (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	invoice_id int8 NOT NULL,
	payment_mode varchar(50) NOT NULL,
	amount numeric(12, 2) NOT NULL,
	payment_date date NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT invoice_payments_pkey PRIMARY KEY (id),
	CONSTRAINT invoice_payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE,
	CONSTRAINT invoice_payments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_invoice_payments_invoice ON public.invoice_payments USING btree (tenant_id, invoice_id);


-- public.kds_expo_orders definition

-- Drop table

-- DROP TABLE public.kds_expo_orders;

CREATE TABLE public.kds_expo_orders (
	order_id int8 NOT NULL,
	status varchar(30) NOT NULL,
	order_type varchar(30) NOT NULL,
	fulfilment_mode varchar(30) NOT NULL,
	total_items int4 NOT NULL,
	ready_items int4 NOT NULL,
	is_complete bool NOT NULL,
	ready_at timestamptz NULL,
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	is_deleted bool NOT NULL,
	CONSTRAINT kds_expo_orders_pkey PRIMARY KEY (id),
	CONSTRAINT kds_expo_orders_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE
);
CREATE INDEX ix_kds_expo_orders_id ON public.kds_expo_orders USING btree (id);
CREATE UNIQUE INDEX ix_kds_expo_orders_order_id ON public.kds_expo_orders USING btree (order_id);
CREATE INDEX ix_kds_expo_orders_tenant_id ON public.kds_expo_orders USING btree (tenant_id);


-- public.kds_packing_orders definition

-- Drop table

-- DROP TABLE public.kds_packing_orders;

CREATE TABLE public.kds_packing_orders (
	order_id int8 NOT NULL,
	status varchar(30) NOT NULL,
	packing_required bool NOT NULL,
	checklist jsonb NOT NULL,
	packed_at timestamptz NULL,
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	is_deleted bool NOT NULL,
	CONSTRAINT kds_packing_orders_pkey PRIMARY KEY (id),
	CONSTRAINT kds_packing_orders_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE
);
CREATE INDEX ix_kds_packing_orders_id ON public.kds_packing_orders USING btree (id);
CREATE UNIQUE INDEX ix_kds_packing_orders_order_id ON public.kds_packing_orders USING btree (order_id);
CREATE INDEX ix_kds_packing_orders_tenant_id ON public.kds_packing_orders USING btree (tenant_id);


-- public.kitchen_stations definition

-- Drop table

-- DROP TABLE public.kitchen_stations;

CREATE TABLE public.kitchen_stations (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	branch_id int8 NULL,
	"name" varchar(100) NOT NULL,
	code varchar(50) NOT NULL,
	display_ip varchar(50) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	printer_name varchar(100) NULL,
	station_type varchar(50) DEFAULT 'main'::character varying NULL,
	categories jsonb DEFAULT '[]'::jsonb NULL,
	is_active bool DEFAULT true NULL,
	sort_order int4 DEFAULT 0 NULL,
	CONSTRAINT kitchen_stations_pkey PRIMARY KEY (id),
	CONSTRAINT kitchen_stations_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL,
	CONSTRAINT kitchen_stations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_kitchen_stations_tenant ON public.kitchen_stations USING btree (tenant_id, branch_id);


-- public.kots definition

-- Drop table

-- DROP TABLE public.kots;

CREATE TABLE public.kots (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	order_id int8 NOT NULL,
	kot_number varchar(50) NOT NULL,
	station_id int8 NULL,
	status varchar(50) DEFAULT 'PENDING'::character varying NOT NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT kots_pkey PRIMARY KEY (id),
	CONSTRAINT kots_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'PREPARING'::character varying, 'READY'::character varying, 'SERVED'::character varying, 'CANCELLED'::character varying])::text[]))),
	CONSTRAINT kots_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
	CONSTRAINT kots_station_id_fkey FOREIGN KEY (station_id) REFERENCES public.kitchen_stations(id) ON DELETE SET NULL,
	CONSTRAINT kots_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_kots_kds_display ON public.kots USING btree (tenant_id, station_id, status, created_at);


-- public.menu_addon_groups definition

-- Drop table

-- DROP TABLE public.menu_addon_groups;

CREATE TABLE public.menu_addon_groups (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	item_id int8 NOT NULL,
	"name" varchar(100) NOT NULL,
	min_selection int4 DEFAULT 0 NULL,
	max_selection int4 DEFAULT 5 NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	branch_id int8 NULL,
	sort_order varchar NULL,
	company_id int8 NULL,
	CONSTRAINT menu_addon_groups_pkey PRIMARY KEY (id),
	CONSTRAINT menu_addon_groups_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.menu_items(id) ON DELETE CASCADE,
	CONSTRAINT menu_addon_groups_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_addon_groups_item ON public.menu_addon_groups USING btree (tenant_id, item_id);


-- public.menu_addon_options definition

-- Drop table

-- DROP TABLE public.menu_addon_options;

CREATE TABLE public.menu_addon_options (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	group_id int8 NOT NULL,
	"name" varchar(100) NOT NULL,
	price numeric(12, 2) DEFAULT 0.00 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	variant_prices jsonb DEFAULT '{}'::jsonb NULL,
	branch_id int8 NULL,
	company_id int8 NULL,
	is_available bool DEFAULT true NULL,
	sort_order int4 DEFAULT 1 NULL,
	CONSTRAINT menu_addon_options_pkey PRIMARY KEY (id),
	CONSTRAINT menu_addon_options_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.menu_addon_groups(id) ON DELETE CASCADE,
	CONSTRAINT menu_addon_options_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_addon_options_group ON public.menu_addon_options USING btree (tenant_id, group_id);


-- public.menu_item_tags definition

-- Drop table

-- DROP TABLE public.menu_item_tags;

CREATE TABLE public.menu_item_tags (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	item_id int8 NOT NULL,
	tag_id int8 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	CONSTRAINT menu_item_tags_pkey PRIMARY KEY (id),
	CONSTRAINT menu_item_tags_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.menu_items(id) ON DELETE CASCADE,
	CONSTRAINT menu_item_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.menu_tags(id) ON DELETE CASCADE,
	CONSTRAINT menu_item_tags_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_menu_item_tags_lookup ON public.menu_item_tags USING btree (tenant_id, item_id, tag_id);


-- public.order_payments definition

-- Drop table

-- DROP TABLE public.order_payments;

CREATE TABLE public.order_payments (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	order_id int8 NOT NULL,
	payment_mode varchar(50) NOT NULL,
	amount numeric(12, 2) NOT NULL,
	status varchar(50) DEFAULT 'SUCCESS'::character varying NOT NULL,
	transaction_reference varchar(100) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT order_payments_pkey PRIMARY KEY (id),
	CONSTRAINT order_payments_status_check CHECK (((status)::text = ANY ((ARRAY['SUCCESS'::character varying, 'PENDING'::character varying, 'FAILED'::character varying, 'REFUNDED'::character varying])::text[]))),
	CONSTRAINT order_payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
	CONSTRAINT order_payments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_order_payments_lookup ON public.order_payments USING btree (tenant_id, order_id);


-- public.order_status_logs definition

-- Drop table

-- DROP TABLE public.order_status_logs;

CREATE TABLE public.order_status_logs (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	order_id int8 NOT NULL,
	previous_status varchar(50) NULL,
	new_status varchar(50) NOT NULL,
	changed_by int8 NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT order_status_logs_pkey PRIMARY KEY (id),
	CONSTRAINT order_status_logs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
	CONSTRAINT order_status_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_order_status_logs_lookup ON public.order_status_logs USING btree (tenant_id, order_id, created_at DESC);


-- public.pg_beds definition

-- Drop table

-- DROP TABLE public.pg_beds;

CREATE TABLE public.pg_beds (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	room_id int8 NULL,
	bed_number varchar(20) NOT NULL,
	monthly_rent numeric(12, 2) NOT NULL,
	status varchar(50) DEFAULT 'VACANT'::character varying NOT NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT pg_beds_pkey PRIMARY KEY (id),
	CONSTRAINT pg_beds_status_check CHECK (((status)::text = ANY ((ARRAY['VACANT'::character varying, 'OCCUPIED'::character varying, 'MAINTENANCE'::character varying, 'RESERVED'::character varying])::text[]))),
	CONSTRAINT pg_beds_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.pg_rooms(id) ON DELETE CASCADE,
	CONSTRAINT pg_beds_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_pg_beds_lookup ON public.pg_beds USING btree (tenant_id, room_id, status);


-- public.pg_residents definition

-- Drop table

-- DROP TABLE public.pg_residents;

CREATE TABLE public.pg_residents (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	bed_id int8 NULL,
	full_name varchar(150) NOT NULL,
	phone varchar(30) NOT NULL,
	id_proof_number varchar(50) NULL,
	joining_date date NOT NULL,
	status varchar(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT pg_residents_pkey PRIMARY KEY (id),
	CONSTRAINT pg_residents_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'NOTICE'::character varying, 'INACTIVE'::character varying])::text[]))),
	CONSTRAINT pg_residents_bed_id_fkey FOREIGN KEY (bed_id) REFERENCES public.pg_beds(id) ON DELETE SET NULL,
	CONSTRAINT pg_residents_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_pg_residents_lookup ON public.pg_residents USING btree (tenant_id, status, bed_id);


-- public.pg_visitor_logs definition

-- Drop table

-- DROP TABLE public.pg_visitor_logs;

CREATE TABLE public.pg_visitor_logs (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	resident_id int8 NULL,
	visitor_name varchar(150) NOT NULL,
	visitor_phone varchar(30) NOT NULL,
	check_in_time timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	check_out_time timestamptz NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT pg_visitor_logs_pkey PRIMARY KEY (id),
	CONSTRAINT pg_visitor_logs_resident_id_fkey FOREIGN KEY (resident_id) REFERENCES public.pg_residents(id) ON DELETE SET NULL,
	CONSTRAINT pg_visitor_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_pg_visitor_logs_lookup ON public.pg_visitor_logs USING btree (tenant_id, resident_id, check_in_time DESC);


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	company_id int8 NULL,
	branch_id int8 NULL,
	email varchar(255) NOT NULL,
	phone varchar(20) NULL,
	first_name varchar(100) NOT NULL,
	last_name varchar(100) NOT NULL,
	display_name varchar(200) NULL,
	avatar_url varchar(500) NULL,
	hashed_password varchar(255) NOT NULL,
	is_active bool DEFAULT true NOT NULL,
	is_verified bool DEFAULT false NOT NULL,
	is_superadmin bool DEFAULT false NOT NULL,
	"language" varchar(10) DEFAULT 'en'::character varying NULL,
	timezone varchar(50) DEFAULT 'Asia/Kolkata'::character varying NULL,
	last_login_at timestamptz NULL,
	mfa_enabled bool DEFAULT false NOT NULL,
	mfa_secret varchar(255) NULL,
	failed_login_attempts int4 DEFAULT 0 NOT NULL,
	locked_until timestamptz NULL,
	preferences jsonb DEFAULT '{}'::jsonb NULL,
	"version" int8 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT uq_user_email_per_tenant UNIQUE (tenant_id, email),
	CONSTRAINT users_pkey PRIMARY KEY (id),
	CONSTRAINT users_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL,
	CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL,
	CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_users_tenant ON public.users USING btree (tenant_id);
CREATE INDEX idx_users_tenant_active ON public.users USING btree (tenant_id, is_active);


-- public.kds_order_tickets definition

-- Drop table

-- DROP TABLE public.kds_order_tickets;

CREATE TABLE public.kds_order_tickets (
	order_id int8 NOT NULL,
	kot_id int8 NULL,
	station_id int8 NULL,
	ticket_number varchar(50) NOT NULL,
	order_type varchar(30) NOT NULL,
	fulfilment_mode varchar(30) NOT NULL,
	table_id int8 NULL,
	table_name varchar(50) NULL,
	token_number varchar(30) NULL,
	status varchar(30) NOT NULL,
	priority int4 NOT NULL,
	is_rush bool NOT NULL,
	sla_seconds int4 NOT NULL,
	queued_at timestamptz DEFAULT '2026-08-28 20:56:19.20567+05:30'::timestamp with time zone NOT NULL,
	started_at timestamptz NULL,
	ready_at timestamptz NULL,
	notes text NULL,
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	is_deleted bool NOT NULL,
	CONSTRAINT kds_order_tickets_pkey PRIMARY KEY (id),
	CONSTRAINT kds_order_tickets_kot_id_fkey FOREIGN KEY (kot_id) REFERENCES public.kots(id) ON DELETE SET NULL,
	CONSTRAINT kds_order_tickets_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
	CONSTRAINT kds_order_tickets_station_id_fkey FOREIGN KEY (station_id) REFERENCES public.kitchen_stations(id) ON DELETE CASCADE
);
CREATE INDEX ix_kds_order_tickets_id ON public.kds_order_tickets USING btree (id);
CREATE INDEX ix_kds_order_tickets_order_id ON public.kds_order_tickets USING btree (order_id);
CREATE INDEX ix_kds_order_tickets_station_id ON public.kds_order_tickets USING btree (station_id);
CREATE INDEX ix_kds_order_tickets_tenant_id ON public.kds_order_tickets USING btree (tenant_id);


-- public.kds_ticket_items definition

-- Drop table

-- DROP TABLE public.kds_ticket_items;

CREATE TABLE public.kds_ticket_items (
	ticket_id int8 NOT NULL,
	order_item_id int8 NOT NULL,
	station_id int8 NULL,
	item_name varchar(300) NOT NULL,
	quantity int4 NOT NULL,
	prepared_quantity int4 NOT NULL,
	status varchar(30) NOT NULL,
	variant_name varchar(200) NULL,
	addons jsonb NOT NULL,
	preparation_notes text NULL,
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	created_by int8 NULL,
	updated_by int8 NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	is_deleted bool NOT NULL,
	CONSTRAINT kds_ticket_items_pkey PRIMARY KEY (id),
	CONSTRAINT kds_ticket_items_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON DELETE CASCADE,
	CONSTRAINT kds_ticket_items_station_id_fkey FOREIGN KEY (station_id) REFERENCES public.kitchen_stations(id) ON DELETE CASCADE,
	CONSTRAINT kds_ticket_items_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.kds_order_tickets(id) ON DELETE CASCADE
);
CREATE INDEX ix_kds_ticket_items_id ON public.kds_ticket_items USING btree (id);
CREATE INDEX ix_kds_ticket_items_order_item_id ON public.kds_ticket_items USING btree (order_item_id);
CREATE INDEX ix_kds_ticket_items_station_id ON public.kds_ticket_items USING btree (station_id);
CREATE INDEX ix_kds_ticket_items_tenant_id ON public.kds_ticket_items USING btree (tenant_id);
CREATE INDEX ix_kds_ticket_items_ticket_id ON public.kds_ticket_items USING btree (ticket_id);


-- public.kot_items definition

-- Drop table

-- DROP TABLE public.kot_items;

CREATE TABLE public.kot_items (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	kot_id int8 NOT NULL,
	item_name varchar(200) NOT NULL,
	quantity int4 DEFAULT 1 NOT NULL,
	status varchar(50) DEFAULT 'PREPARING'::character varying NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT kot_items_pkey PRIMARY KEY (id),
	CONSTRAINT kot_items_status_check CHECK (((status)::text = ANY ((ARRAY['PREPARING'::character varying, 'READY'::character varying, 'SERVED'::character varying, 'CANCELLED'::character varying])::text[]))),
	CONSTRAINT kot_items_kot_id_fkey FOREIGN KEY (kot_id) REFERENCES public.kots(id) ON DELETE CASCADE,
	CONSTRAINT kot_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_kot_items_kot ON public.kot_items USING btree (tenant_id, kot_id);


-- public.pg_rent_records definition

-- Drop table

-- DROP TABLE public.pg_rent_records;

CREATE TABLE public.pg_rent_records (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	resident_id int8 NOT NULL,
	rent_month varchar(7) NOT NULL,
	amount numeric(12, 2) NOT NULL,
	paid_amount numeric(12, 2) DEFAULT 0.00 NOT NULL,
	status varchar(50) DEFAULT 'UNPAID'::character varying NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT pg_rent_records_pkey PRIMARY KEY (id),
	CONSTRAINT pg_rent_records_status_check CHECK (((status)::text = ANY ((ARRAY['UNPAID'::character varying, 'PARTIALLY_PAID'::character varying, 'PAID'::character varying, 'OVERDUE'::character varying])::text[]))),
	CONSTRAINT pg_rent_records_resident_id_fkey FOREIGN KEY (resident_id) REFERENCES public.pg_residents(id) ON DELETE CASCADE,
	CONSTRAINT pg_rent_records_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_pg_rent_records_lookup ON public.pg_rent_records USING btree (tenant_id, resident_id, status);


-- public.user_roles definition

-- Drop table

-- DROP TABLE public.user_roles;

CREATE TABLE public.user_roles (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	user_id int8 NOT NULL,
	role_id int8 NOT NULL,
	branch_id int8 NULL,
	company_id int8 NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT user_roles_pkey PRIMARY KEY (id),
	CONSTRAINT user_roles_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL,
	CONSTRAINT user_roles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL,
	CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE,
	CONSTRAINT user_roles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
	CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_user_roles_lookup ON public.user_roles USING btree (tenant_id, user_id, role_id);


-- public.user_sessions definition

-- Drop table

-- DROP TABLE public.user_sessions;

CREATE TABLE public.user_sessions (
	id bigserial NOT NULL,
	tenant_id int8 NOT NULL,
	user_id int8 NOT NULL,
	refresh_token_hash varchar(255) NOT NULL,
	device_info jsonb DEFAULT '{}'::jsonb NULL,
	ip_address varchar(50) NULL,
	user_agent varchar(500) NULL,
	is_active bool DEFAULT true NOT NULL,
	expires_at timestamptz NOT NULL,
	last_used_at timestamptz NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_by int8 NULL,
	is_deleted bool DEFAULT false NOT NULL,
	updated_by int8 NULL,
	CONSTRAINT user_sessions_pkey PRIMARY KEY (id),
	CONSTRAINT user_sessions_refresh_token_hash_key UNIQUE (refresh_token_hash),
	CONSTRAINT user_sessions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
	CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_user_sessions_lookup ON public.user_sessions USING btree (tenant_id, user_id, is_active);