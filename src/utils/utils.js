/**
 * 월,일 등 숫자 앞에 0 붙이기
 * @param   num     앞에 0을 붙일 숫자 값
 * @param   digit   글자의 자릿수를 지정 ( 2자릿수인 경우 00, 3자릿수인 경우 000 … )
 */
export const autoLeftPad = (num, digit) => {
    if (String(num).length < digit) {
      num = new Array(digit - String(num).length + 1).join("0") + num;
    }
    return num;
  };
  