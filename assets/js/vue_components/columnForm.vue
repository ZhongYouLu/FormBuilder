<template>
  <div class="card">
    <header class="card__header">
      <div class="card__drag">
        <svg viewBox="0 0 24 24">
          <path
            d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2s.9-2 2-2s2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2z"
            fill="currentColor"
          />
        </svg>
        <span>#{{idx+1}}</span>
      </div>
      <div class="text-ellipsis">{{ column.name ? column.name : column.id }}</div>
      <div class="icon-btn" @click="handleOpen">
        <template v-if="isOpen">
          <span>&#9866;</span>
        </template>
        <template v-else>
          <svg viewBox="0 0 24 24">
            <path
              d="M15.88 9.29L12 13.17L8.12 9.29a.996.996 0 1 0-1.41 1.41l4.59 4.59c.39.39 1.02.39 1.41 0l4.59-4.59a.996.996 0 0 0 0-1.41c-.39-.38-1.03-.39-1.42 0z"
              fill="currentColor"
            />
          </svg>
        </template>
      </div>
      <div class="icon-btn" @click="handleDelete">&#10006;</div>
    </header>
    <form :id="column.id" class="card__form" v-show="isOpen">
      <label class="input-row required">
        <div class="for">
          <p>欄位名稱</p>
        </div>
        <div class="field">
          <div class="input">
            <input type="text" v-model="column.name" />
          </div>
        </div>
      </label>
      <label class="input-row required">
        <div class="for">
          <p>欄位屬性</p>
        </div>
        <div class="field">
          <div class="select">
            <select v-model="column.type">
              <option value selected="selected" hidden="hidden">請選擇</option>
              <option
                v-for="item in columnType"
                :value="item.value"
                :key="item.value"
              >{{ item.text }}</option>
            </select>
          </div>
        </div>
      </label>
      <div class="border-top-dashed">
        <!-- 基本設定 -->
        <details>
          <summary>基本設定</summary>
          <div class="block block--option">
            <label class="input-row">
              <div class="for">
                <p>欄位說明</p>
              </div>
              <div class="field">
                <div class="input">
                  <input type="text" v-model="column.label" />
                </div>
              </div>
            </label>
            <label class="input-row">
              <div class="for">
                <p>欄位子說明</p>
              </div>
              <div class="field">
                <div class="input">
                  <input type="text" v-model="column.subLabel" />
                </div>
              </div>
            </label>
            <label class="input-row">
              <div class="for">
                <p>預設值</p>
              </div>
              <div class="field">
                <div class="input">
                  <input type="text" v-model="column.defaultValue" />
                </div>
              </div>
            </label>
            <label class="input-row">
              <div class="for">
                <p>提示文字</p>
              </div>
              <div class="field">
                <div class="input">
                  <input type="text" v-model="column.placeholder" />
                </div>
              </div>
            </label>
            <label class="input-row" v-if="isInput">
              <div class="for">
                <p>自動完成</p>
              </div>
              <div class="field">
                <div class="input">
                  <input type="text" v-model="column.autocomplete" />
                </div>
              </div>
            </label>
          </div>
        </details>
        <!-- 項目 -->
        <details v-if="needItems">
          <summary>項目</summary>
          <div class="block block--items">
            <label class="input-row required">
              <div class="for">
                <p>資料來源</p>
              </div>
              <div class="field">
                <div class="select">
                  <select v-model="column.data.srcMode">
                    <option value selected="selected" hidden="hidden">請選擇</option>
                    <option
                      v-for="item in sourceMode"
                      :value="item.value"
                      :key="item.value"
                    >{{ item.text }}</option>
                  </select>
                </div>
              </div>
            </label>
            <template v-if="column.data.srcMode === 'api'">
              <label class="input-row">
                <div class="for">
                  <p>API URL</p>
                </div>
                <div class="field">
                  <div class="input">
                    <input type="text" v-model="column.data.API.URL" />
                  </div>
                </div>
              </label>
              <label class="input-row">
                <div class="for">
                  <p>Value Key</p>
                </div>
                <div class="field">
                  <div class="input">
                    <input type="text" v-model="column.data.API.textKey" />
                  </div>
                </div>
              </label>
              <label class="input-row">
                <div class="for">
                  <p>Text Key</p>
                </div>
                <div class="field">
                  <div class="input">
                    <input type="text" v-model="column.data.API.valueKey" />
                  </div>
                </div>
              </label>
            </template>
            <template v-else>
              <table class="table table-striped" v-if="column.data.items.length">
                <thead class="thead-dark">
                  <tr>
                    <th scope="col"></th>
                    <th scope="col">idx</th>
                    <th scope="col">Text</th>
                    <th scope="col">Value</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody
                  is="draggable"
                  v-model="column.data.items"
                  animation="300"
                  ghostClass="ghost"
                  handle=".item__drag"
                  tag="tbody"
                >
                  <tr v-for="(item,idx) in column.data.items" :key="item.id">
                    <td scope="row">
                      <div class="icon-btn item__drag">
                        <svg viewBox="0 0 24 24">
                          <path
                            d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2s.9-2 2-2s2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    </td>
                    <td>{{idx+1}}</td>
                    <td>
                      <div class="input">
                        <input type="text" v-model="item.text" />
                      </div>
                    </td>
                    <td>
                      <div class="input">
                        <input type="text" v-model="item.value" />
                      </div>
                    </td>
                    <td>
                      <div @click="deleteItem(idx)" class="icon-btn">&#10006;</div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="vrb btn btn--add" @click="addItem">&#10010;</div>
            </template>
          </div>
        </details>
        <!-- 規則 -->
        <details>
          <summary>規則</summary>
          <div class="block block--rule">
            <label class="input-row">
              <div class="for">
                <p>是否必填</p>
              </div>
              <div class="field">
                <div class="radio-row">
                  <label>
                    <input type="radio" v-model="column.rule.required" value="1" />
                    <span>是</span>
                  </label>
                  <label>
                    <input type="radio" v-model="column.rule.required" value="0" />
                    <span>否</span>
                  </label>
                </div>
              </div>
            </label>
            <label class="input-row">
              <div class="for">
                <p>與...相符</p>
              </div>
              <div class="field">
                <div class="input">
                  <input type="text" v-model="column.rule.sameAs" />
                </div>
              </div>
            </label>
            <label class="input-row" v-if="isInput">
              <div class="for">
                <p>字元限制</p>
              </div>
              <div class="field">
                <div class="input-row inline">
                  <div class="input">
                    <input type="number" v-model="column.rule.minimum" />
                  </div>
                  <span>~</span>
                  <div class="input">
                    <input type="number" v-model="column.rule.maximum" />
                  </div>
                </div>
              </div>
            </label>
            <label class="input-row" v-if="isInput">
              <div class="for">
                <p>驗證格式</p>
              </div>
              <div class="field">
                <div class="input">
                  <input type="text" v-model="column.rule.regex" />
                </div>
              </div>
            </label>
            <!-- <label class="input-row" v-if="column.type=='checkbox'">
              <div class="for">
                <p>只能擇一</p>
              </div>
              <div class="field">
                <div class="radio-row">
                  <label>
                    <input type="radio" v-model="column.rule.onlyOne" value="1" />
                    <span>是</span>
                  </label>
                  <label>
                    <input type="radio" v-model="column.rule.onlyOne" value="0" />
                    <span>否</span>
                  </label>
                </div>
              </div>
            </label>-->
          </div>
        </details>
        <!-- 客製化訊息 -->
        <details>
          <summary>客製化訊息</summary>
          <div class="block block--msg">
            <label class="input-row" v-if="column.rule.required === '1'">
              <div class="for">
                <p>是否必填</p>
              </div>
              <div class="field">
                <div class="input">
                  <input
                    type="text"
                    v-model="column.msg.required"
                    :placeholder="'[' + column.name + '] 為必填。'"
                  />
                </div>
              </div>
            </label>
            <label class="input-row" v-if="column.rule.sameAs">
              <div class="for">
                <p>與...相符</p>
              </div>
              <div class="field">
                <div class="input">
                  <input
                    type="text"
                    v-model="column.msg.sameAs"
                    :placeholder="'[' + column.name + '] 與 [' + column.rule.sameAs + '] 不相符'"
                  />
                </div>
              </div>
            </label>
            <label class="input-row" v-if="isInput && column.rule.minimum">
              <div class="for">
                <p>字元下限</p>
              </div>
              <div class="field">
                <div class="input">
                  <input
                    type="text"
                    v-model="column.msg.minimum"
                    :placeholder="'[' + column.name + '] 最少 :min 個字。'"
                  />
                </div>
              </div>
            </label>
            <label class="input-row" v-if="isInput && column.rule.maximum">
              <div class="for">
                <p>字元上限</p>
              </div>
              <div class="field">
                <div class="input">
                  <input
                    type="text"
                    v-model="column.msg.maximum"
                    :placeholder="'[' + column.name + '] 最多 :max 個字。'"
                  />
                </div>
              </div>
            </label>
            <label class="input-row" v-if="isInput && column.rule.regex">
              <div class="for">
                <p>驗證格式</p>
              </div>
              <div class="field">
                <div class="input">
                  <input
                    type="text"
                    v-model="column.msg.regex"
                    :placeholder="'[' + column.name + '] 格式驗證失敗。'"
                  />
                </div>
              </div>
            </label>
          </div>
        </details>
      </div>
    </form>
  </div>
