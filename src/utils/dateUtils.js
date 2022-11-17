export function getDateStr(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var strDate = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  month = month > 9 ? month : '0' + month
  strDate = strDate > 9 ? strDate : '0' + strDate
  hour = hour > 9 ? hour : '0' + hour
  minute = minute > 9 ? minute : '0' + minute
  second = second > 9 ? second : '0' + second
  return (
    year +
    '-' +
    month +
    '-' +
    strDate +
    ' ' +
    hour +
    ':' +
    minute +
    ':' +
    second
  )
}

export function getDateYYMMDD(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var strDate = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  month = month > 9 ? month : '0' + month
  strDate = strDate > 9 ? strDate : '0' + strDate
  hour = hour > 9 ? hour : '0' + hour
  minute = minute > 9 ? minute : '0' + minute
  second = second > 9 ? second : '0' + second
  return year + month + strDate
}
