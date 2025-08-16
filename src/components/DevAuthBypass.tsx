
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DevAuthBypass = () => {
  useEffect(() => {
    const createTempUser = async () => {
      // Check if we already have a session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) return;

      try {
        // Create a temporary user for development
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error('Error creating temp user:', error);
        } else {
          console.log('Created temporary user session for development');
        }
      } catch (error) {
        console.error('Auth bypass error:', error);
      }
    };

    createTempUser();
  }, []);

  return null;
};

export default DevAuthBypass;
