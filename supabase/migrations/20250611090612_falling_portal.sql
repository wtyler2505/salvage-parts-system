-- Create the main parts table
CREATE TABLE parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'archived', 'maintenance')),
  condition text NOT NULL CHECK (condition IN ('new', 'used', 'salvaged', 'broken', 'refurbished')),
  location text,
  metadata jsonb DEFAULT '{}',
  specifications jsonb DEFAULT '{}',
  models jsonb DEFAULT '{}',
  components jsonb DEFAULT '[]',
  documentation jsonb DEFAULT '{}',
  simulation jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table for better organization
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  parent_id uuid REFERENCES categories(id),
  created_at timestamptz DEFAULT now()
);

-- Create manufacturers table
CREATE TABLE manufacturers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  website text,
  contact_info jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create locations table for inventory management
CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  address jsonb DEFAULT '{}',
  coordinates point,
  created_at timestamptz DEFAULT now()
);

-- Create tags table for flexible labeling
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Create part_tags junction table
CREATE TABLE part_tags (
  part_id uuid REFERENCES parts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (part_id, tag_id)
);

-- Create part_history table for audit trail
CREATE TABLE part_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id uuid REFERENCES parts(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'moved', 'status_changed')),
  changes jsonb DEFAULT '{}',
  user_id uuid,
  timestamp timestamptz DEFAULT now()
);

-- Create part_images table for media management
CREATE TABLE part_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id uuid REFERENCES parts(id) ON DELETE CASCADE,
  filename text NOT NULL,
  url text NOT NULL,
  thumbnail_url text,
  alt_text text,
  file_size integer,
  mime_type text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create part_documents table
CREATE TABLE part_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id uuid REFERENCES parts(id) ON DELETE CASCADE,
  title text NOT NULL,
  filename text NOT NULL,
  url text NOT NULL,
  document_type text CHECK (document_type IN ('datasheet', 'manual', 'schematic', 'specification', 'other')),
  file_size integer,
  mime_type text,
  created_at timestamptz DEFAULT now()
);

-- Create part_models table for 3D models
CREATE TABLE part_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id uuid REFERENCES parts(id) ON DELETE CASCADE,
  filename text NOT NULL,
  url text NOT NULL,
  model_type text CHECK (model_type IN ('primary', 'lod_high', 'lod_medium', 'lod_low', 'collision')),
  format text CHECK (format IN ('gltf', 'obj', 'stl', 'step', 'iges')),
  file_size integer,
  vertices integer,
  faces integer,
  materials jsonb DEFAULT '[]',
  animations jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_models ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can view all parts" ON parts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert parts" ON parts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update parts" ON parts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete parts" ON parts FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can view categories" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage categories" ON categories FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view manufacturers" ON manufacturers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage manufacturers" ON manufacturers FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view locations" ON locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage locations" ON locations FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view tags" ON tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage tags" ON tags FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view part_tags" ON part_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage part_tags" ON part_tags FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view part_history" ON part_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert part_history" ON part_history FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can view part_images" ON part_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage part_images" ON part_images FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view part_documents" ON part_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage part_documents" ON part_documents FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view part_models" ON part_models FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage part_models" ON part_models FOR ALL TO authenticated USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_parts_updated_at
  BEFORE UPDATE ON parts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to log part changes
CREATE OR REPLACE FUNCTION log_part_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO part_history (part_id, action, changes)
    VALUES (NEW.id, 'created', to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO part_history (part_id, action, changes)
    VALUES (NEW.id, 'updated', jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    ));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO part_history (part_id, action, changes)
    VALUES (OLD.id, 'deleted', to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for part history logging
CREATE TRIGGER log_part_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON parts
  FOR EACH ROW
  EXECUTE FUNCTION log_part_changes();

-- Create indexes for better performance
CREATE INDEX idx_parts_name ON parts USING gin(to_tsvector('english', name));
CREATE INDEX idx_parts_description ON parts USING gin(to_tsvector('english', description));
CREATE INDEX idx_parts_category ON parts(category);
CREATE INDEX idx_parts_status ON parts(status);
CREATE INDEX idx_parts_condition ON parts(condition);
CREATE INDEX idx_parts_location ON parts(location);
CREATE INDEX idx_parts_created_at ON parts(created_at);
CREATE INDEX idx_parts_updated_at ON parts(updated_at);
CREATE INDEX idx_parts_metadata ON parts USING gin(metadata);
CREATE INDEX idx_parts_specifications ON parts USING gin(specifications);

CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

CREATE INDEX idx_manufacturers_name ON manufacturers(name);

CREATE INDEX idx_locations_name ON locations(name);
CREATE INDEX idx_locations_coordinates ON locations USING gist(coordinates);

CREATE INDEX idx_tags_name ON tags(name);

CREATE INDEX idx_part_tags_part_id ON part_tags(part_id);
CREATE INDEX idx_part_tags_tag_id ON part_tags(tag_id);

CREATE INDEX idx_part_history_part_id ON part_history(part_id);
CREATE INDEX idx_part_history_timestamp ON part_history(timestamp);
CREATE INDEX idx_part_history_action ON part_history(action);

CREATE INDEX idx_part_images_part_id ON part_images(part_id);
CREATE INDEX idx_part_images_is_primary ON part_images(is_primary);

CREATE INDEX idx_part_documents_part_id ON part_documents(part_id);
CREATE INDEX idx_part_documents_type ON part_documents(document_type);

CREATE INDEX idx_part_models_part_id ON part_models(part_id);
CREATE INDEX idx_part_models_type ON part_models(model_type);
CREATE INDEX idx_part_models_format ON part_models(format);

-- Create full-text search function
CREATE OR REPLACE FUNCTION search_parts(search_query text)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  category text,
  status text,
  condition text,
  location text,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.category,
    p.status,
    p.condition,
    p.location,
    ts_rank(
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || p.category),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM parts p
  WHERE to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || p.category) 
        @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get part statistics
CREATE OR REPLACE FUNCTION get_parts_statistics()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_parts', (SELECT COUNT(*) FROM parts),
    'by_status', (
      SELECT jsonb_object_agg(status, count)
      FROM (
        SELECT status, COUNT(*) as count
        FROM parts
        GROUP BY status
      ) s
    ),
    'by_condition', (
      SELECT jsonb_object_agg(condition, count)
      FROM (
        SELECT condition, COUNT(*) as count
        FROM parts
        GROUP BY condition
      ) c
    ),
    'by_category', (
      SELECT jsonb_object_agg(category, count)
      FROM (
        SELECT category, COUNT(*) as count
        FROM parts
        GROUP BY category
        ORDER BY count DESC
        LIMIT 10
      ) cat
    ),
    'recent_activity', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'part_id', part_id,
          'action', action,
          'timestamp', timestamp
        )
      )
      FROM (
        SELECT part_id, action, timestamp
        FROM part_history
        ORDER BY timestamp DESC
        LIMIT 10
      ) recent
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;