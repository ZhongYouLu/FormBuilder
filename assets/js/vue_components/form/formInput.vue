<template>
  <div class="input">
    <input
      :type="col.type"
      :name="col.name"
      :value="col.defaultValue"
      :placeholder="col.placeholder"
    />
  </div>
</template>
<script>
module.exports = {
  name: 'input',
  props: {
    col: Object,
  },
};
</script>
