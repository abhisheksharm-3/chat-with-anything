export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };

      files: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string | null;
          size: number | null;
          url: string | null;
          uploaded_at: string;
          processing_status?: 'idle' | 'processing' | 'completed' | 'failed' | null;
          processing_error?: string | null;
          indexed_chunks?: number | null;
          full_text?: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type?: string | null;
          size?: number | null;
          url?: string | null;
          uploaded_at?: string;
          processing_status?: 'idle' | 'processing' | 'completed' | 'failed' | null;
          processing_error?: string | null;
          indexed_chunks?: number | null;
          full_text?: string | null;
        };
        Update: Partial<Database['public']['Tables']['files']['Insert']>;
      };

      chats: {
        Row: {
          id: string;
          user_id: string;
          file_id: string | null;
          title: string | null;
          created_at: string;
          type: 'pdf' | 'image' | 'doc' | 'video' | 'sheet' | 'slides' | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_id?: string | null;
          title?: string | null;
          created_at?: string;
          type?: 'pdf' | 'image' | 'doc' | 'video' | 'sheet' | 'slides' | null;
        };
        Update: Partial<Database['public']['Tables']['chats']['Insert']>;
      };

      messages: {
        Row: {
          id: string;
          chat_id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
    };

    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type TypeUser = Database['public']['Tables']['users']['Row'];
export type TypeChat = Database['public']['Tables']['chats']['Row'];
export type TypeFile = Database['public']['Tables']['files']['Row'];
export type TypeMessage = Database['public']['Tables']['messages']['Row'];
