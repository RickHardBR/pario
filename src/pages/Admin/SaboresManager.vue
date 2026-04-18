<template>
  <div class="sabores-manager">
    <div class="manager-header">
      <h1>Gerenciar Sabores de Bebidas</h1>
      <button @click="showAddForm = !showAddForm" class="btn btn--primary">
        ➕ Novo Sabor
      </button>
    </div>

    <!-- Formulário de Adicionar Sabor -->
    <div v-if="showAddForm" class="add-form">
      <h2>Adicionar Novo Sabor</h2>
      <form @submit.prevent="saveSabor" class="form">
        <div class="form-group">
          <label>Bebida</label>
          <select v-model="formData.product_id" required>
            <option value="">Selecione a bebida</option>
            <option v-for="bebida in targetBebidas" :key="bebida.id" :value="bebida.id">
              {{ bebida.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Nome do Sabor</label>
          <input v-model="formData.name" type="text" placeholder="Ex: Uva" required />
        </div>

        <div class="form-group checkbox">
          <input v-model="formData.is_active" type="checkbox" id="ativo" />
          <label for="ativo">Ativo (Visível na página de compras)</label>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn--primary">Adicionar Sabor</button>
          <button type="button" @click="showAddForm = false" class="btn btn--secondary">Cancelar</button>
        </div>
      </form>
    </div>

    <!-- Lista Agrupada -->
    <div class="sabores-list">
      <div v-for="bebida in targetBebidas" :key="bebida.id" class="bebida-group">
        <h2>Sabores de {{ bebida.name }}</h2>
        
        <table class="data-table">
          <thead>
            <tr>
              <th>Sabor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sabor in getSaboresPorBebida(bebida.id)" :key="sabor.id">
              <td>{{ sabor.name }}</td>
              <td>
                <label class="switch">
                  <input type="checkbox" v-model="sabor.is_active" @change="toggleSaborVisibility(sabor)" />
                  <span class="slider round"></span>
                </label>
              </td>
              <td>
                <button @click="deleteSabor(sabor.id)" class="btn btn--danger btn--small">
                  🗑️ Deletar
                </button>
              </td>
            </tr>
            <tr v-if="getSaboresPorBebida(bebida.id).length === 0">
              <td colspan="3" class="text-center">Nenhum sabor cadastrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../services/supabaseClient';

const sabores = ref([]);
const produtosBebida = ref([]);
const showAddForm = ref(false);

const formData = ref({
  product_id: '',
  name: '',
  is_active: true
});

const targetBebidas = computed(() => {
  return produtosBebida.value.filter(p => p.name === 'Suco Natural' || p.name === 'Soda Italiana');
});

const getSaboresPorBebida = (productId) => {
  return sabores.value.filter(s => s.product_id === productId);
};

const carregarDados = async () => {
  // Carrega produtos para podermos achar Suco e Soda
  const { data: prods } = await supabase.from('products').select('id, name');
  if (prods) produtosBebida.value = prods;

  // Carrega todos os sabores
  const { data: sab } = await supabase.from('sabores_bebidas').select('*').order('name');
  if (sab) sabores.value = sab;
};

const saveSabor = async () => {
  try {
    const { error } = await supabase.from('sabores_bebidas').insert([{
      product_id: formData.value.product_id,
      name: formData.value.name,
      is_active: formData.value.is_active
    }]);

    if (error) throw error;
    
    showAddForm.value = false;
    formData.value = { product_id: '', name: '', is_active: true };
    await carregarDados();
    alert('Sabor salvo com sucesso!');
  } catch (err) {
    alert('Erro ao salvar sabor: ' + err.message);
  }
};

const toggleSaborVisibility = async (sabor) => {
  try {
    const { error } = await supabase
      .from('sabores_bebidas')
      .update({ is_active: sabor.is_active })
      .eq('id', sabor.id);
    if (error) throw error;
  } catch (err) {
    alert('Erro ao atualizar sabor: ' + err.message);
    sabor.is_active = !sabor.is_active;
  }
};

const deleteSabor = async (id) => {
  if (!confirm('Deseja realmente excluir este sabor?')) return;

  try {
    const { error } = await supabase.from('sabores_bebidas').delete().eq('id', id);
    if (error) throw error;
    await carregarDados();
  } catch (err) {
    alert('Erro ao excluir: ' + err.message);
  }
};

onMounted(() => {
  carregarDados();
});
</script>

<style scoped>
.sabores-manager { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
.manager-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 2px solid #E0E0E0; padding-bottom: 20px;}
.manager-header h1 { font-size: 28px; color: #D4511A; margin: 0; }
.add-form { background-color: #F8F6F3; border-radius: 12px; padding: 24px; margin-bottom: 40px; border-left: 4px solid #D4511A; }
.add-form h2 { margin-top: 0; }
.form { display: flex; flex-direction: column; gap: 15px; max-width: 500px;}
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group input, .form-group select { padding: 10px; border: 1px solid #ccc; border-radius: 6px; }
.form-group.checkbox { flex-direction: row; align-items: center; }
.form-group.checkbox input { width: 16px; height: 16px; }
.form-actions { display: flex; gap: 10px; margin-top: 10px; }
.bebida-group { margin-bottom: 40px; }
.bebida-group h2 { color: #333; margin-bottom: 15px; }
.data-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.data-table th, .data-table td { padding: 15px; text-align: left; border-bottom: 1px solid #eee; }
.data-table th { background-color: #f9f9f9; font-weight: 600; }
.text-center { text-align: center; color: #666; }
.status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
.status-badge.active { background: #e8f5e9; color: #2e7d32; }
.status-badge.inactive { background: #ffebee; color: #c62828; }
.btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn--primary { background: linear-gradient(135deg, #FFD700, #E6C200); color: black; }
.btn--secondary { background: #666; color: white; }
.btn--danger { background: #c62828; color: white; }
.btn--small { padding: 5px 10px; font-size: 12px; }

/* Switch Toggle CSS */
.switch { position: relative; display: inline-block; width: 50px; height: 26px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #c62828; transition: .4s; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 4px; bottom: 4px; background-color: white; transition: .4s; }
input:checked + .slider { background-color: #2e7d32; }
input:focus + .slider { box-shadow: 0 0 1px #2e7d32; }
input:checked + .slider:before { transform: translateX(24px); }
.slider.round { border-radius: 34px; }
.slider.round:before { border-radius: 50%; }
</style>
