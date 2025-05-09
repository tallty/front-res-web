export function useFmtNumber() {
  function thousandSeparator(amount: number) {
    return amount.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }

  function amountToChinese(amount: number) {
    const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    const units = ['', '拾', '佰', '仟'];
    const largeUnits = ['', '万', '亿'];

    let [integerPart, decimalPart] = String(amount).split('.');

    // 处理整数部分
    let chineseInteger = '';
    let zeroFlag = false; // 标记是否有多余的零
    let length = integerPart.length;

    for (let i = 0; i < length; i++) {
      const digit = parseInt(integerPart[i]);
      const unit = units[(length - i - 1) % 4];
      const largeUnit = largeUnits[Math.floor((length - i - 1) / 4)];

      if (digit === 0) {
        if (!zeroFlag && i !== length - 1) {
          chineseInteger += digits[digit];
          zeroFlag = true;
        }
      } else {
        chineseInteger += digits[digit] + unit;
        zeroFlag = false;
      }

      if ((length - i - 1) % 4 === 0 && zeroFlag) {
        chineseInteger = chineseInteger.slice(0, -1); // 去掉多余的零
        zeroFlag = false;
      }

      if ((length - i - 1) % 4 === 0 && chineseInteger.length > 0) {
        chineseInteger += largeUnit;
      }
    }

    if (chineseInteger === '') {
      chineseInteger = '零';
    }

    chineseInteger += '元';

    // 处理小数部分
    let chineseDecimal = '';
    if (decimalPart) {
      const jiao = parseInt(decimalPart[0]);
      const fen = parseInt(decimalPart[1]);

      if (jiao > 0) {
        chineseDecimal += digits[jiao] + '角';
      }
      if (fen > 0) {
        chineseDecimal += digits[fen] + '分';
      }
    } else {
      chineseDecimal = '整';
    }

    if (!decimalPart || parseInt(decimalPart) === 0) {
      chineseDecimal = '整';
    }

    return chineseInteger + chineseDecimal;
  }

  return {
    thousandSeparator,
    amountToChinese,
  };
}
