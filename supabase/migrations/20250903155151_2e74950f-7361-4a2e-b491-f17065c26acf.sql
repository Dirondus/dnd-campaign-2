-- Update players table to support named PDFs
-- Change pdf_urls from array of strings to array of objects with name and url

-- First, let's create a function to migrate existing data
CREATE OR REPLACE FUNCTION migrate_pdf_urls()
RETURNS VOID AS $$
DECLARE
    player_record RECORD;
    pdf_url TEXT;
    new_pdf_objects JSONB := '[]'::jsonb;
    counter INTEGER;
BEGIN
    -- Loop through all players
    FOR player_record IN SELECT id, pdf_urls FROM players WHERE pdf_urls IS NOT NULL LOOP
        new_pdf_objects := '[]'::jsonb;
        counter := 1;
        
        -- If pdf_urls is an array of strings, convert to objects
        IF jsonb_typeof(player_record.pdf_urls) = 'array' AND jsonb_array_length(player_record.pdf_urls) > 0 THEN
            FOR pdf_url IN SELECT jsonb_array_elements_text(player_record.pdf_urls) LOOP
                new_pdf_objects := new_pdf_objects || jsonb_build_object(
                    'name', 'PDF ' || counter,
                    'url', pdf_url
                );
                counter := counter + 1;
            END LOOP;
            
            -- Update the player record
            UPDATE players 
            SET pdf_urls = new_pdf_objects 
            WHERE id = player_record.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration
SELECT migrate_pdf_urls();

-- Drop the migration function as it's no longer needed
DROP FUNCTION migrate_pdf_urls();