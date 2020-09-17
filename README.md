#  FormValidation 表單驗證

### 想法
- 透過JSON配置，簡化/統一表單欄位設定
- 監聽檢查、連動檢查，可用於複雜表單
- JSON可前/後端共用(後端驗證模組另外寫)


### TODO
- [ ] 待處理物件
- [ ] 客製化表單(custom select)
- [ ] 創建 create()

### Usage

```js
formValidation.init(formID, settingJson);
```

#### 驗證資料模板
```js
var settingJson = {
  demo: {
    text: 'DEMO', // 文字說明
    type: 'text', // 欄位屬性
    defaultValue: null, // 預設值
    placeholder: null, // 提示訊息
    autocomplete: null, // 自動完成
    // 規則
    rule: {
      required: false, // 必填
      minimum: null, // 字元下限
      maximum: null, // 字元上限
      regex: null, // 驗證格式
      equality: null, // 與..相符
      onlyOne: false, // 只能選擇一個 [多選框選項]
    },
    // 客製化訊息 (取代規則預設訊息)
    msg: {
      required: null,
      minimum: null,
      maximum: null,
      regex: null,
      equality: null,
      onlyOne: null,
    },
    // 顯示條件
    conditions: [
      {
        triggerID: 'babyNum',
        findOne: ['1', '2', '3', '4'], // 滿足其一
        findAll: ['1', '2', '3', '4'], // 滿足全部
        // other...
      },
      // multiple..
    ],
    // 其他檢查設定
    requiredSync: [], // 連動必填元素 (如果自身有值，其元素必填)
    requiredCheck: [], // 自身必填檢查 (來自其他元素的 requiredSync)
    equalityReverseCheck: [], // 反向相符檢查 元素值是否相符 (來自其他元素的 rule.equality)
  },
}
```
