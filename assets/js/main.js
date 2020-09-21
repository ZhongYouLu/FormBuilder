function _uuid() {
  var d = Date.now();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now(); //use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// Vue
Vue.config.devtools = true;

Vue.component('v-select', VueSelect.VueSelect);

var app = new Vue({
  el: '#app',
  components: {
    'column-form': httpVueLoader('./assets/js/vue_components/columnForm.vue'),
    'form-builder': httpVueLoader('./assets/js/vue_components/formBuilder.vue'),
  },
  data: {
    seq: 0,
    formJSON: {
      formID: 'demo',
      columns: [],
    },
    historyIdx: 0,
    history: [],
  },
  created: function () {
    this.getHistory();
  },
  computed: {
    columns: function () {
      return this.formJSON.columns;
    },
  },
  methods: {
    init: function () {
      this.formJSON = {
        formID: 'demo',
        columns: [],
      };
      // this.handleAdd();
    },
    getHistory: function () {
      var json = localStorage.getItem('formJSON-History');
      if (json) {
        this.history = JSON.parse(json);
        this.historyIdx = this.history.length - 1;
        this.formJSON = this.history[this.historyIdx].data;
      } else {
        this.init();
        this.addToHistory();
      }
    },
    addToHistory: function () {
      this.history.push({
        created: new Date().toLocaleString(),
        data: util.deepCopy(this.formJSON),
      });
      if (this.history.length > 5) this.history = this.history.slice(-5);
      this.historyIdx = this.history.length - 1;

      localStorage.setItem('formJSON-History', JSON.stringify(this.history));
    },
    restorePrev: function () {
      this.formJSON = util.deepCopy(this.history[--this.historyIdx].data);
    },
    restoreNext: function () {
      this.formJSON = util.deepCopy(this.history[++this.historyIdx].data);
    },
    getTempColumnJSON: function () {
      return {
        id: _uuid(),
        name: '', // 欄位名稱
        label: '', // 欄位說明
        subLabel: '', // 欄位說明
        type: '', // 欄位屬性
        placeholder: null, // 提示文字
        defaultValue: null, // 預設值
        autocomplete: null, // 自動完成
        data: {
          srcMode: 'list',
          displayMode: '',
          // select
          API: {
            URL: '',
            textKey: '',
            valueKey: '',
          },
          // select/radio/checkbox
          items: [
            // { text: '1', value: '1' }
          ],
        },
        // 規則
        rule: {
          required: false, // 必填
          minimum: null, // 字元下限
          maximum: null, // 字元上限
          regex: null, // 驗證格式
          sameAs: null, // 與..相符
          onlyOne: false, // 只能選擇一個 [多選框選項]
        },
        // 客製化訊息 (取代規則預設訊息)
        msg: {
          // required: null,
          // minimum: null,
          // maximum: null,
          // regex: null,
          // sameAs: null,
        },
        // 顯示條件
        conditions: [
          // {
          //   triggerID: 'babyNum',
          //   findOne: ['1', '2', '3', '4'], // 滿足其一
          //   findAll: ['1', '2', '3', '4'], // 滿足全部
          //   // other...
          // },
          // multiple..
        ],
        // 其他檢查設定
        requiredSync: [], // 連動必填元素 (如果自身有值，其元素必填)
        requiredCheck: [], // 自身必填檢查 (來自其他元素的 requiredSync)
        sameAsReverseCheck: [], // 反向相符檢查 元素值是否相符 (來自其他元素的 rule.sameAs)
      };
    },
    handleAdd: function () {
      this.formJSON.columns.push(this.getTempColumnJSON());
    },
    handleDelete: function (index) {
      this.formJSON.columns.splice(index, 1);
    },
  },
});
