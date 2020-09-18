<template>
  <div class="checkboxGroup">
    <label v-for="item in col.data.items" :key="item.value">
      <input
        type="checkbox"
        :name="col.name"
        :value="item.value"
        :checked="col.defaultValue === item.value ?'checked' : null"
      />
      <span>{{ item.text }}</span>
    </label>
  </div>
</template>
<script>
module.exports = {
  name: 'checkbox',
  props: {
    col: Object,
  },
};
</script>
