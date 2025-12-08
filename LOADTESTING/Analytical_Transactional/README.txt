We simulated a high-traffic scenario where customers are aggressively purchasing inventory while administrators are simultaneously generating heavy analytical reports.

Test Plan: concurrent_test.jmx
Total Concurrent Users: 200

SCENARIOS:
1. GROUP A: Transactional Load (Shoppers)
   - Users: 150
   - Action: POST /api/orders (Purchasing Album ID 1)
   - Objective: Stress-test the OLTP database (Supabase) and Row-Level Locking mechanism during a "Flash Sale" event.

2. GROUP B: Analytical Load (Admins)
   - Users: 50
   - Action: GET /api/reports/rollup-sales (Company Level Roll-up)
   - Objective: Stress-test the Local OLAP Warehouse to ensure reports remain accessible even during high transactional load.

EXECUTION COMMAND:
jmeter -n -t concurrent_test.jmx -l test_results.csv -e -o ./final_report_html
