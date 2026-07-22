export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Tables {
  profiles: {
    Row: {
      user_id: string
      display_name: string | null
      email: string | null
      phone: string | null
      country: string | null
      photo_url: string | null
      bio: string | null
      created_at: string
      updated_at: string
    }
    Insert: {
      user_id: string
      display_name?: string | null
      email?: string | null
      phone?: string | null
      country?: string | null
      photo_url?: string | null
      bio?: string | null
      created_at?: string
      updated_at?: string
    }
    Update: {
      display_name?: string | null
      email?: string | null
      phone?: string | null
      country?: string | null
      photo_url?: string | null
      bio?: string | null
      updated_at?: string
    }
  }

  muro_posts: {
    Row: {
      id: string
      user_id: string | null
      author_name: string | null
      content: string
      image_url: string | null
      category: string | null
      is_pinned: boolean
      created_at: string
      updated_at: string
      comunidad_id: string | null
    }
    Insert: {
      user_id?: string | null
      author_name?: string | null
      content: string
      image_url?: string | null
      category?: string | null
      is_pinned?: boolean
      created_at?: string
      updated_at?: string
      comunidad_id?: string | null
    }
    Update: {
      content?: string
      image_url?: string | null
      category?: string | null
      is_pinned?: boolean
      updated_at?: string
      comunidad_id?: string | null
    }
  }

  muro_replies: {
    Row: {
      id: string
      post_id: string
      user_id: string | null
      author_name: string | null
      content: string
      created_at: string
    }
    Insert: {
      post_id: string
      user_id?: string | null
      author_name?: string | null
      content: string
      created_at?: string
    }
    Update: {
      content?: string
    }
  }

  reactions: {
    Row: {
      id: string
      target_type: string
      target_id: string
      user_id: string
      emoji: string
      created_at: string
    }
    Insert: {
      target_type: string
      target_id: string
      user_id: string
      emoji: string
      created_at?: string
    }
  }

  comunidades: {
    Row: {
      id: string
      name: string
      description: string | null
      photo_url: string | null
      cover_url: string | null
      created_by: string
      is_public: boolean
      category: string | null
      member_count: number
      created_at: string
      updated_at: string
    }
    Insert: {
      name: string
      description?: string | null
      photo_url?: string | null
      cover_url?: string | null
      created_by: string
      is_public?: boolean
      category?: string | null
      member_count?: number
      created_at?: string
      updated_at?: string
    }
    Update: {
      name?: string
      description?: string | null
      photo_url?: string | null
      cover_url?: string | null
      is_public?: boolean
      category?: string | null
      member_count?: number
      updated_at?: string
    }
  }

  comunidad_members: {
    Row: {
      id: string
      comunidad_id: string
      user_id: string
      role: 'admin' | 'moderator' | 'member'
      joined_at: string
    }
    Insert: {
      comunidad_id: string
      user_id: string
      role?: 'admin' | 'moderator' | 'member'
      joined_at?: string
    }
    Update: {
      role?: 'admin' | 'moderator' | 'member'
    }
  }

  devotional_plans: {
    Row: {
      id: string
      title: string
      description: string | null
      duration: number
      is_active: boolean
      created_at: string
    }
    Insert: {
      title: string
      description?: string | null
      duration: number
      is_active?: boolean
      created_at?: string
    }
  }

  plan_devotionals: {
    Row: {
      id: string
      plan_id: string
      day_number: number
      title: string
      verse: string
      reference: string
      reflection: string
      question: string | null
      prayer: string | null
      created_at: string
    }
    Insert: {
      plan_id: string
      day_number: number
      title: string
      verse: string
      reference: string
      reflection: string
      question?: string | null
      prayer?: string | null
      created_at?: string
    }
  }

  user_plan_progress: {
    Row: {
      id: string
      user_id: string
      plan_id: string
      current_day: number
      completed_days: number[]
      started_at: string
      completed_at: string | null
    }
    Insert: {
      user_id: string
      plan_id: string
      current_day?: number
      completed_days?: number[]
      started_at?: string
      completed_at?: string | null
    }
    Update: {
      current_day?: number
      completed_days?: number[]
      completed_at?: string | null
    }
  }

  notifications: {
    Row: {
      id: string
      user_id: string
      title: string
      body: string | null
      type: string | null
      data: Json | null
      is_read: boolean
      created_at: string
    }
    Insert: {
      user_id: string
      title: string
      body?: string | null
      type?: string | null
      data?: Json | null
      is_read?: boolean
      created_at?: string
    }
  }

  devotionals: {
    Row: {
      id: string
      title: string
      verse: string
      reference: string
      reflection: string
      question: string | null
      prayer: string | null
      publish_date: string | null
      created_at: string
    }
    Insert: {
      title: string
      verse: string
      reference: string
      reflection: string
      question?: string | null
      prayer?: string | null
      publish_date?: string | null
      created_at?: string
    }
  }

  devotional_replies: {
    Row: {
      id: string
      devotional_id: string
      user_id: string
      display_name: string | null
      answer: string
      shared_to_muro: boolean
      created_at: string
    }
    Insert: {
      devotional_id: string
      user_id: string
      display_name?: string | null
      answer: string
      shared_to_muro?: boolean
      created_at?: string
    }
  }

  projects: {
    Row: {
      id: string
      title: string
      description: string | null
      image_url: string | null
      category: string | null
      max_participants: number | null
      start_date: string | null
      end_date: string | null
      is_active: boolean
      created_at: string
    }
    Insert: {
      title: string
      description?: string | null
      image_url?: string | null
      category?: string | null
      max_participants?: number | null
      start_date?: string | null
      end_date?: string | null
      is_active?: boolean
    }
  }

  project_participants: {
    Row: {
      id: string
      project_id: string
      user_id: string
      joined_at: string
    }
    Insert: {
      project_id: string
      user_id: string
      joined_at?: string
    }
  }

  testimonios_publicos: {
    Row: {
      id: string
      user_id: string
      display_name: string | null
      content: string
      public: boolean
      approved: boolean
      approved_at: string | null
      created_at: string
    }
    Insert: {
      user_id: string
      display_name?: string | null
      content: string
      public?: boolean
      approved?: boolean
      approved_at?: string | null
    }
    Update: {
      content?: string
      public?: boolean
      approved?: boolean
      approved_at?: string | null
    }
  }

  personal_journal: {
    Row: {
      id: string
      user_id: string
      content: string
      created_at: string
    }
    Insert: {
      user_id: string
      content: string
      created_at?: string
    }
  }

  user_streaks: {
    Row: {
      user_id: string
      current_streak: number
      longest_streak: number
      last_activity_date: string
      grace_day_used_this_week: boolean
      updated_at: string
    }
    Insert: {
      user_id: string
      current_streak?: number
      longest_streak?: number
      last_activity_date?: string
      grace_day_used_this_week?: boolean
      updated_at?: string
    }
    Update: {
      current_streak?: number
      longest_streak?: number
      last_activity_date?: string
      grace_day_used_this_week?: boolean
      updated_at?: string
    }
  }

  notificacion_preferences: {
    Row: {
      user_id: string
      daily_verse: boolean
      daily_phrase: boolean
      comments: boolean
      reactions: boolean
      announcements: boolean
      updated_at: string
    }
    Insert: {
      user_id: string
      daily_verse?: boolean
      daily_phrase?: boolean
      comments?: boolean
      reactions?: boolean
      announcements?: boolean
      updated_at?: string
    }
    Update: {
      daily_verse?: boolean
      daily_phrase?: boolean
      comments?: boolean
      reactions?: boolean
      announcements?: boolean
      updated_at?: string
    }
  }

  diario_entries: {
    Row: {
      id: string
      user_id: string
      entry_date: string
      evangelio: string | null
      reflexion: string | null
      que_me_dice_dios: string | null
      proposito: string | null
      estado_animo: string | null
      created_at: string
      updated_at: string
    }
    Insert: {
      user_id: string
      entry_date: string
      evangelio?: string | null
      reflexion?: string | null
      que_me_dice_dios?: string | null
      proposito?: string | null
      estado_animo?: string | null
    }
    Update: {
      evangelio?: string | null
      reflexion?: string | null
      que_me_dice_dios?: string | null
      proposito?: string | null
      estado_animo?: string | null
    }
  }

  diario_intenciones: {
    Row: {
      id: string
      user_id: string
      titulo: string
      descripcion: string | null
      estado: string
      created_at: string
      updated_at: string
    }
    Insert: {
      user_id: string
      titulo: string
      descripcion?: string | null
      estado?: string
    }
    Update: {
      titulo?: string
      descripcion?: string | null
      estado?: string
    }
  }

  diario_gratitud: {
    Row: {
      id: string
      user_id: string
      entry_date: string
      gratitud_1: string
      gratitud_2: string | null
      gratitud_3: string | null
      created_at: string
    }
    Insert: {
      user_id: string
      entry_date: string
      gratitud_1: string
      gratitud_2?: string | null
      gratitud_3?: string | null
    }
    Update: {
      gratitud_1?: string
      gratitud_2?: string | null
      gratitud_3?: string | null
    }
  }

  diario_examen: {
    Row: {
      id: string
      user_id: string
      entry_date: string
      gracias: string
      dificultad: string
      perdon: string
      proposito: string
      created_at: string
    }
    Insert: {
      user_id: string
      entry_date: string
      gracias: string
      dificultad: string
      perdon: string
      proposito: string
    }
    Update: {
      gracias?: string
      dificultad?: string
      perdon?: string
      proposito?: string
    }
  }
}

