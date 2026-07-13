-- Sample data used by the completed Project 26 deployment.

INSERT INTO products (id, name, price, category, image_url) VALUES
    (1, 'Wireless Headphones', 2999.00, 'Electronics', 'headphones'),
    (2, 'Smart Watch', 4999.00, 'Electronics', 'watch'),
    (3, 'Running Shoes', 2499.00, 'Fashion', 'shoes'),
    (4, 'Backpack', 1499.00, 'Accessories', 'backpack'),
    (5, 'Desk Lamp', 999.00, 'Home', 'lamp'),
    (6, 'Bluetooth Speaker', 1999.00, 'Electronics', 'speaker')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    category = EXCLUDED.category,
    image_url = EXCLUDED.image_url;

SELECT setval(
    pg_get_serial_sequence('products', 'id'),
    COALESCE((SELECT MAX(id) FROM products), 1),
    true
);
