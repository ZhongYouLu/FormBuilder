<template>
  <div class="select">
    <select :name="col.name" :value="col.defaultValue">
      <option value selected="selected" hidden="hidden">請選擇</option>
      <option v-for="item in col.data.items" :value="item.value" :key="item.value">{{ item.text }}</option>
    </select>
  </div>
</template>
<script>
module.exports = {
  name: 'select',
  props: {
    col: Object,
  },
};
</script>