export type MuroPost = Tables['muro_posts']['Row']
export type MuroReply = Tables['muro_replies']['Row']
export type Profile = Tables['profiles']['Row']
export type Comunidad = Tables['comunidades']['Row']
export type ComunidadMember = Tables['comunidad_members']['Row']
export type Devotional = Tables['devotionals']['Row']
export type DevotionalReply = Tables['devotional_replies']['Row']
export type Notification = Tables['notifications']['Row']
export type TestimonioPublico = Tables['testimonios_publicos']['Row']
export type JournalEntry = Tables['personal_journal']['Row']
export type UserStreak = Tables['user_streaks']['Row']
export type DiarioEntry = Tables['diario_entries']['Row']
export type DiarioIntencion = Tables['diario_intenciones']['Row']
export type DiarioGratitud = Tables['diario_gratitud']['Row']
export type DiarioExamen = Tables['diario_examen']['Row']

export type MuroPostWithMeta = MuroPost & {
  author_photo?: string | null
  reply_count?: number
  reactions?: Record<string, number>
  user_reactions?: string[]
  is_owner?: boolean
}

export type ComunidadWithRole = Comunidad & {
  role?: 'admin' | 'moderator' | 'member'
  member_count?: number
}

export type MuroCategory = 'general' | 'oracion' | 'reflexion' | 'sugerencia' | 'gracias'
export type ComunidadRole = 'admin' | 'moderator' | 'member'
