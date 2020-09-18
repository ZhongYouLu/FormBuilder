<template>
  <div class="radioGroup">
    <label v-for="item in col.data.items" :key="item.value">
      <input
        type="radio"
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
  name: 'radio',
  props: {
    col: Object,
  },
};
</script>
