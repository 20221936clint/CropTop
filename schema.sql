-- CropTop Database Schema
-- Updated to match Supabase dump schema

-- ============================================
-- SCHEMAS
-- ============================================
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS realtime;
CREATE SCHEMA IF NOT EXISTS graphql;
CREATE SCHEMA IF NOT EXISTS graphql_public;
CREATE SCHEMA IF NOT EXISTS vault;
CREATE SCHEMA IF NOT EXISTS pgbouncer;

-- ============================================
-- USERS TABLE (Public)
-- ============================================
CREATE TABLE IF NOT EXISTS app_3704573dd8_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    farm_name TEXT NOT NULL,
    location TEXT NOT NULL,
    total_hectares NUMERIC(10,2) NOT NULL,
    phone_number TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    membership_status TEXT DEFAULT 'active',
    membership_valid_until DATE DEFAULT '2025-12-31',
    CONSTRAINT app_3704573dd8_users_membership_status_check CHECK ((membership_status = ANY (ARRAY['active'::text, 'inactive'::text]))),
    CONSTRAINT app_3704573dd8_users_status_check CHECK ((status = ANY (ARRAY['active'::text, 'blocked'::text])))
);

-- ============================================
-- ADMINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS app_3704573dd8_admins (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    user_id UUID NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    username TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT app_3704573dd8_admins_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'super_admin'::text])))
);

-- ============================================
-- EQUIPMENT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS app_3704573dd8_equipment (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    equipment_name TEXT NOT NULL,
    equipment_type TEXT NOT NULL,
    member_rate NUMERIC(10,2) NOT NULL,
    non_member_rate NUMERIC(10,2) GENERATED ALWAYS AS ((member_rate * 1.15)) STORED,
    operator_rate NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL,
    total_rentals INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    photo_url TEXT,
    CONSTRAINT app_3704573dd8_equipment_status_check CHECK ((status = ANY (ARRAY['AVAILABLE'::text, 'RENTED'::text, 'MAINTENANCE'::text])))
);

