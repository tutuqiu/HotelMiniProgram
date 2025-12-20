const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * 将小程序的API封装成支持Promise的API
 * @params fn {Function} 小程序原始API，如wx.login
 */
const wxPromisify = fn => {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res)
      }

      obj.fail = function (res) {
        reject(res)
      }

      fn(obj)
    })
  }
}

const calDayCount=(checkInDate,checkOutDate)=>{
  const start=new Date(checkInDate)
  const end =new Date(checkOutDate)

  start.setHours(0,0,0,0)
  end.setHours(0,0,0,0)

  const msCount=end.getTime()-start.getTime()
  const dayCount=Math.floor(msCount/(24*60*60*1000))

  return dayCount
}

function genIdempotencyKey(prefix = 'order') {
  // 时间 + 随机，足够用于幂等键
  const ts = Date.now().toString(16)
  const rnd = uuidv4Like()
  return `${prefix}_${ts}_${rnd}`
}

// UUID v4-like（不依赖外部库）
function uuidv4Like() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function validatePhone(phone){
  // 1. 校验：是否为空
  if (!phone) {
    return "请输入手机号"
  }

  // 2. 校验：是否以1开头
  if (!/^1/.test(phone)) {
    return "手机号必须以1开头"
  }

  // 3. 补充校验：是否为11位数字（手机号基础规则）
  if (phone.length !== 11) {
    return "请输入11位有效手机号"
  }
  return null
}

export{
  formatTime,wxPromisify,calDayCount,genIdempotencyKey,validatePhone
}
