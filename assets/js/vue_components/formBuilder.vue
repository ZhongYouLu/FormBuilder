<template>
  <div id="form-root">
    <form action="POST" :name="json.formID" :id="json.formID">
      <template v-for="col in json.columns">
        <div class="column" :key="col.id">
          <div class="column__label">
            <label :for="col.name">
              <div>{{ col.label }}</div>
              <div v-if="col.subLabel">{{ col.subLabel }}</div>
            </label>
          </div>
          <div class="column__field">
            <template v-if="col.type === 'text' || col.type === 'number'">
              <component :is="'form-input'" :col="col" :key="col.id"></component>
            </template>
            <template v-else>
              <component :is="'form-'+col.type" :col="col" :key="col.id"></component>
            </template>
          </div>
        </div>
      </template>
      <input type="submit" @click="validation" value="Send" />
    </form>
  </div>
</template>
<script>
module.exports = {
  props: ['json'],
  components: {
    'form-input': httpVueLoader('./form/formInput.vue'),
    'form-checkbox': httpVueLoader('./form/formCheckbox.vue'),
    'form-radio': httpVueLoader('./form/formRadio.vue'),
    'form-select': httpVueLoader('./form/formSelect.vue'),
  },
  mounted: function () {
    // formValidation.init(this.json.formID, this.json.columns);
  },
  methods: {
    validation: function (e) {
      e.preventDefault();
      e.stopPropagation();
      var result = formValidation.validation(this.json.formID);
      if (result.isPass) {
        //do something
      } else {
        alert(result.errorMsg);
      }
      console.log(formValidation.serialize(this.json.formID).replace(/&/g, '\r\n'));
      return false;
      // return result.isPass;
    },
  },
};
</script>
