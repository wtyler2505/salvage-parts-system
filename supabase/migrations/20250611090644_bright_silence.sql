-- Insert sample categories
INSERT INTO categories (name, description) VALUES
  ('Electronics', 'Electronic components and devices'),
  ('Mechanical', 'Mechanical parts and assemblies'),
  ('Automotive', 'Vehicle parts and components'),
  ('Industrial', 'Industrial equipment and machinery'),
  ('Aerospace', 'Aircraft and spacecraft components'),
  ('Marine', 'Boat and ship parts'),
  ('Medical', 'Medical device components'),
  ('Consumer', 'Consumer product parts');

-- Insert sample manufacturers
INSERT INTO manufacturers (name, website, contact_info) VALUES
  ('Ford Motor Company', 'https://ford.com', '{"phone": "+1-800-392-3673", "email": "parts@ford.com"}'),
  ('General Motors', 'https://gm.com', '{"phone": "+1-800-222-1020", "email": "parts@gm.com"}'),
  ('Toyota', 'https://toyota.com', '{"phone": "+1-800-331-4331", "email": "parts@toyota.com"}'),
  ('BMW', 'https://bmw.com', '{"phone": "+1-800-831-1117", "email": "parts@bmw.com"}'),
  ('Bosch', 'https://bosch.com', '{"phone": "+1-800-266-7424", "email": "parts@bosch.com"}'),
  ('Siemens', 'https://siemens.com', '{"phone": "+1-800-743-6367", "email": "parts@siemens.com"}'),
  ('Honeywell', 'https://honeywell.com', '{"phone": "+1-800-328-5111", "email": "parts@honeywell.com"}'),
  ('3M', 'https://3m.com', '{"phone": "+1-888-364-3577", "email": "parts@3m.com"}');

-- Insert sample locations
INSERT INTO locations (name, description, address) VALUES
  ('Warehouse A', 'Main storage facility', '{"street": "123 Industrial Blvd", "city": "Detroit", "state": "MI", "zip": "48201"}'),
  ('Warehouse B', 'Secondary storage', '{"street": "456 Storage Ave", "city": "Cleveland", "state": "OH", "zip": "44101"}'),
  ('Yard 1', 'Outdoor salvage yard', '{"street": "789 Salvage Rd", "city": "Toledo", "state": "OH", "zip": "43601"}'),
  ('Shop Floor', 'Active work area', '{"street": "321 Workshop St", "city": "Detroit", "state": "MI", "zip": "48202"}'),
  ('Quality Control', 'Inspection area', '{"street": "654 QC Lane", "city": "Detroit", "state": "MI", "zip": "48203"}');

-- Insert sample tags
INSERT INTO tags (name, color) VALUES
  ('High Value', '#EF4444'),
  ('Rare', '#F59E0B'),
  ('Popular', '#10B981'),
  ('Tested', '#3B82F6'),
  ('Certified', '#8B5CF6'),
  ('Vintage', '#F97316'),
  ('OEM', '#06B6D4'),
  ('Aftermarket', '#84CC16'),
  ('Refurbished', '#6366F1'),
  ('New Old Stock', '#EC4899');