</template>
<script>
module.exports = {
  props: ['column', 'idx'],
  data: function () {
    return {
      isOpen: false,
    };
  },
  computed: {
    columnType: function () {
      return [
        { value: 'text', text: '文字框 (text)' },
        { value: 'number', text: '數字框 (number)' },
        { value: 'select', text: '下拉選單 (select)' },
        { value: 'radio', text: '單選框 (radio)' },
        { value: 'checkbox', text: '勾選框 (checkbox)' },
      ];
    },
    isInput: function () {
      return this.column.type === 'text' || this.column.type === 'number';
    },
    needItems: function () {
      return this.column.type === 'select' || this.column.type === 'radio' || this.column.type === 'checkbox';
    },
    sourceMode: function () {
      return [
        { value: 'list', text: '手動設置' },
        { value: 'api', text: 'API' },
      ];
    },
    displayMode: function () {
      return [
        { value: 'line', text: 'Line by Line' },
        { value: 'next', text: 'Next to each others' },
        { value: 'bothSide', text: 'Stay on each sides in a row (Left - Right)' },
      ];
    },
  },
  methods: {
    addItem: function () {
      this.column.data.items.push({
        id: _uuid(),
        text: '',
        value: '',
      });
    },
    deleteItem: function (index) {
      this.column.data.items.splice(index, 1);
    },
    handleDelete: function () {
      var vm = this;
      util.modal
        .create({
          name: 'deleteCard',
          type: util.modal.TYPE.CONFIRM,
          title: '刪除欄位',
          msg: '確定刪除欄位?',
        })
        .then(function (modal) {
          modal.mainContent.children[1].children[0].textContent = '確定刪除欄位 #{idx} [{name}] ?'.format({
            idx: vm.idx + 1,
            name: vm.column.name ? vm.column.name : vm.column.id,
          });
          modal.onConfirm = function () {
            vm.$emit('delete', vm.idx);
          };
          modal.open();
        });
    },
    handleOpen: function () {
      this.isOpen = !this.isOpen;
    },
  },
};
</script>
