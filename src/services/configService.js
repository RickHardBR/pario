import { supabase } from '../lib/supabaseClient';

export const configService = {
  // ==================== WHATSAPP ====================
  async getWhatsAppNumber() {
    const { data, error } = await supabase
      .from('admin_config')
      .select('whatsapp_number')
      .eq('id', 1)
      .maybeSingle();
    
    if (error) {
      console.error('Erro ao buscar número do WhatsApp:', error);
      return '5511999999999';
    }
    return data?.whatsapp_number || '5511999999999';
  },

  async setWhatsAppNumber(number) {
    const { error } = await supabase
      .from('admin_config')
      .update({ 
        whatsapp_number: number, 
        updated_at: new Date()
      })
      .eq('id', 1);
    
    if (error) {
      console.error('Erro ao salvar número do WhatsApp:', error);
      return false;
    }
    return true;
  },

  // ==================== TAXAS DE ENTREGA ====================
  async setDeliveryFee(fee) {
    const { error } = await supabase
      .from('admin_config')
      .update({ delivery_fee: fee, updated_at: new Date() })
      .eq('id', 1);
    
    if (error) {
      console.error('Erro ao salvar taxa de entrega:', error);
      return false;
    }
    return true;
  },

  async getFreeDeliveryMin() {
    const { data, error } = await supabase
      .from('admin_config')
      .select('free_delivery_min')
      .eq('id', 1)
      .maybeSingle();
    
    if (error) return 0;
    return data?.free_delivery_min ?? 0;
  },

  async setFreeDeliveryMin(min) {
    const { error } = await supabase
      .from('admin_config')
      .update({ free_delivery_min: min, updated_at: new Date() })
      .eq('id', 1);
    
    if (error) {
      console.error('Erro ao salvar valor mínimo para entrega grátis:', error);
      return false;
    }
    return true;
  },

  // ==================== TEMPO DE ENTREGA ====================
  async getDeliveryTime() {
    const { data, error } = await supabase
      .from('admin_config')
      .select('delivery_time')
      .eq('id', 1)
      .maybeSingle();
    
    if (error) return 45;
    return data?.delivery_time ?? 45;
  },

  async setDeliveryTime(time) {
    const { error } = await supabase
      .from('admin_config')
      .update({ delivery_time: time, updated_at: new Date() })
      .eq('id', 1);
    
    if (error) {
      console.error('Erro ao salvar tempo de entrega:', error);
      return false;
    }
    return true;
  },

  // ==================== MENSAGEM PERSONALIZADA ====================
  async getCustomMessage() {
    const { data, error } = await supabase
      .from('admin_config')
      .select('custom_message')
      .eq('id', 1)
      .maybeSingle();
    
    if (error) return '';
    return data?.custom_message || '';
  },

  async setCustomMessage(message) {
    const { error } = await supabase
      .from('admin_config')
      .update({ custom_message: message, updated_at: new Date() })
      .eq('id', 1);
    
    if (error) {
      console.error('Erro ao salvar mensagem personalizada:', error);
      return false;
    }
    return true;
  },

  // ==================== MÁXIMO DE DESTAQUES ====================
  async getMaxDestaques() {
    const { data, error } = await supabase
      .from('admin_config')
      .select('max_destaques')
      .eq('id', 1)
      .maybeSingle();
    
    if (error) return 10;
    return data?.max_destaques ?? 10;
  },

  async setMaxDestaques(max) {
    const { error } = await supabase
      .from('admin_config')
      .update({ max_destaques: max, updated_at: new Date() })
      .eq('id', 1);
    
    if (error) {
      console.error('Erro ao salvar máximo de destaques:', error);
      return false;
    }
    return true;
  },

  // ==================== HORÁRIO - SEGUNDA ====================
  async getMondaySchedule() {
    const { data, error } = await supabase
      .from('admin_config')
      .select('monday_open, monday_close, monday_closed')
      .eq('id', 1)
      .maybeSingle();
    
    if (error) return { open: '18:00', close: '23:00', closed: false };
    return {
      open: data?.monday_open || '18:00',
      close: data?.monday_close || '23:00',
      closed: data?.monday_closed || false
    };
  },

  async setMondaySchedule(open, close, closed) {
    const { error } = await supabase
      .from('admin_config')
      .update({ 
        monday_open: open, 
        monday_close: close, 
        monday_closed: closed,
        updated_at: new Date()
      })
      .eq('id', 1);
    
    if (error) {
      console.error('Erro ao salvar horário de segunda:', error);
      return false;
    }
    return true;
  },

  // ==================== HORÁRIO - TERÇA ====================
  async getTuesdaySchedule() {
    const { data, error } = await supabase
      .from('admin_config')
      .select('tuesday_open, tuesday_close, tuesday_closed')
      .eq('id', 1)
      .maybeSingle();
    
    if (error) return { open: '18:00', close: '23:00', closed: false };
    return {
      open: data?.tuesday_open || '18:00',
      close: data?.tuesday_close || '23:00',
      closed: data?.tuesday_closed || false
    };
  },

  async setTuesdaySchedule(open, close, closed) {
    const { error } = await supabase
      .from('admin_config')
      .update({ 
        tuesday_open: open, 
        tuesday_close: close, 
        tuesday_closed: closed,
        updated_at: new Date()
      })
      .eq('id', 1);
    
    if (error) {
      console.error('Erro ao salvar horário de terça:', error);
      return false;
    }
    return true;
  },

  // ==================== HORÁRIO - QUARTA ====================
  async getWednesdaySchedule() {
    const { data, error } = await supabase
      .from('admin_config')
      .select('wednesday_open, wednesday_close, wednesday_closed')
      .eq('id', 1)
      .maybeSingle();
    
    if (error) return { open: '18:00', close: '23:00', closed: false };
    return {
      open: data?.wednesday_open || '18:00',
      close: data?.wednesday_close || '23:00',
      closed: data?.wednesday_closed || false
    };
  },

  async setWednesdaySchedule(open, close, closed) {
    const { error } = await supabase
      .from('admin_config')
      .update({ 
        wednesday_open: open, 
        wednesday_close: close, 
        wednesday_closed: closed,
        updated_at: new Date()
      })
      .eq('id', 1);
    
    if (error) {
      console.error('Erro ao salvar horário de quarta:', error);
      return false;
    }
    return true;
  },

  // ==================== HORÁRIO - QUINTA ====================
  async getThursdaySchedule() {
    const { data, error } = await supabase
      .from('admin_config')
      .select('thursday_open, thursday_close, thursday_closed')
      .eq('id', 1)
      .maybeSingle();
    
    if (error) return { open: '18:00', close: '23:00', closed: false };
    return {
      open: data?.thursday_open || '18:00',
      close: data?.thursday_close || '23:00',
      closed: data?.thursday_closed || false
    };
  },

  async setThursdaySchedule(open, close, closed) {
    const { error } = await supabase
      .from('admin_config')
      .update({ 
        thursday_open: open, 
        thursday_close: close, 
        thursday_closed: closed,
        updated_at: new Date()
      })
      .eq('id', 1);
    
    if (error) {
      console.error('Erro ao salvar horário de quinta:', error);
      return false;
    }
    return true;
  },

  // ==================== HORÁRIO - SEXTA ====================
  async getFridaySchedule() {
    const { data, error } = await supabase
      .from('admin_config')
      .select('friday_open, friday_close, friday_closed')
      .eq('id', 1)
      .maybeSingle();
    
    if (error) return { open: '18:00', close: '23:00', closed: false };
    return {
      open: data?.friday_open || '18:00',
      close: data?.friday_close || '23:00',
      closed: data?.friday_closed || false
    };
  },

  async setFridaySchedule(open, close, closed) {
    const { error } = await supabase
      .from('admin_config')
      .update({ 
        friday_open: open, 
        friday_close: close, 
        friday_closed: closed,
        updated_at: new Date()
      })
      .eq('id', 1);
    
    if (error) {
      console.error('Erro ao salvar horário de sexta:', error);
      return false;
    }
    return true;
  },

  // ==================== HORÁRIO - SÁBADO ====================
  async getSaturdaySchedule() {
    const { data, error } = await supabase
      .from('admin_config')
      .select('saturday_open, saturday_close, saturday_closed')
      .eq('id', 1)
      .maybeSingle();
    
    if (error) return { open: '18:00', close: '23:00', closed: false };
    return {
      open: data?.saturday_open || '18:00',
      close: data?.saturday_close || '23:00',
      closed: data?.saturday_closed || false
    };
  },

  async setSaturdaySchedule(open, close, closed) {
    const { error } = await supabase
      .from('admin_config')
      .update({ 
        saturday_open: open, 
        saturday_close: close, 
        saturday_closed: closed,
        updated_at: new Date()
      })
      .eq('id', 1);
    
    if (error) {
      console.error('Erro ao salvar horário de sábado:', error);
      return false;
    }
    return true;
  },

  // ==================== HORÁRIO - DOMINGO ====================
  async getSundaySchedule() {
    const { data, error } = await supabase
      .from('admin_config')
      .select('sunday_open, sunday_close, sunday_closed')
      .eq('id', 1)
      .maybeSingle();
    
    if (error) return { open: '18:00', close: '23:00', closed: false };
    return {
      open: data?.sunday_open || '18:00',
      close: data?.sunday_close || '23:00',
      closed: data?.sunday_closed || false
    };
  },

  async setSundaySchedule(open, close, closed) {
    const { error } = await supabase
      .from('admin_config')
      .update({ 
        sunday_open: open, 
        sunday_close: close, 
        sunday_closed: closed,
        updated_at: new Date()
      })
      .eq('id', 1);
    
    if (error) {
      console.error('Erro ao salvar horário de domingo:', error);
      return false;
    }
    return true;
  },
  // ==================== HORÁRIO DE FUNCIONAMENTO ====================
async getFullSchedule() {
  const { data, error } = await supabase
    .from('admin_config')
    .select(`
      monday_open, monday_close, monday_closed,
      tuesday_open, tuesday_close, tuesday_closed,
      wednesday_open, wednesday_close, wednesday_closed,
      thursday_open, thursday_close, thursday_closed,
      friday_open, friday_close, friday_closed,
      saturday_open, saturday_close, saturday_closed,
      sunday_open, sunday_close, sunday_closed
    `)
    .eq('id', 1)
    .single();
  
  if (error) {
    console.error('Erro ao buscar horário:', error);
    return null;
  }
  
  return data;
},

isOpenNow() {
  return new Promise(async (resolve) => {
    const schedule = await this.getFullSchedule();
    if (!schedule) {
      resolve({ open: false, message: 'Horário não configurado' });
      return;
    }
    
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = domingo, 1 = segunda, etc.
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    let daySchedule;
    let dayName;
    
    switch (dayOfWeek) {
      case 1: dayName = 'monday'; daySchedule = schedule.monday_closed; break;
      case 2: dayName = 'tuesday'; daySchedule = schedule.tuesday_closed; break;
      case 3: dayName = 'wednesday'; daySchedule = schedule.wednesday_closed; break;
      case 4: dayName = 'thursday'; daySchedule = schedule.thursday_closed; break;
      case 5: dayName = 'friday'; daySchedule = schedule.friday_closed; break;
      case 6: dayName = 'saturday'; daySchedule = schedule.saturday_closed; break;
      case 0: dayName = 'sunday'; daySchedule = schedule.sunday_closed; break;
    }
    
    // Verificar se está fechado
    if (schedule[`${dayName}_closed`]) {
      resolve({ open: false, message: 'Fechado hoje' });
      return;
    }
    
    const openTime = schedule[`${dayName}_open`];
    const closeTime = schedule[`${dayName}_close`];
    
    if (!openTime || !closeTime) {
      resolve({ open: false, message: 'Horário não configurado' });
      return;
    }
    
    const isOpen = currentTime >= openTime && currentTime <= closeTime;
    const message = isOpen 
      ? `Aberto agora até ${closeTime}` 
      : `Fechado. Abre às ${openTime}`;
    
    resolve({ open: isOpen, message, openTime, closeTime });
  });
},
// ==================== TAXA DE ENTREGA ====================
async getDeliveryFee() {
  const { data, error } = await supabase
    .from('admin_config')
    .select('delivery_fee, free_delivery_min, custom_message')
    .eq('id', 1)
    .maybeSingle();
  
  if (error) {
    console.error('Erro ao buscar taxa de entrega:', error);
    return { fee: 10, freeMin: 0 };
  }
  
  return {
    fee: data?.delivery_fee ?? 10,
    freeMin: data?.free_delivery_min ?? 0,
    customMessage: data?.custom_message || 'Obrigado pela preferência!'
  };
},
  
};