-- ============================================
-- EQUIPMENT CATALOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS app_3704573dd8_equipment_catalog (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    equipment_name CHARACTER VARYING(255) NOT NULL,
    equipment_type CHARACTER VARYING(100) NOT NULL,
    description TEXT,
    daily_rate NUMERIC(10,2) DEFAULT 0 NOT NULL,
    operator_daily_rate NUMERIC(10,2) DEFAULT 0 NOT NULL,
    availability_status CHARACTER VARYING(50) DEFAULT 'available',
    image_url TEXT,
    specifications JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- MEMBER RENTAL REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS app_3704573dd8_member_rental_requests (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    user_id UUID NOT NULL,
    user_name TEXT NOT NULL,
    equipment_id UUID NOT NULL,
    equipment_name TEXT NOT NULL,
    equipment_type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    equipment_cost NUMERIC(10,2) NOT NULL,
    operator_salary NUMERIC(10,2) NOT NULL,
    total_cost NUMERIC(10,2) NOT NULL,
    purpose TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reschedule_reason TEXT,
    return_date TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT
);

-- ============================================
-- MEMBER RENTAL ACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS app_3704573dd8_member_rental_actions (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    rental_request_id UUID NOT NULL,
    user_id UUID NOT NULL,
    user_name TEXT NOT NULL,
    action_type TEXT NOT NULL,
    reason TEXT NOT NULL,
    new_start_date DATE,
    new_end_date DATE,
    status TEXT DEFAULT 'PENDING',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- EQUIPMENT RENTAL REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS app_3704573dd8_equipment_rental_requests (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    user_id UUID NOT NULL,
    equipment_id UUID NOT NULL,
    equipment_name CHARACTER VARYING(255) NOT NULL,
    equipment_type CHARACTER VARYING(100) NOT NULL,
    rental_start_date DATE NOT NULL,
    rental_end_date DATE NOT NULL,
    number_of_days INTEGER NOT NULL,
    equipment_cost NUMERIC(10,2) DEFAULT 0 NOT NULL,
    operator_salary NUMERIC(10,2) DEFAULT 0 NOT NULL,
    total_cost NUMERIC(10,2) DEFAULT 0 NOT NULL,
    purpose TEXT NOT NULL,
    status CHARACTER VARYING(50) DEFAULT 'pending',
    admin_notes TEXT,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    returned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_rental_dates CHECK (rental_end_date > rental_start_date)
);

-- ============================================
-- EQUIPMENT RENTAL HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS app_3704573dd8_equipment_rental_history (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    rental_request_id UUID NOT NULL,
    user_id UUID NOT NULL,
    equipment_id UUID NOT NULL,
    action_type CHARACTER VARYING(50) NOT NULL,
    action_by UUID NOT NULL,
    action_notes TEXT,
    action_timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- NON-MEMBER RENTALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS app_3704573dd8_non_member_rentals (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    customer_name CHARACTER VARYING(255) NOT NULL,
    phone CHARACTER VARYING(50) NOT NULL,
    address TEXT NOT NULL,
    equipment_id UUID NOT NULL,
    equipment_name CHARACTER VARYING(255),
    equipment_type CHARACTER VARYING(100),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    operator_salary NUMERIC(10,2) NOT NULL,
    equipment_cost NUMERIC(10,2) NOT NULL,
    total_cost NUMERIC(10,2) NOT NULL,
    purpose TEXT NOT NULL,
    status CHARACTER VARYING(20) DEFAULT 'Return',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================
-- FERTILIZER TYPES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS app_3704573dd8_fertilizer_types (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    fertilizer_name CHARACTER VARYING(255) NOT NULL,
    description TEXT,
    unit CHARACTER VARYING(50) DEFAULT 'kg',
    stock_quantity NUMERIC(10,2) DEFAULT 0,
    unit_price NUMERIC(10,2),
    status CHARACTER VARYING(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================
-- FERTILIZER DISTRIBUTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS app_3704573dd8_fertilizer_distributions (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    user_id UUID NOT NULL,
    fertilizer_type_id UUID NOT NULL,
    quantity_kg NUMERIC(10,2) NOT NULL,
    distribution_date DATE NOT NULL,
    purpose TEXT,
    status CHARACTER VARYING(50) DEFAULT 'distributed',
    distributed_by UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================
-- FERTILIZER DISTRIBUTION TABLE (Legacy)
-- ============================================
CREATE TABLE IF NOT EXISTS app_3704573dd8_fertilizer_distribution (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    user_id UUID NOT NULL,
    fertilizer_type TEXT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL,
    distribution_date DATE NOT NULL,
    purpose TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    photo_url TEXT,
    product_photo_url TEXT,
    received_photo_url TEXT
);

-- ============================================
-- USER CROPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS app_3704573dd8_user_crops (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    user_id UUID NOT NULL,
    crop_name CHARACTER VARYING(255) NOT NULL,
    variety CHARACTER VARYING(255),
    area_planted NUMERIC(10,2) NOT NULL,
    planting_date DATE NOT NULL,
    expected_harvest_date DATE,
    notes TEXT,
    status CHARACTER VARYING(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expected_harvest_quantity NUMERIC(10,2),
    harvest_unit CHARACTER VARYING(50),
    photo_url TEXT
);

-- ============================================
-- MEMBERSHIP FEE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS app_3704573dd8_membership_fee (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    annual_fee NUMERIC(10,2) DEFAULT 550.00 NOT NULL,
    valid_until_default DATE DEFAULT '2025-12-31'::date NOT NULL,
    benefits TEXT[] DEFAULT ARRAY['Access to Equipment Rentals|Rent agricultural equipment at member rates', 'Fertilizer Distribution|Receive subsidized fertilizers for your crops', 'Training & Workshops|Participate in agricultural training programs', 'Market Access|Connect with buyers and access better market prices', 'Technical Support|Get expert advice on crop management and farming practices'] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS app_3704573dd8_announcements (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    message TEXT NOT NULL,
    admin_name TEXT,
    admin_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT app_3704573dd8_announcements_category_check CHECK ((category = ANY (ARRAY['general'::text, 'meeting'::text, 'event'::text, 'notice'::text, 'emergency'::text]))),
    CONSTRAINT app_3704573dd8_announcements_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text])))
);

-- ============================================
-- FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS app_3704573dd8_feedback (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    user_id UUID NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    admin_reply TEXT,
    admin_reply_date TIMESTAMP WITH TIME ZONE,
    is_deleted_by_user BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT app_3704573dd8_feedback_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'replied'::text])))
);

-- ============================================
-- RENTAL GUIDELINES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS app_3704573dd8_rental_guidelines (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    type TEXT NOT NULL,
    guidelines TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TRIGGER FUNCTIONS
-- ============================================

-- Function to update timestamp on equipment changes
CREATE OR REPLACE FUNCTION public.update_equipment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamp on announcements changes
CREATE OR REPLACE FUNCTION public.update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update modified column
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log rental history
CREATE OR REPLACE FUNCTION public.log_rental_history()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO app_3704573dd8_equipment_rental_history (
            rental_request_id, user_id, equipment_id, action_type, action_by, action_notes
        ) VALUES (
            NEW.id, NEW.user_id, NEW.equipment_id, 'created', NEW.user_id, 'Rental request created'
        );
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO app_3704573dd8_equipment_rental_history (
            rental_request_id, user_id, equipment_id, action_type, action_by, action_notes
        ) VALUES (
            NEW.id, NEW.user_id, NEW.equipment_id, 'status_changed', COALESCE(NEW.approved_by, NEW.user_id), 
            'Status changed from ' || OLD.status || ' to ' || NEW.status
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Equipment update timestamp trigger
CREATE TRIGGER equipment_update_timestamp BEFORE UPDATE ON app_3704573dd8_equipment 
FOR EACH ROW EXECUTE FUNCTION public.update_equipment_timestamp();

-- Equipment rental requests log history trigger
CREATE TRIGGER log_rental_history_trigger AFTER INSERT OR UPDATE ON app_3704573dd8_equipment_rental_requests 
FOR EACH ROW EXECUTE FUNCTION public.log_rental_history();

-- Announcements update trigger
CREATE TRIGGER set_announcements_updated_at BEFORE UPDATE ON app_3704573dd8_announcements 
FOR EACH ROW EXECUTE FUNCTION public.update_announcements_updated_at();

-- Admins update trigger
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON app_3704573dd8_admins 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Equipment catalog update trigger
CREATE TRIGGER update_equipment_catalog_updated_at BEFORE UPDATE ON app_3704573dd8_equipment_catalog 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Member rental requests update trigger
CREATE TRIGGER update_member_rental_requests_modtime BEFORE UPDATE ON app_3704573dd8_member_rental_requests 
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- Non-member rentals update trigger
CREATE TRIGGER update_non_member_rentals_updated_at BEFORE UPDATE ON app_3704573dd8_non_member_rentals 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Equipment rental requests update trigger
CREATE TRIGGER update_rental_requests_updated_at BEFORE UPDATE ON app_3704573dd8_equipment_rental_requests 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User crops update trigger
CREATE TRIGGER update_user_crops_updated_at BEFORE UPDATE ON app_3704573dd8_user_crops 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Users update trigger
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON app_3704573dd8_users 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE app_3704573dd8_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_3704573dd8_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_3704573dd8_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_3704573dd8_equipment_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_3704573dd8_member_rental_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_3704573dd8_member_rental_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_3704573dd8_equipment_rental_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_3704573dd8_equipment_rental_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_3704573dd8_non_member_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_3704573dd8_fertilizer_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_3704573dd8_fertilizer_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_3704573dd8_fertilizer_distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_3704573dd8_user_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_3704573dd8_membership_fee ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_3704573dd8_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_3704573dd8_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_3704573dd8_rental_guidelines ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Users policies
CREATE POLICY allow_read_users ON app_3704573dd8_users FOR SELECT USING (true);
CREATE POLICY allow_insert_users ON app_3704573dd8_users FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY allow_update_users ON app_3704573dd8_users FOR UPDATE TO authenticated, anon USING (true);
CREATE POLICY allow_delete_users ON app_3704573dd8_users FOR DELETE TO authenticated, anon USING (true);

-- Admins policies
CREATE POLICY allow_read_admins ON app_3704573dd8_admins FOR SELECT USING (true);
CREATE POLICY allow_insert_admins ON app_3704573dd8_admins FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY allow_update_admins ON app_3704573dd8_admins FOR UPDATE TO authenticated, anon USING (true);

-- Equipment policies
CREATE POLICY allow_public_read_equipment ON app_3704573dd8_equipment FOR SELECT USING (true);
CREATE POLICY allow_read_equipment ON app_3704573dd8_equipment FOR SELECT TO authenticated USING (true);
CREATE POLICY allow_read_all_equipment ON app_3704573dd8_equipment FOR SELECT USING (true);
CREATE POLICY allow_insert_equipment ON app_3704573dd8_equipment FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY allow_admin_insert_equipment ON app_3704573dd8_equipment FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY allow_update_equipment ON app_3704573dd8_equipment FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY allow_admin_update_equipment ON app_3704573dd8_equipment FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY allow_delete_equipment ON app_3704573dd8_equipment FOR DELETE TO authenticated USING (true);
CREATE POLICY allow_admin_delete_equipment ON app_3704573dd8_equipment FOR DELETE TO authenticated USING (true);

-- Equipment catalog policies
CREATE POLICY allow_manage_equipment_catalog ON app_3704573dd8_equipment_catalog TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY allow_read_equipment_catalog ON app_3704573dd8_equipment_catalog FOR SELECT TO authenticated USING (true);

-- Member rental requests policies
CREATE POLICY allow_public_read_rentals ON app_3704573dd8_member_rental_requests FOR SELECT USING (true);
CREATE POLICY allow_public_insert_rentals ON app_3704573dd8_member_rental_requests FOR INSERT WITH CHECK (true);
CREATE POLICY allow_public_update_rentals ON app_3704573dd8_member_rental_requests FOR UPDATE USING (true);
CREATE POLICY allow_users_view_own_rentals ON app_3704573dd8_member_rental_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY allow_users_insert_own_rentals ON app_3704573dd8_member_rental_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY allow_users_update_own_rentals ON app_3704573dd8_member_rental_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY idx_member_rental_requests_status ON app_3704573dd8_member_rental_requests FOR SELECT USING (true);
CREATE POLICY idx_member_rental_requests_created_at ON app_3704573dd8_member_rental_requests FOR SELECT USING (true);
CREATE POLICY idx_member_rental_requests_user_id ON app_3704573dd8_member_rental_requests FOR SELECT USING (true);

-- Member rental actions policies
CREATE POLICY allow_public_read_actions ON app_3704573dd8_member_rental_actions FOR SELECT USING (true);
CREATE POLICY allow_public_insert_actions ON app_3704573dd8_member_rental_actions FOR INSERT WITH CHECK (true);
CREATE POLICY allow_public_update_actions ON app_3704573dd8_member_rental_actions FOR UPDATE USING (true);
CREATE POLICY allow_users_view_own_actions ON app_3704573dd8_member_rental_actions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY allow_users_insert_own_actions ON app_3704573dd8_member_rental_actions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Equipment rental requests policies
CREATE POLICY allow_read_own_rental_requests ON app_3704573dd8_equipment_rental_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY allow_create_own_rental_requests ON app_3704573dd8_equipment_rental_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY allow_read_own_rental_history ON app_3704573dd8_equipment_rental_history FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY allow_insert_rental_history ON app_3704573dd8_equipment_rental_history FOR INSERT TO authenticated WITH CHECK (true);

-- Non-member rentals policies
CREATE POLICY allow_read_all_non_member_rentals ON app_3704573dd8_non_member_rentals FOR SELECT USING (true);
CREATE POLICY allow_insert_non_member_rentals ON app_3704573dd8_non_member_rentals FOR INSERT WITH CHECK (true);
CREATE POLICY allow_update_non_member_rentals ON app_3704573dd8_non_member_rentals FOR UPDATE USING (true);
CREATE POLICY allow_delete_non_member_rentals ON app_3704573dd8_non_member_rentals FOR DELETE USING (true);

-- Fertilizer types policies
CREATE POLICY allow_read_fertilizer_types ON app_3704573dd8_fertilizer_types FOR SELECT USING (true);
CREATE POLICY allow_admin_manage_fertilizer_types ON app_3704573dd8_fertilizer_types USING (true);

-- Fertilizer distributions policies
CREATE POLICY allow_read_all_distributions ON app_3704573dd8_fertilizer_distributions FOR SELECT USING (true);
CREATE POLICY allow_admin_insert_distributions ON app_3704573dd8_fertilizer_distributions FOR INSERT WITH CHECK (true);
CREATE POLICY allow_admin_update_distributions ON app_3704573dd8_fertilizer_distributions FOR UPDATE USING (true);
CREATE POLICY allow_admin_delete_distributions ON app_3704573dd8_fertilizer_distributions FOR DELETE USING (true);

-- User crops policies
CREATE POLICY allow_view_own_crops ON app_3704573dd8_user_crops FOR SELECT USING (true);
CREATE POLICY allow_insert_own_crops ON app_3704573dd8_user_crops FOR INSERT WITH CHECK (true);
CREATE POLICY allow_update_own_crops ON app_3704573dd8_user_crops FOR UPDATE USING (true);
CREATE POLICY allow_delete_own_crops ON app_3704573dd8_user_crops FOR DELETE USING (true);

-- Membership fee policies
CREATE POLICY allow_read_membership_fee ON app_3704573dd8_membership_fee FOR SELECT USING (true);
CREATE POLICY allow_admin_modify_membership_fee ON app_3704573dd8_membership_fee USING (true) WITH CHECK (true);

-- Announcements policies
CREATE POLICY allow_read_all_announcements ON app_3704573dd8_announcements FOR SELECT USING (true);
CREATE POLICY allow_insert_announcements ON app_3704573dd8_announcements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY allow_update_own_announcements ON app_3704573dd8_announcements FOR UPDATE TO authenticated USING (true);
CREATE POLICY allow_delete_announcements ON app_3704573dd8_announcements FOR DELETE TO authenticated USING (true);

-- Feedback policies
CREATE POLICY allow_all_feedback_operations ON app_3704573dd8_feedback USING (true) WITH CHECK (true);

-- Rental guidelines policies
CREATE POLICY allow_public_read_guidelines ON app_3704573dd8_rental_guidelines FOR SELECT USING (true);
CREATE POLICY allow_public_insert_guidelines ON app_3704573dd8_rental_guidelines FOR INSERT WITH CHECK (true);
CREATE POLICY allow_public_update_guidelines ON app_3704573dd8_rental_guidelines FOR UPDATE USING (true);

-- ============================================
-- INSERT DEFAULT ADMIN (New Admin)
-- ============================================
INSERT INTO app_3704573dd8_admins (id, user_id, email, full_name, username, role, is_active)
VALUES 
    (gen_random_uuid(), 'a2417dd6-c5fa-4ec5-9669-89377d0a8cee', 'admin@croptop.com', 'CropTop Admin', 'admin', 'admin', true),
    (gen_random_uuid(), 'dee99f7d-236d-46dd-abab-d53e0929f036', 'manager@croptop.com', 'Manager', 'manager', 'admin', true);

-- ============================================
-- INSERT MEMBERSHIP FEE DEFAULT
-- ============================================
INSERT INTO app_3704573dd8_membership_fee (annual_fee, valid_until_default)
VALUES (550.00, '2025-12-31');

-- ============================================
-- INSERT SAMPLE ANNOUNCEMENTS
-- ============================================
INSERT INTO app_3704573dd8_announcements (title, category, priority, message, admin_name, admin_id)
VALUES 
    ('Welcome to CropTop!', 'general', 'medium', 'Welcome to the CropTop Agricultural MPC Information System. Contact admin for assistance.', 'Admin', 'system'),
    ('Equipment Available for Rental', 'notice', 'low', 'All equipment is now available for member rental. Contact admin to book.', 'Admin', 'system'),
    ('Monthly Meeting', 'meeting', 'high', 'General assembly every first Saturday of the month at 2PM.', 'Admin', 'system');

-- ============================================
-- INSERT SAMPLE FERTILIZER TYPES
-- ============================================
INSERT INTO app_3704573dd8_fertilizer_types (fertilizer_name, description, unit, stock_quantity, unit_price, status)
VALUES 
    ('Urea (46-0-0)', 'High nitrogen fertilizer for vegetative growth', 'kg', 1000, 25.00, 'active'),
    ('Complete (14-14-14)', 'Balanced NPK fertilizer for general use', 'kg', 800, 30.00, 'active'),
    ('Ammonium Sulfate (21-0-0)', 'Nitrogen and sulfur fertilizer', 'kg', 600, 22.00, 'active'),
    ('Muriate of Potash (0-0-60)', 'Potassium fertilizer for fruit development', 'kg', 500, 28.00, 'active'),
    ('Organic Compost', 'Natural organic fertilizer', 'kg', 2000, 15.00, 'active');

-- ============================================
-- INSERT RENTAL GUIDELINES
-- ============================================
INSERT INTO app_3704573dd8_rental_guidelines (type, guidelines)
VALUES 
    ('MEMBER', '• Equipment must be returned in the same condition as received
• Rental period starts from the date of pickup
• Late returns will incur additional charges of ₱100 per day
• Operator services are optional and charged separately
• Damage or loss of equipment will be charged to the renter
• Advance booking is required at least 3 days before rental date');

-- ============================================
-- INSERT SAMPLE EQUIPMENT
-- ============================================
INSERT INTO app_3704573dd8_equipment (equipment_name, equipment_type, member_rate, operator_rate, status, total_rentals)
VALUES 
    ('Tractor', 'Vehicle', 1500.00, 250.00, 'AVAILABLE', 0),
    ('Corn Harvester', 'Harvester', 2500.00, 250.00, 'AVAILABLE', 0),
    ('Hand Cart', '2 wheels', 50.00, 0.00, 'AVAILABLE', 0),
    ('Wheelbarrow', 'none', 50.00, 0.00, 'AVAILABLE', 0),
    ('Corn Sheller', 'Machine', 500.00, 150.00, 'AVAILABLE', 0),
    ('Casava Chipper', 'Machine', 1500.00, 250.00, 'AVAILABLE', 0),
    ('Solar Dryer', 'Agricultural', 350.00, 0.00, 'AVAILABLE', 0);

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON app_3704573dd8_users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON app_3704573dd8_users(username);
CREATE INDEX IF NOT EXISTS idx_users_membership_status ON app_3704573dd8_users(membership_status);
CREATE INDEX IF NOT EXISTS idx_users_membership_valid_until ON app_3704573dd8_users(membership_valid_until);
CREATE INDEX IF NOT EXISTS idx_admins_email ON app_3704573dd8_admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON app_3704573dd8_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON app_3704573dd8_admins(is_active);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON app_3704573dd8_equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_type ON app_3704573dd8_equipment(equipment_type);
CREATE INDEX IF NOT EXISTS idx_equipment_created ON app_3704573dd8_equipment(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_equipment_catalog_status ON app_3704573dd8_equipment_catalog(availability_status);
CREATE INDEX IF NOT EXISTS idx_equipment_catalog_type ON app_3704573dd8_equipment_catalog(equipment_type);
CREATE INDEX IF NOT EXISTS idx_member_rental_requests_status ON app_3704573dd8_member_rental_requests(status);
CREATE INDEX IF NOT EXISTS idx_member_rental_requests_created_at ON app_3704573dd8_member_rental_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_member_rental_requests_user_id ON app_3704573dd8_member_rental_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON app_3704573dd8_feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON app_3704573dd8_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON app_3704573dd8_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON app_3704573dd8_announcements(category);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON app_3704573dd8_announcements(priority);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON app_3704573dd8_announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fertilizer_types_status ON app_3704573dd8_fertilizer_types(status);
CREATE INDEX IF NOT EXISTS idx_user_crops_user_id ON app_3704573dd8_user_crops(user_id);
CREATE INDEX IF NOT EXISTS idx_user_crops_status ON app_3704573dd8_user_crops(status);
CREATE INDEX IF NOT EXISTS idx_user_crops_created_at ON app_3704573dd8_user_crops(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rental_history_request ON app_3704573dd8_equipment_rental_history(rental_request_id);
CREATE INDEX IF NOT EXISTS idx_rental_history_timestamp ON app_3704573dd8_equipment_rental_history(action_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_rental_history_user ON app_3704573dd8_equipment_rental_history(user_id);
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 


    ('crop-photos', 'crop-photos', true, 10485760, ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']),
    ('fertilizer-product-photos', 'fertilizer-product-photos', true, 10485760, ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']),
    ('fertilizer-received-photos', 'fertilizer-received-photos', true, 10485760, ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;


INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'equipment-photos', 
    'equipment-photos', 
    true,
    10485760,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "allow_public_read_equipment_photos" ON storage.objects 
    FOR SELECT USING (bucket_id = 'equipment-photos');

-- Allow uploads
CREATE POLICY "allow_upload_equipment_photos" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'equipment-photos');

-- Allow updates
CREATE POLICY "allow_update_equipment_photos" ON storage.objects 
    FOR UPDATE USING (bucket_id = 'equipment-photos');

-- Allow deletes
CREATE POLICY "allow_delete_equipment_photos" ON storage.objects 
    FOR DELETE USING (bucket_id = 'equipment-photos');


-- Add FK for user_crops → users
ALTER TABLE app_3704573dd8_user_crops
ADD CONSTRAINT fk_user_crops_user
FOREIGN KEY (user_id) REFERENCES app_3704573dd8_users(id) ON DELETE CASCADE;

-- Add FK for fertilizer_distribution → users (from previous issue)
ALTER TABLE app_3704573dd8_fertilizer_distribution
ADD CONSTRAINT fk_fertilizer_distribution_user
FOREIGN KEY (user_id) REFERENCES app_3704573dd8_users(id) ON DELETE CASCADE;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

ALTER TABLE app_3704573dd8_fertilizer_distribution
ADD CONSTRAINT fertilizer_distribution_user_id_fkey
FOREIGN KEY (user_id) REFERENCES app_3704573dd8_users(id) ON DELETE CASCADE;

-- Also for the newer table (if you use it):
ALTER TABLE app_3704573dd8_fertilizer_distributions
ADD CONSTRAINT fertilizer_distributions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES app_3704573dd8_users(id) ON DELETE CASCADE;

-- And reload PostgREST schema cache:
NOTIFY pgrst, 'reload schema';
