-- Check if OLAP structure matches expected structure
-- If sales_fact table doesn't exist or is missing key columns, drop all OLAP objects

DO $$
BEGIN
    -- Check if sales_fact table exists and has required columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'sales_fact'
    ) OR NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sales_fact' 
        AND column_name = 'fact_id'
    ) THEN
        -- Structure doesn't match - drop all OLAP objects
        RAISE NOTICE 'OLAP structure mismatch detected - dropping all OLAP objects';
        
        -- Drop views first (handles legacy setups)
        DROP VIEW IF EXISTS company_sales_report CASCADE;
        DROP VIEW IF EXISTS album_sales_report CASCADE;
        DROP VIEW IF EXISTS monthly_sales_report CASCADE;
        DROP VIEW IF EXISTS top_customers_report CASCADE;
        DROP VIEW IF EXISTS payment_method_report CASCADE;
        DROP VIEW IF EXISTS cart_items_detailed CASCADE;
        
        DROP TABLE IF EXISTS sales_fact CASCADE;
        DROP TABLE IF EXISTS cart_items_detailed CASCADE;
        DROP TABLE IF EXISTS payment_method_report CASCADE;
        DROP TABLE IF EXISTS top_customers_report CASCADE;
        DROP TABLE IF EXISTS monthly_sales_report CASCADE;
        DROP TABLE IF EXISTS album_sales_report CASCADE;
        DROP TABLE IF EXISTS company_sales_report CASCADE;
        
        DROP FUNCTION IF EXISTS refresh_all_reports() CASCADE;
        DROP FUNCTION IF EXISTS refresh_sales_fact() CASCADE;
        DROP FUNCTION IF EXISTS refresh_cart_items_detailed() CASCADE;
        DROP FUNCTION IF EXISTS refresh_payment_method_report() CASCADE;
        DROP FUNCTION IF EXISTS refresh_top_customers_report() CASCADE;
        DROP FUNCTION IF EXISTS refresh_monthly_sales_report() CASCADE;
        DROP FUNCTION IF EXISTS refresh_album_sales_report() CASCADE;
        DROP FUNCTION IF EXISTS refresh_company_sales_report() CASCADE;
        
        RAISE NOTICE 'OLAP objects dropped - will be recreated by init script on next startup';
    ELSE
        RAISE NOTICE 'OLAP structure is correct';
    END IF;
END $$;