-- Insert sample parts
INSERT INTO parts (
  name, 
  description, 
  category, 
  status, 
  condition, 
  location,
  metadata,
  specifications,
  models,
  components,
  documentation,
  simulation
) VALUES
  (
    'V8 Engine Block - 5.0L',
    'Ford Mustang GT 5.0L Coyote V8 engine block, aluminum construction',
    'Automotive',
    'active',
    'used',
    'Warehouse A',
    '{"manufacturer": "Ford", "model": "Coyote", "year": "2018", "part_number": "FR3E-6015-AA", "weight_kg": 95.5, "value_usd": 2500}',
    '{"displacement_l": 5.0, "cylinders": 8, "material": "Aluminum", "bore_mm": 92.2, "stroke_mm": 92.7, "compression_ratio": "11.0:1"}',
    '{"primary": {"url": "/models/engine-block-v8.gltf", "format": "gltf", "size_mb": 15.2}}',
    '[{"name": "Cylinder Head", "quantity": 2}, {"name": "Piston", "quantity": 8}, {"name": "Connecting Rod", "quantity": 8}]',
    '{"datasheets": [{"title": "Engine Specifications", "url": "/docs/coyote-specs.pdf"}], "manuals": [{"title": "Service Manual", "url": "/docs/coyote-service.pdf"}]}',
    '{"physics": {"mass": 95.5, "density": 2700, "friction": 0.6}, "thermal": {"operating_temp_c": {"min": -40, "max": 120}}, "electrical": {}}'
  ),
  (
    'Transmission Assembly - 6MT',
    'Manual 6-speed transmission from BMW M3, Getrag 420G',
    'Automotive',
    'active',
    'refurbished',
    'Warehouse A',
    '{"manufacturer": "BMW", "model": "M3", "year": "2015", "part_number": "23007566710", "weight_kg": 68.2, "value_usd": 3200}',
    '{"type": "Manual", "gears": 6, "max_torque_nm": 450, "gear_ratios": {"1st": 4.06, "2nd": 2.40, "3rd": 1.58, "4th": 1.19, "5th": 1.00, "6th": 0.87}}',
    '{"primary": {"url": "/models/transmission-6mt.gltf", "format": "gltf", "size_mb": 22.8}}',
    '[{"name": "Input Shaft", "quantity": 1}, {"name": "Output Shaft", "quantity": 1}, {"name": "Synchronizer", "quantity": 6}]',
    '{"datasheets": [{"title": "Transmission Specs", "url": "/docs/getrag-420g-specs.pdf"}]}',
    '{"physics": {"mass": 68.2, "density": 7850, "friction": 0.15}, "thermal": {"operating_temp_c": {"min": -30, "max": 150}}, "electrical": {}}'
  ),
  (
    'ECU Control Module',
    'Engine Control Unit for Ford EcoBoost 2.3L turbo engine',
    'Electronics',
    'active',
    'new',
    'Quality Control',
    '{"manufacturer": "Ford", "model": "EcoBoost", "year": "2020", "part_number": "JR3A-12A650-AKC", "weight_kg": 1.2, "value_usd": 850}',
    '{"processor": "32-bit ARM", "memory_mb": 4, "flash_mb": 16, "operating_voltage": "12V", "operating_current_a": 2.5, "can_bus": true}',
    '{"primary": {"url": "/models/ecu-module.gltf", "format": "gltf", "size_mb": 3.1}}',
    '[{"name": "Main PCB", "quantity": 1}, {"name": "Connector", "quantity": 3}, {"name": "Heat Sink", "quantity": 1}]',
    '{"datasheets": [{"title": "ECU Pinout", "url": "/docs/ecu-pinout.pdf"}], "software": [{"title": "Firmware v2.1", "url": "/software/ecu-fw-2.1.bin"}]}',
    '{"physics": {"mass": 1.2, "density": 1800, "friction": 0.7}, "thermal": {"operating_temp_c": {"min": -40, "max": 85}}, "electrical": {"voltage": 12, "current": 2.5, "power": 30}}'
  ),
  (
    'Hydraulic Pump Assembly',
    'High-pressure hydraulic pump for industrial machinery',
    'Industrial',
    'active',
    'used',
    'Warehouse B',
    '{"manufacturer": "Bosch", "model": "A10VSO", "year": "2019", "part_number": "R902406252", "weight_kg": 45.8, "value_usd": 4200}',
    '{"type": "Axial Piston", "displacement_cc": 140, "max_pressure_bar": 350, "max_speed_rpm": 1800, "flow_rate_lpm": 252}',
    '{"primary": {"url": "/models/hydraulic-pump.gltf", "format": "gltf", "size_mb": 18.5}}',
    '[{"name": "Piston Block", "quantity": 1}, {"name": "Valve Plate", "quantity": 1}, {"name": "Swash Plate", "quantity": 1}]',
    '{"datasheets": [{"title": "Pump Specifications", "url": "/docs/a10vso-specs.pdf"}], "manuals": [{"title": "Maintenance Manual", "url": "/docs/a10vso-maintenance.pdf"}]}',
    '{"physics": {"mass": 45.8, "density": 7200, "friction": 0.1}, "thermal": {"operating_temp_c": {"min": -20, "max": 80}}, "electrical": {}}'
  ),
  (
    'Aircraft Turbine Blade',
    'Single crystal nickel superalloy turbine blade for jet engine',
    'Aerospace',
    'active',
    'new',
    'Quality Control',
    '{"manufacturer": "Pratt & Whitney", "model": "PW1100G", "year": "2021", "part_number": "PWA1484", "weight_kg": 0.85, "value_usd": 15000}',
    '{"material": "CMSX-4", "length_mm": 127, "chord_mm": 45, "max_temp_c": 1150, "cooling_holes": 156, "coating": "TBC"}',
    '{"primary": {"url": "/models/turbine-blade.gltf", "format": "gltf", "size_mb": 8.2}}',
    '[{"name": "Blade Airfoil", "quantity": 1}, {"name": "Root Platform", "quantity": 1}, {"name": "Cooling Channels", "quantity": 12}]',
    '{"datasheets": [{"title": "Material Properties", "url": "/docs/cmsx4-properties.pdf"}], "certificates": [{"title": "Airworthiness Certificate", "url": "/certs/turbine-blade-cert.pdf"}]}',
    '{"physics": {"mass": 0.85, "density": 8600, "friction": 0.4}, "thermal": {"operating_temp_c": {"min": -60, "max": 1150}}, "electrical": {}}'
  );

-- Link parts with tags
INSERT INTO part_tags (part_id, tag_id)
SELECT p.id, t.id
FROM parts p, tags t
WHERE (p.name LIKE '%V8 Engine%' AND t.name IN ('High Value', 'Popular', 'OEM'))
   OR (p.name LIKE '%Transmission%' AND t.name IN ('High Value', 'Refurbished', 'OEM'))
   OR (p.name LIKE '%ECU%' AND t.name IN ('Tested', 'New Old Stock', 'OEM'))
   OR (p.name LIKE '%Hydraulic%' AND t.name IN ('High Value', 'Tested', 'OEM'))
   OR (p.name LIKE '%Turbine%' AND t.name IN ('High Value', 'Rare', 'Certified', 'OEM'));