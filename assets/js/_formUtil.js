/*
  TODO:
  - 客製化表單(custom select)
  - 單向? 雙向?
  - 待處理物件
  - 創建 create()
*/

// 表單驗證
var formValidation = (function formValidation() {
  'use strict';

  // 驗證物件
  var validationObj = {
    // 模板
    temp: {
      form: null, // 表單
      settings: {}, // 配置設定
      conditionTriggers: {}, // 條件觸發器 (觸發檢查的元素ID:[被檢查的元素IDs])
      focusTarget: null, // 焦點目標
      waitProcess: [], // 等待處理
    },
  };

  // 驗證格式
  var regex = {
    email: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
    tel: /^09[0-9]{8}$/,
    date: /^((19|20)?[0-9]{2}[- /.](0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01]))*$/,
    password: /^(?=.*[a-zA-Z]+)(?=.*\d+)[a-zA-Z0-9]{8,16}$/,
    chinese: /^[\u4e00-\u9fa5]+$/,
  };

  /** 檢查包含
   * @param {(string|string[])} haystack - 雜草堆
   * @param {string} value - 欲檢查的值
   */
  function checkInclude(haystack, value) {
    return haystack.indexOf(value) >= 0;
  }
  /** 檢查包含 (滿足其一)
   * @param {(string|string[])} haystack - 雜草堆
   * @param {(string|string[])} arr - 欲檢查的值
   */
  function checkFindOne(haystack, arr) {
    if (Array.isArray(arr)) {
      return arr.some(function (value) {
        return checkInclude(haystack, value);
      });
    }
    return checkInclude(haystack, arr);
  }
  /** 檢查包含 (滿足全部)
   * @param {(string|string[])} haystack - 雜草堆
   * @param {(string|string[])} arr - 欲檢查的值
   */
  function checkFindAll(haystack, arr) {
    if (Array.isArray(arr)) {
      return arr.every(function (value) {
        return checkInclude(haystack, value);
      });
    }
    return checkInclude(haystack, arr);
  }
  /** 新增至陣列
   * @param {string[]} arr - 陣列
   * @param {string} value - 欲新增的值
   */
  function pushArray(arr, value) {
    if (!checkInclude(arr, value)) arr.push(value);
  }
  /** 新增至陣列
   * @param {Object} obj - 物件
   * @param {string} key - 主鍵
   * @param {string} value - 欲新增的值
   */
  function pushArrayByKey(obj, key, value) {
    obj[key] = obj[key] || [];
    pushArray(obj[key], value);
  }

  /** 設置表單元素值(單)
   * @param {Object} ele - 表單元素
   * @param {string} value - 欲設置的值
   */
  function setElementValue(ele, value) {
    switch (ele.type) {
      // 選單
      case 'select-multiple':
        for (var i = 0, opt; (opt = ele.options[i]); i++) {
          opt.selected = checkInclude(value, opt.value);
        }
      case 'select-one':
        for (var i = 0, opt; (opt = ele.options[i]); i++) {
          if (opt.value === value) {
            ele.selectedIndex = i;
            break;
          }
        }
        break;
      // 勾選框
      case 'checkbox':
        ele.checked = checkInclude(value, ele.value);
        break;
      // 單選框
      case 'radio':
        ele.checked = ele.value === value;
        break;
      // 其他
      default:
        ele.setAttribute('value', value);
        break;
    }
  }

  /** 取得表單元素(單|多)
   * @param {string} formID - 表單ID
   * @param {string} eleID - 元素ID
   */
  function getElement(formID, eleID) {
    return validationObj[formID].form.elements[eleID] || document.getElementById(eleID);
  }
  /** 取得表單元素值(單|多)
   * @param {string} formID - 表單ID
   * @param {string} eleID - 元素ID
   */
  function getElementValue(formID, eleID) {
    var ele = getElement(formID, eleID);
    var value;

    // 表單元素(多個) -- nodeList (radio, checkbox)
    if (!ele.nodeName && ele.length > 0) {
      value = [];
      [].forEach.call(ele, function (item) {
        if (item.checked) pushArray(value, item.value);
      });
    }
    // 表單元素(單個)
    else if (!!ele.type) {
      switch (ele.type) {
        case 'select-multiple':
          value = [];
          [].forEach.call(ele.options, function (opt) {
            if (opt.selected) pushArray(value, opt.value || opt.name);
          });
          break;
        case 'select-one':
        case 'checkbox':
        case 'radio':
        default:
          value = ele.value || getCheckedValue(formID, eleID);
          break;
      }
    }

    return value;
  }
  /** 取得表單元素值(被選取)
   * @param {string} formID - 表單ID
   * @param {string} name - 表單元素名
   */
  function getCheckedValue(formID, name) {
    var ele = validationObj[formID].form.querySelector("input[name='" + name + "']:checked");
    return (ele && ele.value) || null;
  }

  /** 切換目標的顯示樣式
   * @param {Object} target - 目標
   * @param {boolean} isShow - 是否顯示
   */
  function toggleShow(target, isShow) {
    isShow ? target.classList.remove('hide') : target.classList.add('hide');
  }
  /** 切換表單元素(單)的必填屬性
   * @param {Object} ele - 表單元素
   * @param {boolean} isRequired - 是否必填
   */
  function toggleRequired(ele, isRequired) {
    isRequired ? ele.setAttribute('required', 'required') : ele.removeAttribute('required');
  }
  /** 切換表單元素(單)的禁用屬性
   * @param {Object} ele - 表單元素
   * @param {boolean} isDisabled - 是否禁用
   */
  function toggleDisabled(ele, isDisabled) {
    isDisabled ? ele.setAttribute('disabled', 'disabled') : ele.removeAttribute('disabled');
  }
  /** 切換表單元素(單|多)的屬性
   * @param {Object} ele - 表單元素
   * @param {boolean} isPass - 是否通過
   * @param {string} [formID] - 表單ID
   * @param {string} [setID] - 配置ID(元素ID)
   */
  function toggleFunction(ele, isPass, formID, setID) {
    var isRequired = isPass;
    var isDisabled = !isPass;

    // 檢查[配置設定]
    if (!!formID && !!setID && isPass) {
      var setting = getAndCheckSetting(formID, setID);
      if (setting) {
        // 是否需要必填
        isRequired = !!(setting.rule && setting.rule.required);
        // TODO: 連動必填 (?)
        // requiredSync: [], // 連動必填元素 (如果自身有值，其對象必填)
        // requiredCheck: [], // 自身必填檢查
      }
    }

    // 表單元素(多個) -- nodeList (radio, checkbox)
    if (!ele.nodeName && ele.length > 0) {
      [].forEach.call(ele, function (item) {
        toggleRequired(item, isRequired);
        toggleDisabled(item, isDisabled);
      });
    }
    // 表單元素(單個)
    else if (!!ele.type) {
      toggleRequired(ele, isRequired);
      toggleDisabled(ele, isDisabled);
    }
  }

  /** 監聽多選框 只能選擇一個
   * @param {Object} target - 目標
   * @param {[]} group - 目標的兄弟們(含自己)
   */
  function selectOnlyOne(target, group) {
    // 如果選取，取消其他被選取
    if (target.checked) {
      [].forEach.call(group, function (item) {
        item.checked = item.value === target.value;
      });
    }

    return true;
  }
  /** 監聽多選框 至少一個被選取
   * @param {Object} target - 目標
   * @param {[]} group - 目標的兄弟們(含自己)
   */
  function selectLeastOne(target, group) {
    // 至少一個被選取
    var isLeastOne = !!target.checked;
    if (!isLeastOne) {
      for (var i = 0, item; (item = group[i]); i++) {
        if (item.checked) {
          isLeastOne = true;
          break;
        }
      }
    }

    // 有被選取，移除必填屬性；反之補上。
    [].forEach.call(group, function (item) {
      toggleRequired(item, !isLeastOne);
    });

    return isLeastOne;
  }

  /** 初始提示
   * @param {Object} ele - 表單元素
   */
  function initTips(ele) {
    var wrapper = ele.parentNode;
    var tips = wrapper.querySelector('.tips');

    if (tips) {
      // 移除提示
      wrapper.classList.remove('warn', 'success');
      wrapper.removeChild(tips);
      // wrapper.removeChild(ele.nextSibling);
      // wrapper.parentNode.removeChild(wrapper.nextSibling);
    }
  }
  /** 顯示提示
   * @param {Object} ele - 表單元素
   * @param {string} msg - 提示訊息
   */
  function showTips(ele, msg) {
    var wrapper = ele.parentNode;
    var tips = wrapper.querySelector('.tips');

    if (!tips) {
      // 產生提示
      var tips = document.createElement('p');
      tips.classList.add('tips');

      // 插入提示
      wrapper.classList.add('warn');
      wrapper.insertBefore(tips, ele.nextSibling);
      // wrapper.parentNode.insertBefore(tips, wrapper.nextSibling);
    }

    tips.innerHTML = msg;
  }

  /** 取得並檢查[配置設定]
   * @param {string} formID - 表單ID
   * @param {string} setID - 配置ID(元素ID)
   */
  function getAndCheckSetting(formID, setID) {
    // 配置設定不存在，新增至待處理
    if (!validationObj[formID].settings[setID]) pushArrayByKey(validationObj[formID], 'waitProcess', setID);
    // 返回配置設定，預設{}
    return (validationObj[formID].settings[setID] = validationObj[formID].settings[setID] || {});
  }

  /** 註冊表單驗證
   * @param {string} formID 表單ID
   * @param {Object} settings 配置設定json
   */
  function registerValidation(formID, settings) {
    var result = {
      isPass: false,
      errorMsg: '',
    };

    // 檢查參數
    if (!formID || !settings) {
      result.errorMsg = '[失敗]註冊表單驗證： 參數不存在。';
      return result;
    }
    // 檢查註冊
    if (!!validationObj[formID]) {
      result.errorMsg = '[失敗]註冊表單驗證： ' + formID + ' 已註冊驗證。';
      return result;
    }
    // 檢查表單
    var form = document.getElementById(formID);
    if (!form) {
      result.errorMsg = '[失敗]註冊表單驗證： ' + formID + ' 不存在。';
      return result;
    }

    // 註冊
    validationObj[formID] = JSON.parse(JSON.stringify(validationObj['temp']));
    validationObj[formID].form = form;
    validationObj[formID].settings = settings;

    result.isPass = true;

    return result;
  }
  /** 初始表單驗證
   * @param {string} formID 表單ID
   * @param {Object} settings 配置設定json
   */
  function init(formID, settings) {
    // 註冊表單驗證
    var result = registerValidation(formID, settings);
    if (!result.isPass) {
      console.log(result.errorMsg);
      return false;
    }

    // 處理有在[配置設定]內的元素
    [].forEach.call(Object.keys(validationObj[formID].settings), function (eleID) {
      process(formID, eleID);
    });

    // 初始檢查有在[觸發器]內的元素
    [].forEach.call(Object.keys(validationObj[formID].conditionTriggers), function (triggerID) {
      checkCondition(formID, triggerID);
    });

    console.log('[成功]初始表單驗證。', validationObj[formID]);
  }

  /** 處理配置設定
   * @param {string} formID - 表單ID
   * @param {string} eleID - 元素ID(配置ID)
   * @param {Object} [item] - 目標
   * @param {[]} [group] - 目標的兄弟們(含自己)
   */
  function process(formID, eleID, item, group) {
    // 檢查元素
    var ele = item || getElement(formID, eleID);
    if (!ele) {
      console.log('[失敗]處理配置設定： 元素不存在。');
      return false;
    }
    // 如果是 NodeList (radio, checkbox)
    if (!ele.nodeName && ele.length > 0) {
      [].forEach.call(ele, function (item) {
        console.log('- sub process. (eleID: %s)', eleID);
        process(formID, eleID, item, ele);
      });
      return false;
    }

    // console.log('process eleID:%s nodeName:%s type:%s', eleID, ele.nodeName, ele.type);

    // ----- Main -----
    var setting = getAndCheckSetting(formID, eleID);

    // 存在顯示條件
    if (setting.conditions) {
      // 驗證物件 新增條件觸發器 (觸發檢查的元素ID:[被檢查的元素ID])
      [].forEach.call(setting.conditions, function (condition) {
        pushArrayByKey(validationObj[formID].conditionTriggers, condition.triggerID, eleID);
      });
    }
    // 如果非表單元素 只記錄條件觸發器
    if (!ele.type) return true;
    // --------------------

    // 記錄 欄位名稱
    if (setting.name) ele.setAttribute('data-name', setting.name);
    // 設置 預設值
    if (setting.defaultValue) setElementValue(ele, setting.defaultValue);
    // 設置 提示文字
    if (setting.placeholder) ele.setAttribute('placeholder', setting.placeholder);
    // 設置 自動完成
    if (setting.autocomplete) ele.setAttribute('autocomplete', setting.autocomplete);

    // 存在規則
    if (setting.rule) {
      // TODO: 記錄 必填
      if (setting.rule.required) toggleRequired(ele, true);

      // 監聽檢查
      var checkListener = function (evt) {
        check(evt.target, formID, eleID);
      };

      // 選取監聽 (radio, checkbox)
      if (group) {
        // 選取檢查
        var selectCheck = function (target) {
          if (setting.rule.onlyOne) selectOnlyOne(target, group);
          if (setting.rule.required) selectLeastOne(target, group);
        };
        // 如有預設值，則初始執行[選取檢查]
        if (setting.defaultValue) selectCheck(ele);

        ele.addEventListener('change', function (evt) {
          selectCheck(evt.target);
          checkListener(evt);
        });
      }
      // 一般監聽
      else {
        switch (ele.type) {
          case 'select-multiple':
          case 'select-one':
          case 'checkbox':
          case 'radio':
            ele.addEventListener('change', checkListener);
            break;
          default:
            ele.addEventListener('input', checkListener);
            break;
        }
      }

      // 設置 相符元素的反向檢查
      if (setting.rule.sameAs) {
        // 相符元素的[配置設定] 新增反向檢查
        var targetSetting = getAndCheckSetting(formID, setting.rule.sameAs);
        pushArrayByKey(targetSetting, 'sameAsReverseCheck', eleID);
      }
    }

    // 設置 連動必填元素的必填檢查
    if (setting.requiredSync) {
      [].forEach.call(setting.requiredSync, function (targetID) {
        // 連動必填元素的[配置設定] 新增必填檢查
        var targetSetting = getAndCheckSetting(formID, targetID);
        pushArrayByKey(targetSetting, 'requiredCheck', eleID);
      });
    }
  }

  /** 檢查條件
   * @param {*} formID - 表單ID
   * @param {*} triggerID - 觸發器ID
   */
  function checkCondition(formID, triggerID) {
    // TODO: 跳過此輪已失敗的元素

    [].forEach.call(validationObj[formID].conditionTriggers[triggerID], function (targetID) {
      // 被觸發檢查的[目標物件]與[配置設定]
      var target = getElement(formID, targetID);
      var setting = getAndCheckSetting(formID, targetID);

      // 存在顯示條件 (須全部符合)
      if (target && setting.conditions) {
        var isPass = true;

        // 遍歷條件 不符合條件則跳出
        for (var i = 0, condition; (condition = setting.conditions[i]); i++) {
          // [目標物件]所要檢查的條件對象值
          var triggerValue = getElementValue(formID, condition.triggerID);

          // 檢查 findAll (滿足陣列全部條件)
          if (isPass && condition.findAll && !checkFindAll(condition.findAll, triggerValue)) {
            isPass = false;
            break;
          }
          // 檢查 findOne (滿足陣列其一條件)
          if (isPass && condition.findOne && !checkFindOne(condition.findOne, triggerValue)) {
            isPass = false;
            break;
          }
          // TODO: 其他條件檢查
        }

        console.log('checkCondition - targetID:%s, nodeName:%s', targetID, target.nodeName);

        // 切換屬性
        switch (target.nodeName) {
          // 欄位
          case 'INPUT':
          case 'SELECT':
            toggleShow(target.parentNode, isPass);
            toggleFunction(target, isPass, formID, targetID);
            break;
          // 區塊
          default:
            toggleShow(target, isPass);
            [].forEach.call(target.querySelectorAll('input, select'), function (el) {
              toggleFunction(el, isPass, formID, el.name || el.id);
            });
            break;
        }

        //TODO: 隱藏物件內的所有表單元素 設置為初始值，連動顯示條件檢查
      }
    });
  }

  /** 檢查規則
   * @param {Object} ele - 表單元素
   * @param {string} formID - 表單ID
   * @param {string} eleID - 元素ID[配置ID]
   */
  function check(ele, formID, eleID) {
    var allowNext = true; // 允許下一步
    var errorMsg = ''; // 錯誤訊息

    // 表單元素(多個) -- nodeList (radio, checkbox)
    if (!ele.nodeName && ele.length > 0) {
      for (var i = 0, item; (item = ele[i]); i++) {
        console.log('sub check', eleID);
        var result = check(item, formID, eleID);
        if (!result.isPass) {
          allowNext = false;
          errorMsg = result.errorMsg;
          break;
        }
      }

      return { isPass: allowNext, errorMsg: errorMsg };
    }
    // 如果非表單元素
    if (!ele.type) return { isPass: true, errorMsg: '' };

    // ----- Main -----
    var setting = validationObj[formID].settings[eleID];
    var eleValue = ele.value && ele.value.trim();

    // 確認是否必填
    var isRequired = ele.required || (setting.rule && setting.rule.required);
    if (!isRequired && setting.requiredCheck) {
      for (var i = 0, tempID; (tempID = setting.requiredCheck[i]); i++) {
        var temp = getElement(formID, tempID);
        if (temp && temp.value) {
          isRequired = true;
          break;
        }
      }
    }

    // 如果是 [必填] 或 [有資料]，進行驗證。
    if (isRequired || eleValue.length > 0) {
      var name = setting.name || eleID;
      var rule = setting.rule || {};
      var customMsg = setting.msg || {};

      // 必填
      if (allowNext && isRequired) {
        switch (ele.type) {
          case 'radio':
            console.log('check required - radio:', ele.value, ele.checked);
            break;
          case 'checkbox':
            console.log('check required - checkbox:', ele.value, ele.checked);
            // if (!el.checked) {
            //   errorMsg = customMsg.required || '[' + name + '] 未勾選。';
            //   allowNext = false;
            // }
            break;
          default:
            if (eleValue.length === 0) {
              errorMsg = customMsg.required || '[' + name + '] 為必填。';
              allowNext = false;
            }
            break;
        }
      }

      // 長度限制
      if (allowNext) {
        var min = rule.minimum;
        var max = rule.maximum;

        if (min && eleValue.length < min) {
          errorMsg = customMsg.minimum || '[' + name + '] 最少' + min + '個字。';
          allowNext = false;
        } else if (max && eleValue.length > max) {
          errorMsg = customMsg.maximum || '[' + name + '] 最多' + max + '個字。';
          allowNext = false;
        }
      }

      // 驗證Regex
      if (allowNext && rule.regex) {
        if (!rule.regex.test(eleValue)) {
          errorMsg = customMsg.regex || '[' + name + '] 格式驗證失敗。';
          allowNext = false;
        }
      }

      // 相等
      if (allowNext && rule.sameAs) {
        var sameAsTarget = getElement(formID, rule.sameAs);
        if (sameAsTarget && sameAsTarget.value !== eleValue) {
          var sameAsTargetName = sameAsTarget.dataset.name || rule.sameAs;
          errorMsg = customMsg.sameAs || '[' + name + '] 與 [' + sameAsTargetName + '] 不相符。';
          allowNext = false;
        }
      }
    }

    // 驗證未通過
    if (!allowNext) {
      showTips(ele, errorMsg);
      // 記錄需要焦點的目標欄位(第一個警告)
      if (!validationObj[formID].focusTarget) {
        validationObj[formID].focusTarget = ele;
      }

      //console.log('驗證未通過', errorMsg);
    }
    // 驗證通過
    else {
      initTips(ele);
      // 取消已通過的焦點目標
      if (validationObj[formID].focusTarget === ele) {
        validationObj[formID].focusTarget = null;
      }

      // 反向相符檢查
      if (setting.sameAsReverseCheck) {
        console.log('反向相符檢查', eleID, setting.sameAsReverseCheck);
        [].forEach.call(setting.sameAsReverseCheck, function (targetID) {
          var target = getElement(formID, targetID);
          if (target) check(target, formID, targetID);
        });
      }

      // 連動必填檢查
      if (setting.requiredSync) {
        console.log('連動必填檢查', eleID, setting.requiredSync);
        [].forEach.call(setting.requiredSync, function (targetID) {
          var target = getElement(formID, targetID);
          if (target) check(target, formID, targetID);
        });
      }
    }

    // 觸發檢查
    if (checkInclude(Object.keys(validationObj[formID].conditionTriggers), eleID)) {
      checkCondition(formID, eleID);
    }

    return { isPass: allowNext, errorMsg: errorMsg };
  }

  /** 驗證表單
   * @param {string} formID - 表單ID
   * @param {string} [lineFeed='\r\n'] - 換行符號
   */
  function validation(formID, lineFeed) {
    if (!validationObj[formID]) {
      return { isPass: false, errorMsg: '[失敗]驗證表單： ' + formID + ' 不存在。' };
    }

    var errorCount = 0;
    var errorMsg = '';
    var lineFeed = lineFeed || '\r\n';

    // 驗證[配置設定]
    [].forEach.call(Object.keys(validationObj[formID].settings), function (eleID) {
      var ele = getElement(formID, eleID);
      if (ele) {
        var result = check(ele, formID, eleID);
        if (!result.isPass) {
          errorCount++;
          errorMsg += result.errorMsg + lineFeed;
        }
      }
    });

    // 設置焦點
    if (validationObj[formID].focusTarget) {
      validationObj[formID].focusTarget.focus();
      validationObj[formID].focusTarget = null;
    }

    return { isPass: errorCount !== 0, errorMsg: errorMsg };
  }

  /** 序列化表單
   * @param {string}} formID - 表單ID (驗證物件識別碼)
   */
  function serialize(formID) {
    var form = validationObj[formID].form;
    var serialized = [];

    for (var i = 0, field; (field = form.elements[i]); i++) {
      // Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields
      if (
        !field.name ||
        field.disabled ||
        field.type === 'file' ||
        field.type === 'reset' ||
        field.type === 'submit' ||
        field.type === 'button'
      )
        continue;

      // If a multi-select, get all selections
      if (field.type === 'select-multiple') {
        for (var n = 0; n < field.options.length; n++) {
          if (!field.options[n].selected) continue;
          serialized.push(encodeURIComponent(field.name) + '=' + encodeURIComponent(field.options[n].value));
        }
      }
      // Convert field data to a query string
      else if ((field.type !== 'checkbox' && field.type !== 'radio') || field.checked) {
        serialized.push(encodeURIComponent(field.name) + '=' + encodeURIComponent(field.value));
      }
    }

    return serialized.join('&');
  }

  function getSettings(formID) {
    return validationObj[formID].settings;
  }
  function getTriggers(formID) {
    return validationObj[formID].conditionTriggers;
  }
  function getWaitProcess(formID) {
    return validationObj[formID].waitProcess;
  }

  return {
    regex: regex,
    init: init,
    validation: validation,
    serialize: serialize,
    getSettings: getSettings,
    getTriggers: getTriggers,
    getWaitProcess: getWaitProcess,
  };
})();
